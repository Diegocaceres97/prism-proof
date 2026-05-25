#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MAX_FILES = 40000;
const MAX_TABLE_ROWS = 120;
const IGNORE_DIRS = new Set([
  '.git',
  '.codegraph',
  '.angular',
  '.nx',
  'node_modules',
  'dist',
  'coverage',
  'preflight-results',
  'tmp',
  'temp',
  '.cache'
]);

const args = process.argv.slice(2);
const projectPath = path.resolve(args.find(arg => !arg.startsWith('--')) || process.cwd());
const skipIndex = args.includes('--skip-index');
const forceIndex = args.includes('--force-index');
const allowFallback = args.includes('--allow-fallback');
const outputDir = path.join(projectPath, 'preflight-results');

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: projectPath,
    encoding: 'utf8',
    shell: false,
    maxBuffer: 1024 * 1024 * 30,
    ...options
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function safeJson(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function readJson(filePath) {
  return safeJson(read(filePath));
}

function rel(filePath) {
  return path.relative(projectPath, filePath).replace(/\\/g, '/');
}

function abs(relativePath) {
  return path.join(projectPath, relativePath);
}

function walk(dir, files = []) {
  if (files.length >= MAX_FILES || !fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (files.length >= MAX_FILES) break;
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else files.push(fullPath);
  }

  return files;
}

function groupDeps(packageJson) {
  return {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.peerDependencies || {})
  };
}

function pick(deps, map) {
  return Object.fromEntries(
    Object.entries(map)
      .filter(([, packageName]) => deps[packageName])
      .map(([label, packageName]) => [label, deps[packageName]])
  );
}

function detectTechnologies(packageJson) {
  const deps = groupDeps(packageJson);
  const engines = packageJson.engines || {};

  return {
    runtime: {
      node: engines.node || '',
      npm: engines.npm || '',
      typescript: deps.typescript || ''
    },
    framework: pick(deps, {
      angular: '@angular/core',
      react: 'react',
      vue: 'vue',
      svelte: 'svelte',
      ionic: '@ionic/angular',
      capacitor: '@capacitor/core',
      nx: 'nx',
      moduleFederation: '@nx/module-federation'
    }),
    state: pick(deps, {
      ngrxStore: '@ngrx/store',
      ngrxEffects: '@ngrx/effects',
      redux: 'redux',
      reduxToolkit: '@reduxjs/toolkit',
      zustand: 'zustand',
      pinia: 'pinia',
      rxjs: 'rxjs'
    }),
    http: pick(deps, {
      angularCommon: '@angular/common',
      bhdDataAccess: '@bhd/data-access',
      tsoDataAccess: '@bhd-teseo/tso-data-access',
      axios: 'axios',
      ky: 'ky'
    }),
    testing: pick(deps, {
      jest: 'jest',
      jestPresetAngular: 'jest-preset-angular',
      karma: 'karma',
      jasmine: 'jasmine-core',
      vitest: 'vitest',
      cypress: 'cypress',
      playwright: '@playwright/test'
    }),
    uiAndBhd: pick(deps, {
      bhdAngular: '@bhd/angular',
      bhdConfig: '@bhd/config',
      bhdFeatureFlags: '@bhd/feature-flags',
      bhdStorage: '@bhd/storage-web',
      ngxTranslate: '@ngx-translate/core'
    }),
    tooling: pick(deps, {
      eslint: 'eslint',
      prettier: 'prettier',
      webpack: 'webpack',
      swc: '@swc/core'
    }),
    other: pick(deps, {
      zod: 'zod',
      lodash: 'lodash',
      cryptoJs: 'crypto-js',
      logrocket: 'logrocket',
      msalAngular: '@azure/msal-angular'
    })
  };
}

function projectNameFromRoot(root) {
  if (!root || root === '.') return path.basename(projectPath);
  return root.split('/').filter(Boolean).pop();
}

function discoverProjects(files) {
  const projects = new Map();
  const nx = readJson(abs('nx.json')) || {};
  const angular = readJson(abs('angular.json')) || {};

  for (const [name, config] of Object.entries(angular.projects || {})) {
    const root = normalizeRoot(config.root || '');
    projects.set(root || '.', {
      name,
      root: root || '.',
      type: config.projectType || 'application',
      sourceRoot: config.sourceRoot || joinRoot(root, 'src'),
      targets: Object.keys(config.architect || config.targets || {}),
      tags: []
    });
  }

  for (const file of files.filter(file => rel(file).endsWith('project.json'))) {
    const config = readJson(file) || {};
    const root = normalizeRoot(path.dirname(rel(file)));
    projects.set(root, {
      name: config.name || projectNameFromRoot(root),
      root,
      type: config.projectType || inferProjectType(root),
      sourceRoot: config.sourceRoot || joinRoot(root, 'src'),
      targets: Object.keys(config.targets || {}),
      tags: config.tags || []
    });
  }

  for (const dir of ['apps', 'libs']) {
    const dirPath = abs(dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const root = `${dir}/${entry.name}`;
      if (!projects.has(root)) {
        projects.set(root, {
          name: entry.name,
          root,
          type: dir === 'apps' ? 'application' : 'library',
          sourceRoot: joinRoot(root, 'src'),
          targets: [],
          tags: []
        });
      }
    }
  }

  if (!projects.size) {
    projects.set('.', {
      name: angular.defaultProject || nx.defaultProject || path.basename(projectPath),
      root: '.',
      type: 'application',
      sourceRoot: fs.existsSync(abs('src')) ? 'src' : '.',
      targets: [],
      tags: []
    });
  }

  return Array.from(projects.values()).sort((a, b) => a.root.localeCompare(b.root));
}

function normalizeRoot(root) {
  return (root || '.').replace(/\\/g, '/').replace(/\/$/, '') || '.';
}

function joinRoot(root, child) {
  return root && root !== '.' ? `${root}/${child}` : child;
}

function inferProjectType(root) {
  if (root.startsWith('libs/')) return 'library';
  return 'application';
}

function ownerProject(fileRel, projects) {
  const sorted = [...projects].sort((a, b) => b.root.length - a.root.length);
  return sorted.find(project => {
    if (project.root === '.') return true;
    return fileRel === project.root || fileRel.startsWith(`${project.root}/`);
  }) || projects[0];
}

function filesForProject(filesRel, project) {
  if (project.root === '.') return filesRel.filter(file => file.startsWith('src/') || !file.startsWith('apps/') && !file.startsWith('libs/'));
  return filesRel.filter(file => file.startsWith(`${project.root}/`));
}

function countMatches(projectFiles) {
  const count = regex => projectFiles.filter(file => regex.test(file)).length;
  return {
    components: count(/\.component\.ts$|\.page\.ts$/),
    modules: count(/\.module\.ts$/),
    routes: count(/routes?\.ts$/),
    services: count(/\.service\.ts$/),
    useCases: count(/use-cases?\/.*\.ts$|use-case.*\.ts$|.*use-case\.ts$/),
    repositories: count(/repositor(y|ies)\/.*\.ts$|.*repository.*\.ts$/),
    mappers: count(/mapper(s)?\/.*\.ts$|.*mapper.*\.ts$/),
    entities: count(/entit(y|ies)\/.*\.ts$|entities\/.*\.ts$/),
    dtos: count(/dto\/.*\.ts$|dtos\/.*\.ts$|.*\.dto\.ts$/),
    specs: count(/\.spec\.ts$/),
    styles: count(/\.(scss|css|sass|less)$/),
    templates: count(/\.html$/),
    storeFiles: count(/(store|state|reducer|selector|action|effect)s?\/.*\.ts$|\.reducer\.ts$|\.selectors\.ts$|\.actions\.ts$|\.effect\.ts$/)
  };
}

function parseComponent(fileRel) {
  const text = read(abs(fileRel)).slice(0, 12000);
  const className = match(text, /export\s+class\s+([A-Za-z0-9_]+)/) || path.basename(fileRel, '.ts');
  const selector = match(text, /selector\s*:\s*['"`]([^'"`]+)['"`]/) || '';
  const standalone = /standalone\s*:\s*true/.test(text);
  return { name: className, selector, standalone, file: fileRel };
}

function parseRoutes(fileRel) {
  const text = read(abs(fileRel)).slice(0, 25000);
  const entries = [];
  const pathRegex = /path\s*:\s*['"`]([^'"`]*)['"`]/g;
  let routeMatch;
  while ((routeMatch = pathRegex.exec(text))) {
    const start = Math.max(0, routeMatch.index - 300);
    const end = Math.min(text.length, routeMatch.index + 700);
    const block = text.slice(start, end);
    entries.push({
      path: routeMatch[1] || '/',
      component: match(block, /component\s*:\s*([A-Za-z0-9_]+)/),
      lazy: /loadChildren|loadComponent/.test(block),
      redirectTo: match(block, /redirectTo\s*:\s*['"`]([^'"`]+)['"`]/),
      guarded: /canActivate|canMatch|canLoad/.test(block)
    });
  }
  return { file: fileRel, entries };
}

function parseModuleFederation(fileRel) {
  const text = read(abs(fileRel)).slice(0, 25000);
  const name = match(text, /name\s*:\s*['"`]([^'"`]+)['"`]/) || projectNameFromRoot(path.dirname(fileRel));
  const exposes = [];
  const exposeRegex = /['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g;
  let exposeMatch;
  const exposesBlock = match(text, /exposes\s*:\s*\{([\s\S]*?)\}/);
  if (exposesBlock) {
    while ((exposeMatch = exposeRegex.exec(exposesBlock))) {
      exposes.push({ alias: exposeMatch[1], target: exposeMatch[2] });
    }
  }
  const remotesBlock = match(text, /remotes\s*:\s*\[([\s\S]*?)\]/);
  const remotes = remotesBlock
    ? Array.from(remotesBlock.matchAll(/['"`]([^'"`]+)['"`]/g)).map(item => item[1])
    : [];
  return { file: fileRel, name, exposes, remotes };
}

function match(text, regex) {
  const result = text.match(regex);
  return result ? result[1] : null;
}

function layerInventory(filesRel, projects) {
  const layerNames = ['domain', 'application', 'infrastructure', 'infraestructure', 'presentation', 'shared', 'core', 'store', 'data-access'];
  return layerNames
    .map(layer => {
      const matches = filesRel.filter(file => file.split('/').includes(layer) || (layer === 'store' && /store|reducer|selector|effect|action/.test(file)));
      return {
        layer,
        files: matches.length,
        projects: unique(matches.map(file => ownerProject(file, projects)?.root).filter(Boolean)).slice(0, MAX_TABLE_ROWS)
      };
    })
    .filter(layer => layer.files > 0);
}

function detectConventions(filesRel, projects, technologies, layers) {
  const conventions = [];
  if (projects.some(project => project.root.startsWith('apps/')) || projects.some(project => project.root.startsWith('libs/'))) {
    conventions.push('Workspace projects are organized under apps/ and shared libraries under libs/.');
  }
  if (projects.some(project => project.root === '.') && filesRel.some(file => file.startsWith('src/app/'))) {
    conventions.push('Single-workspace Angular application with primary source code under src/app.');
  }
  if (layers.some(layer => layer.layer === 'domain') && layers.some(layer => layer.layer === 'application')) {
    conventions.push('Architecture layers are detected through folders such as domain, application, infrastructure, and presentation.');
  }
  if (layers.some(layer => layer.layer === 'infraestructure')) {
    conventions.push('The infraestructure naming variant exists; preserve this convention where it is already present.');
  }
  if (filesRel.some(file => file.endsWith('.module.ts'))) {
    conventions.push('NgModules are used through *.module.ts files.');
  }
  if (filesRel.some(file => file.endsWith('.routes.ts') || file.endsWith('app-routing.module.ts'))) {
    conventions.push('Routing is separated into *.routes.ts or app-routing.module.ts files.');
  }
  if (filesRel.some(file => file.endsWith('.page.ts'))) {
    conventions.push('Angular/Ionic pages use the *.page.ts suffix.');
  }
  if (technologies.state.ngrxStore) {
    conventions.push('Centralized state uses NgRx Store; review actions, reducers, selectors, and effects before changing flows.');
  }
  if (filesRel.some(file => file.includes('module-federation'))) {
    conventions.push('Module Federation is configured through module-federation.config.* files and remote manifests.');
  }
  if (filesRel.some(file => file.endsWith('.spec.ts'))) {
    conventions.push('Unit tests are colocated with source code using the *.spec.ts suffix.');
  }
  return conventions;
}

function architectureAssessment(filesRel, projects, technologies, layers, manifests) {
  const hasCleanLayers = ['domain', 'application'].every(name => layers.some(layer => layer.layer === name))
    && layers.some(layer => layer.layer === 'infrastructure' || layer.layer === 'infraestructure')
    && layers.some(layer => layer.layer === 'presentation');
  const hasFeatureFolders = filesRel.some(file => /(^|\/)(features?|modules?)\//.test(file)) || projects.some(project => /feature/.test(project.root));
  const hasAppsAndLibs = projects.some(project => project.root.startsWith('apps/')) && projects.some(project => project.root.startsWith('libs/'));
  const hasLayerFolders = layers.some(layer => ['core', 'shared', 'data-access', 'store'].includes(layer.layer));
  const hasModuleFederation = manifests.length || filesRel.some(file => file.includes('module-federation'));
  const detected = [];

  if (hasCleanLayers) detected.push({ name: 'Clean Architecture', reason: 'The repository contains domain, application, infrastructure, and presentation-style folders.' });
  if (hasModuleFederation) detected.push({ name: 'Micro Frontend Architecture', reason: 'Module Federation configuration or remote manifests were detected.' });
  if (hasAppsAndLibs) detected.push({ name: 'Modular Monorepo', reason: 'The workspace separates applications under apps/ and shared libraries under libs/.' });
  if (hasFeatureFolders) detected.push({ name: 'Feature-based Architecture', reason: 'Feature or module folders were detected in the source tree.' });

  const recommendations = [];
  if (!detected.length) {
    if (hasAppsAndLibs || hasLayerFolders) {
      recommendations.push({
        name: 'Modular Layered Architecture',
        why: 'The project already shows shared/core/data-access/store boundaries, so a lightweight layered model would formalize dependencies without forcing a full rewrite.'
      });
    }
    if (hasFeatureFolders || technologies.state.ngrxStore) {
      recommendations.push({
        name: 'Feature-Sliced Frontend Architecture',
        why: 'Feature folders and centralized state benefit from grouping UI, state, services, and models by business capability.'
      });
    }
    if (projects.length > 1 || hasModuleFederation) {
      recommendations.push({
        name: 'Micro Frontend / Modular Monorepo Architecture',
        why: 'Multiple projects or remote boundaries suggest independent deployment and ownership boundaries around applications or vertical slices.'
      });
    }
    recommendations.push({
      name: 'Clean Architecture for Business-Critical Modules',
      why: 'Use it selectively where business rules, DTO mapping, repositories, and use cases need framework-independent boundaries.'
    });
  }

  return {
    detected,
    hasExplicitArchitecture: detected.some(item => item.name === 'Clean Architecture' || item.name === 'Micro Frontend Architecture'),
    recommendations: recommendations.slice(0, 4)
  };
}

function notableSharedLibraries(projects, filesRel) {
  const libs = projects.filter(project => project.type === 'library' || project.root.startsWith('libs/'));
  const sharedFolders = filesRel
    .filter(file => /(^|\/)(shared|core|common|utils|services|components)(\/|$)/.test(file))
    .map(file => file.split('/').slice(0, 3).join('/'));

  return unique([
    ...libs.map(lib => lib.root),
    ...sharedFolders
  ]).slice(0, MAX_TABLE_ROWS).map(root => ({
    root,
    role: inferLibraryRole(root)
  }));
}

function inferLibraryRole(root) {
  if (/ui|component/.test(root)) return 'Shared UI and reusable components';
  if (/store|state/.test(root)) return 'Shared state';
  if (/data|api|access/.test(root)) return 'Data access and external services';
  if (/feature/.test(root)) return 'Shared use cases, helpers, or features';
  if (/shared|common|utility|utils/.test(root)) return 'Shared types, utilities, and constants';
  return 'Shared library or folder';
}

function projectImports(projectFiles) {
  const imports = new Set();
  for (const file of projectFiles.filter(file => file.endsWith('.ts')).slice(0, 600)) {
    const text = read(abs(file)).slice(0, 16000);
    for (const importMatch of text.matchAll(/from\s+['"`]([^'"`]+)['"`]/g)) {
      const value = importMatch[1];
      if (value.startsWith('@') || /^[a-z0-9_-]+\/(Module|Routes)/i.test(value)) imports.add(value);
    }
  }
  return Array.from(imports).sort().slice(0, 25);
}

function buildProjects(projects, filesRel) {
  const mfByRoot = new Map();
  for (const file of filesRel.filter(file => /module-federation\.config\.(ts|js)$/.test(file))) {
    const owner = ownerProject(file, projects);
    mfByRoot.set(owner.root, parseModuleFederation(file));
  }

  return projects.map(project => {
    const projectFiles = filesForProject(filesRel, project);
    const routeFiles = projectFiles.filter(file => /routes?\.ts$|app-routing\.module\.ts$/.test(file));
    const componentFiles = projectFiles.filter(file => /\.component\.ts$|\.page\.ts$/.test(file));
    return {
      ...project,
      moduleFederation: mfByRoot.get(project.root) || null,
      routes: routeFiles.map(parseRoutes).filter(route => route.entries.length).slice(0, 20),
      components: componentFiles.map(parseComponent).slice(0, 40),
      importsFromWorkspace: projectImports(projectFiles),
      counts: countMatches(projectFiles)
    };
  });
}

function loadManifests(filesRel) {
  return filesRel
    .filter(file => /module-federation\.manifest\.json$/.test(file))
    .map(file => ({ file, remotes: readJson(abs(file)) || {} }))
    .slice(0, MAX_TABLE_ROWS);
}

function buildFlows(projects, filesRel, manifests) {
  const shell = projects.find(project => project.name === 'shell') || projects.find(project => /shell/.test(project.name));
  const firstApp = projects.find(project => project.type === 'application') || projects[0];
  const routeEvidence = filesRel.filter(file => /app\.routes\.ts$|app-routing\.module\.ts$|routes\.ts$|navigation|view-id|app-routes/.test(file)).slice(0, 30);
  const stateEvidence = filesRel.filter(file => /\.effect\.ts$|\.actions\.ts$|\.reducer\.ts$|\.selectors\.ts$|store\//.test(file)).slice(0, 30);
  const remotes = unique(manifests.flatMap(manifest => Object.keys(manifest.remotes || {}))).slice(0, 12);
  const lazyRoutes = projects.flatMap(project =>
    (project.routes || []).flatMap(route =>
      route.entries.filter(entry => entry.lazy).map(entry => ({
        project: project.name,
        path: entry.path,
        file: route.file
      }))
    )
  ).slice(0, 12);
  const sharedLibs = projects
    .filter(project => project.type === 'library' || project.root.startsWith('libs/'))
    .slice(0, 10);
  const routedProjects = projects
    .filter(project => project.routes?.some(route => route.entries.length))
    .slice(0, 12);
  const layeredProjects = projects
    .filter(project => project.counts.useCases || project.counts.repositories || project.counts.services)
    .slice(0, 10);
  const appName = shell?.name || firstApp?.name || 'App';
  const hasUseCases = layeredProjects.some(project => project.counts.useCases);
  const hasRepositories = layeredProjects.some(project => project.counts.repositories);
  const hasServices = layeredProjects.some(project => project.counts.services);
  const routeMode = remotes.length
    ? `Module Federation remotes (${remotes.slice(0, 5).join(', ')})`
    : lazyRoutes.length
      ? `lazy loaded routes (${lazyRoutes.slice(0, 5).map(route => `${route.project}:${route.path}`).join(', ')})`
      : routedProjects.length
        ? `local route files (${routedProjects.slice(0, 5).map(project => project.name).join(', ')})`
        : 'the detected application entrypoint without explicit route evidence';
  const dataMode = [
    stateEvidence.length ? 'NgRx/store files' : '',
    hasUseCases ? 'use cases' : '',
    hasRepositories ? 'repositories' : '',
    hasServices ? 'services' : ''
  ].filter(Boolean).join(', ') || 'direct component-level data access was not clearly detected';

  const sequence = [
    'sequenceDiagram',
    '  participant User',
    `  participant ${safeMermaidId(appName)}`,
    '  participant Router',
    ...(remotes.length ? ['  participant RemoteMFE'] : []),
    ...(stateEvidence.length ? ['  participant Store'] : []),
    ...(hasUseCases ? ['  participant UseCases'] : []),
    ...(hasRepositories ? ['  participant Repositories'] : []),
    ...(hasServices ? ['  participant Services'] : []),
    ...(sharedLibs.length ? ['  participant SharedLibs'] : []),
    '  participant External',
    '  User->>' + safeMermaidId(appName) + ': Opens the application',
    `  ${safeMermaidId(appName)}->>Router: Resolves ${routeMode}`,
    ...(remotes.length ? ['  Router->>RemoteMFE: Loads configured remote entry from manifest/module-federation config', '  RemoteMFE-->>Router: Returns exposed module or component'] : []),
    ...(lazyRoutes.length ? ['  Router->>Router: Loads route chunk through loadChildren/loadComponent'] : []),
    ...(stateEvidence.length ? ['  Router->>Store: Selects or dispatches flow state through detected store files', '  Store-->>Router: Returns updated state'] : []),
    ...(hasUseCases ? ['  Router->>UseCases: Executes the active feature use case'] : []),
    ...(hasRepositories ? [`  ${hasUseCases ? 'UseCases' : 'Router'}->>Repositories: Requests data through repository contracts or adapters`] : []),
    ...(hasServices ? [`  ${hasRepositories ? 'Repositories' : hasUseCases ? 'UseCases' : 'Router'}->>Services: Delegates data access to detected services`] : []),
    ...(sharedLibs.length && hasServices ? ['  Services->>SharedLibs: Uses shared libraries and utilities'] : []),
    ...(hasServices ? ['  Services->>External: Calls APIs, storage, or external SDKs when configured', '  External-->>Services: Returns response', '  Services-->>User: Provides data for the rendered view'] : ['  Router-->>User: Renders the detected component/page structure'])
  ].join('\n');

  const flow = [
    'flowchart TD',
    `  Start["${mermaidLabel('Application start')}"]`,
    `  Start-->Shell["${mermaidLabel(appName)}"]`,
    `  Shell-->Routes["${mermaidLabel(routeMode)}"]`,
    ...routedProjects.map(project => `  Routes-->Route_${safeMermaidId(project.name)}["${mermaidLabel(project.name)}"]`),
    ...(remotes.length ? [`  Routes-->MF["${mermaidLabel('Module Federation remotes')}"]`, ...remotes.slice(0, 10).map(remote => `  MF-->Remote_${safeMermaidId(remote)}["${mermaidLabel(remote)}"]`)] : []),
    ...(lazyRoutes.length ? [`  Routes-->Lazy["${mermaidLabel('Lazy route chunks via loadChildren/loadComponent')}"]`, ...lazyRoutes.slice(0, 10).map(route => `  Lazy-->Lazy_${safeMermaidId(route.project + route.path)}["${mermaidLabel(`${route.project}: ${route.path}`)}"]`)] : []),
    ...(stateEvidence.length ? [`  Routes-->State["${mermaidLabel('NgRx/store state files')}"]`] : []),
    ...layeredProjects.map(project => `  Route_${safeMermaidId(project.name)}-->Layer_${safeMermaidId(project.name)}["${mermaidLabel(`${project.name}: services/use cases/repositories`)}"]`),
    ...(sharedLibs.length ? [`  Shell-->Shared["${mermaidLabel('Shared libraries')}"]`, ...sharedLibs.map(project => `  Shared-->Lib_${safeMermaidId(project.name)}["${mermaidLabel(project.name)}"]`)] : []),
    `  Routes-->Components["${mermaidLabel('Components / pages')}"]`,
    `  Components-->Business["${mermaidLabel(dataMode)}"]`,
    `  Business-->External["${mermaidLabel('APIs / storage / SDKs')}"]`
  ].join('\n');

  return {
    overview: remotes.length
      ? `The application resolves navigation from ${appName} and loads configured Module Federation remotes: ${remotes.join(', ')}.`
      : lazyRoutes.length
        ? `The application resolves Angular routes and uses lazy loading through loadChildren/loadComponent for routes such as ${lazyRoutes.slice(0, 6).map(route => `${route.project}:${route.path}`).join(', ')}.`
        : `The application resolves detected local routes from ${routedProjects.map(project => project.name).join(', ') || appName} and delegates business/data work through ${dataMode}.`,
    sequenceMermaid: sequence,
    flowMermaid: flow,
    runtimeSteps: [
      `The user enters through ${appName}, using the detected application or shell bootstrap.`,
      `Routing is resolved through ${routeMode}.`,
      lazyRoutes.length
        ? `Lazy loading is explicitly detected through loadChildren/loadComponent in ${lazyRoutes.slice(0, 6).map(route => route.file).join(', ')}.`
        : 'No lazy loading evidence was detected in the scanned route entries.',
      remotes.length
        ? `Module Federation remotes are loaded from detected manifests/configuration: ${remotes.join(', ')}.`
        : 'No Module Federation remotes were detected for this project.',
      `Business and data flow uses ${dataMode}.`,
      'External boundaries are inferred from detected service/data-access files and may include APIs, storage, or SDK integrations.'
    ],
    viewRouteGroups: projects
      .flatMap(project => project.routes.flatMap(route => route.entries.map(entry => ({
        project: project.name,
        routeFile: route.file,
        path: entry.path,
        component: entry.component,
        lazy: entry.lazy
      }))))
      .slice(0, MAX_TABLE_ROWS),
    evidenceFiles: unique([...routeEvidence, ...stateEvidence, ...manifests.map(manifest => manifest.file)]).slice(0, MAX_TABLE_ROWS)
  };
}

function safeMermaidId(value) {
  return String(value || 'App').replace(/[^A-Za-z0-9_]/g, '_') || 'App';
}

function mermaidLabel(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\n/g, ' ');
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function codegraphData() {
  const available = run('codegraph', ['--version']).ok;
  const result = {
    available,
    fallbackUsed: !available,
    status: null,
    files: null,
    context: null,
    errors: []
  };

  if (!available) {
    if (!allowFallback) {
      console.error('CodeGraph is not installed or not available in PATH.');
      console.error('Ask the user if they want to install it, then run: npm install -g @colbymchenry/codegraph');
      console.error('If the user declines or install fails, rerun with --allow-fallback.');
      process.exit(2);
    }
    return result;
  }

  if (!skipIndex) {
    const codegraphDir = path.join(projectPath, '.codegraph');
    const indexResult = !fs.existsSync(codegraphDir)
      ? run('codegraph', ['init', projectPath, '--index'])
      : run('codegraph', ['index', projectPath, ...(forceIndex ? ['--force'] : [])]);
    if (!indexResult.ok) {
      result.errors.push(indexResult.stderr || indexResult.stdout);
      result.fallbackUsed = true;
    }
  }

  const statusResult = run('codegraph', ['status', projectPath]);
  if (statusResult.ok) result.status = safeJson(statusResult.stdout, statusResult.stdout.trim());
  else result.errors.push(statusResult.stderr || statusResult.stdout);

  const filesResult = run('codegraph', ['files', projectPath, '--format', 'grouped', '--json']);
  if (filesResult.ok) result.files = safeJson(filesResult.stdout, filesResult.stdout.trim());
  else result.errors.push(filesResult.stderr || filesResult.stdout);

  const contextResult = run('codegraph', [
    'context',
    'frontend architecture map routes components services conventions technologies',
    '--format',
    'json'
  ]);
  if (contextResult.ok) result.context = safeJson(contextResult.stdout, contextResult.stdout.trim());
  else result.errors.push(contextResult.stderr || contextResult.stdout);

  return result;
}

function buildSummary(packageJson, projects, filesRel, manifests) {
  return {
    packageName: packageJson.name || path.basename(projectPath),
    version: packageJson.version || '',
    defaultProject: (readJson(abs('nx.json')) || {}).defaultProject || (readJson(abs('angular.json')) || {}).defaultProject || '',
    projectCount: projects.length,
    appCount: projects.filter(project => project.type === 'application' || project.root.startsWith('apps/')).length,
    libCount: projects.filter(project => project.type === 'library' || project.root.startsWith('libs/')).length,
    moduleFederationProjectCount: projects.filter(project => project.moduleFederation).length,
    totalFilesScanned: filesRel.length,
    totalTypeScriptFiles: filesRel.filter(file => file.endsWith('.ts')).length,
    componentCount: sum(projects, project => project.counts.components),
    serviceCount: sum(projects, project => project.counts.services),
    routeCount: sum(projects, project => project.counts.routes),
    manifestCount: manifests.length
  };
}

function sum(items, getter) {
  return items.reduce((total, item) => total + (getter(item) || 0), 0);
}

function buildMap() {
  const packageJson = readJson(abs('package.json')) || {};
  const nx = readJson(abs('nx.json')) || {};
  const tsconfig = readJson(abs('tsconfig.base.json')) || readJson(abs('tsconfig.json')) || {};
  const files = walk(projectPath).map(rel);
  const rawProjects = discoverProjects(files.map(abs));
  const projects = buildProjects(rawProjects, files);
  const manifests = loadManifests(files);
  const technologies = detectTechnologies(packageJson);
  const layers = layerInventory(files, rawProjects);
  const conventions = detectConventions(files, rawProjects, technologies, layers);
  const flows = buildFlows(projects, files, manifests);
  const architecture = architectureAssessment(files, rawProjects, technologies, layers, manifests);
  const codegraph = codegraphData();

  return {
    generatedAt: new Date().toISOString(),
    workspace: projectPath,
    summary: buildSummary(packageJson, projects, files, manifests),
    technologies,
    scripts: packageJson.scripts || {},
    nx: {
      defaultProject: nx.defaultProject || '',
      defaultBase: nx.defaultBase || '',
      targetDefaults: Object.keys(nx.targetDefaults || {}),
      namedInputs: Object.keys(nx.namedInputs || {}),
      generators: nx.generators || {}
    },
    tsconfigPaths: tsconfig.compilerOptions?.paths || {},
    manifests,
    layers,
    architecture,
    projects,
    conventions,
    notableSharedLibraries: notableSharedLibraries(rawProjects, files),
    flows,
    codegraph: {
      available: codegraph.available,
      fallbackUsed: codegraph.fallbackUsed,
      status: codegraph.status,
      errors: codegraph.errors.filter(Boolean).slice(0, 5)
    },
    codegraphContext: codegraph.context
  };
}

function renderHtml(map) {
  const pill = value => `<span class="pill">${escapeHtml(String(value))}</span>`;
  const pills = obj => Object.entries(obj || {}).map(([key, value]) => pill(`${key} ${value}`)).join(' ');
  const countPills = counts => Object.entries(counts || {}).filter(([, value]) => value).map(([key, value]) => pill(`${key} ${value}`)).join(' ');
  const projectRows = map.projects.slice(0, MAX_TABLE_ROWS).map(project => `
    <tr>
      <td><b>${escapeHtml(project.name)}</b><br><small>${escapeHtml(project.root)}</small></td>
      <td>${escapeHtml(project.type)}</td>
      <td>${project.moduleFederation ? `MF: ${escapeHtml(project.moduleFederation.name)}<br>${project.moduleFederation.exposes.map(expose => `${escapeHtml(expose.alias)} -> <code>${escapeHtml(expose.target)}</code>`).join('<br>')}` : '-'}</td>
      <td>${countPills(project.counts)}</td>
      <td>${(project.importsFromWorkspace || []).slice(0, 12).map(pill).join(' ')}</td>
    </tr>`).join('');

  const componentSections = map.projects
    .filter(project => project.components?.length)
    .slice(0, 30)
    .map(project => `
      <h3>${escapeHtml(project.name)}</h3>
      <table><tr><th>Name</th><th>Selector</th><th>Standalone</th><th>File</th></tr>
      ${project.components.slice(0, 35).map(component => `
        <tr><td>${escapeHtml(component.name)}</td><td>${escapeHtml(component.selector || '-')}</td><td>${component.standalone ? 'yes' : 'no'}</td><td><code>${escapeHtml(component.file)}</code></td></tr>
      `).join('')}
      </table>
    `).join('');

  const routeRows = map.projects.flatMap(project =>
    project.routes.flatMap(route =>
      route.entries.map(entry => `
        <tr><td>${escapeHtml(project.name)}</td><td><code>${escapeHtml(route.file)}</code></td><td>${escapeHtml(entry.path)}</td><td>${escapeHtml(entry.component || '-')}</td><td>${entry.lazy ? 'yes' : 'no'}</td><td>${entry.guarded ? 'yes' : 'no'}</td></tr>
      `)
    )
  ).slice(0, MAX_TABLE_ROWS).join('');

  const layerRows = map.layers.map(layer => `
    <tr><td>${escapeHtml(layer.layer)}</td><td>${layer.files}</td><td>${layer.projects.map(pill).join(' ')}</td></tr>
  `).join('');
  const detectedArchitectureRows = (map.architecture?.detected || []).map(item => `
    <tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.reason)}</td></tr>
  `).join('');
  const recommendationRows = (map.architecture?.recommendations || []).map(item => `
    <tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.why)}</td></tr>
  `).join('');
  const architectureRecommendationSection = map.architecture && !map.architecture.hasExplicitArchitecture
    ? `<section id="architecture-recommendations"><h2>Suggested Architecture</h2>
        <p>No explicit architecture pattern was detected with enough evidence. Based on the project structure, these options could fit:</p>
        <table><tr><th>Architecture</th><th>Why it could apply</th></tr>${recommendationRows}</table>
      </section>`
    : '';

  const manifestSections = map.manifests.map(manifest => `
    <h3>${escapeHtml(manifest.file)}</h3>
    <pre>${escapeHtml(JSON.stringify(manifest.remotes, null, 2))}</pre>
  `).join('') || '<p>N/A</p>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Frontend Architecture Preflight Map</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;color:#17202a;background:#f6f8fa}
    header{background:#102a43;color:white;padding:28px 36px}
    main{padding:24px 36px;max-width:1500px;margin:auto}
    section{background:white;border:1px solid #d8dee4;border-radius:8px;padding:18px;margin:16px 0}
    h1,h2,h3{margin:0 0 12px}
    table{border-collapse:collapse;width:100%;font-size:13px}
    th,td{border:1px solid #d8dee4;padding:8px;vertical-align:top}
    th{background:#eef2f6;text-align:left}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
    .card{border:1px solid #d8dee4;border-radius:8px;padding:14px;background:#fbfcfd}
    .pill{display:inline-block;border:1px solid #c9d1d9;border-radius:999px;padding:2px 8px;margin:2px;background:#f6f8fa;font-size:12px}
    code,pre{background:#f6f8fa;border-radius:6px}
    pre{padding:12px;overflow:auto}
    .toc a{display:inline-block;margin:4px 10px 4px 0;color:#0969da}
  </style>
</head>
<body>
<header>
  <h1>Frontend Architecture Preflight Map</h1>
  <p>${escapeHtml(map.workspace)}</p>
  <p>Generated: ${escapeHtml(map.generatedAt)} | CodeGraph: ${map.codegraph.available ? 'available' : 'fallback'}</p>
</header>
<main>
  <section class="grid">
    <div class="card"><h2>${map.summary.projectCount}</h2><p>Projects</p></div>
    <div class="card"><h2>${map.summary.appCount}</h2><p>Applications</p></div>
    <div class="card"><h2>${map.summary.libCount}</h2><p>Libraries</p></div>
    <div class="card"><h2>${map.summary.componentCount}</h2><p>Components / Pages</p></div>
    <div class="card"><h2>${map.summary.serviceCount}</h2><p>Services</p></div>
    <div class="card"><h2>${map.summary.totalTypeScriptFiles}</h2><p>TypeScript files</p></div>
  </section>
  <section class="toc">
    <h2>Contents</h2>
    <a href="#tech">Technology</a><a href="#conventions">Conventions</a><a href="#projects">Projects</a><a href="#flow">Runtime Flow</a><a href="#routes">Routes</a><a href="#components">Components</a><a href="#layers">Layers</a><a href="#mf">Module Federation</a><a href="#architecture-recommendations">Suggested Architecture</a>
  </section>
  <section id="tech">
    <h2>Technology</h2>
    <table><tr><th>Area</th><th>Packages</th></tr>
      ${Object.entries(map.technologies).map(([area, values]) => `<tr><td>${escapeHtml(area)}</td><td>${pills(values)}</td></tr>`).join('')}
    </table>
  </section>
  <section id="conventions"><h2>Detected Conventions</h2><ul>${map.conventions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
  <section id="projects"><h2>Projects</h2><table><tr><th>Project</th><th>Type</th><th>Module Federation</th><th>Inventory</th><th>Workspace imports</th></tr>${projectRows}</table></section>
  <section id="flow">
    <h2>Runtime Flow</h2>
    <p>${escapeHtml(map.flows.overview)}</p>
    <h3>Steps</h3><ol>${map.flows.runtimeSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    <h3>Sequence diagram</h3><pre class="mermaid">${escapeHtml(map.flows.sequenceMermaid)}</pre>
    <h3>Flow diagram</h3><pre class="mermaid">${escapeHtml(map.flows.flowMermaid)}</pre>
    <h3>Evidence</h3><ul>${map.flows.evidenceFiles.map(file => `<li><code>${escapeHtml(file)}</code></li>`).join('')}</ul>
  </section>
  <section id="routes"><h2>Routes and Lazy Loading</h2><table><tr><th>Project</th><th>File</th><th>Path</th><th>Component</th><th>Lazy</th><th>Guarded</th></tr>${routeRows}</table></section>
  <section id="components"><h2>Main Components and Pages</h2>${componentSections || '<p>N/A</p>'}</section>
  <section id="layers"><h2>Architecture Layers</h2><table><tr><th>Layer</th><th>Files</th><th>Projects</th></tr>${layerRows}</table></section>
  <section><h2>Detected Architecture Signals</h2><table><tr><th>Pattern</th><th>Evidence</th></tr>${detectedArchitectureRows || '<tr><td colspan="2">No explicit architecture pattern detected.</td></tr>'}</table></section>
  <section id="mf"><h2>Module Federation Manifests</h2>${manifestSections}</section>
  <section><h2>Notable Shared Libraries / Folders</h2><table><tr><th>Root</th><th>Inferred role</th></tr>${map.notableSharedLibraries.map(item => `<tr><td><code>${escapeHtml(item.root)}</code></td><td>${escapeHtml(item.role)}</td></tr>`).join('')}</table></section>
  ${architectureRecommendationSection}
</main>
<script type="module">import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs"; mermaid.initialize({startOnLoad:true,theme:"default"});</script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function main() {
  if (!fs.existsSync(projectPath)) {
    console.error(`Project path does not exist: ${projectPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const map = buildMap();

  fs.writeFileSync(path.join(outputDir, 'preflight-map.json'), `${JSON.stringify(map, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'preflight-map.html'), renderHtml(map));

  console.log(`Preflight map generated: ${path.join(outputDir, 'preflight-map.json')}`);
  console.log(`Preflight HTML generated: ${path.join(outputDir, 'preflight-map.html')}`);
}

main();
