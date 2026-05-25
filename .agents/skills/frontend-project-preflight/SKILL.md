---
name: frontend-project-preflight
description: Runs a CodeGraph-backed preflight analysis for frontend repositories before architecture, refactor, documentation, or feature-generation work. Use when the user asks to inspect a project, map its architecture, identify technologies, summarize Angular components/services, generate project knowledge maps, or prepare context for skills such as clean-architecture.
metadata:
  author: bhd
  version: "1.0"
  category: analysis
---

Before anything else, check whether `preflight-results/preflight-map.json` exists in the project root. If it exists, ask the user whether to reuse it. If it does not exist, run this skill's generator.

# Frontend Project Preflight

Analyze a frontend repository before generating code or documentation. The main output is written to `preflight-results/` so other skills can reuse it.

## When to use

Use for:
- Analyzing the structure, technology stack, architecture, or conventions of a frontend project.
- Preparing project context before using `clean-architecture`.
- Creating a concise technical repository map in JSON and HTML.
- Identifying relevant Angular components, services, use cases, repositories, mappers, and modules.

Do not use for:
- Implementing features.
- Refactoring code.
- Documenting a specific user story from commits.

## Required workflow

1. Confirm the target path. If the user does not provide one, use the current working directory.
2. Read [references/codegraph.md](references/codegraph.md).
3. Never run `codegraph preflight`. That command is not part of the official CodeGraph CLI. If CodeGraph is installed but that command is missing, continue with this skill's generator; do not ask the user to search documentation or reuse old results just because `codegraph preflight` is unavailable.

The preflight is generated only by this repository script:

```bash
node .agents/skills/frontend-project-preflight/scripts/generate-preflight-map.js <project-path>
```

4. Verify CodeGraph:

```bash
codegraph --version
```

5. If CodeGraph is not installed, ask the user in English:

```text
I cannot find CodeGraph installed. Do you want me to install it so I can pre-index the project before the analysis?
```

If the user approves, install it with:

```bash
npm install -g @colbymchenry/codegraph
```

Then rerun `codegraph --version`.

6. Run the generator. The generator will call the official CodeGraph commands internally when CodeGraph is available: `codegraph init <path> --index`, `codegraph index <path>`, `codegraph status <path>`, `codegraph files <path>`, and `codegraph context <task>`.

```bash
node .agents/skills/frontend-project-preflight/scripts/generate-preflight-map.js <project-path>
```

7. Only use filesystem fallback if the user declines installation or installation fails:

```bash
node .agents/skills/frontend-project-preflight/scripts/generate-preflight-map.js <project-path> --allow-fallback
```

8. Review the generated files:
   - `preflight-results/preflight-map.json`
   - `preflight-results/preflight-map.html`
9. Summarize the findings in English, briefly and technically.

## Output contract

The skill must create or update:

```text
preflight-results/
├── preflight-map.json
└── preflight-map.html
```

Use [references/result-schema.md](references/result-schema.md) for the expected JSON sections.

## Analysis rules

- Prefer CodeGraph index data over broad filesystem guesses.
- Inspect `package.json`, workspace config, aliases, `apps/`, `libs/`, and source folders.
- Detect architecture patterns: Clean Architecture, feature modules, layered modules, monorepo, Module Federation, shared libraries.
- For Angular projects, include important modules, components, services, use cases, repositories, mappers, guards, interceptors, stores and effects when present.
- Always create visual flow artifacts. Do not ask the user if they want the visual flow, sequence diagram, flow diagram, HTML, or JSON. They are mandatory outputs.
- Include Mermaid sequence and flow diagrams as source in JSON and rendered blocks in HTML.
- Every generated diagram must be as detailed as possible while staying readable, and must reflect the real project structure discovered from files: apps, libs, shell/app entrypoint, routes, remotes, shared libraries, state/store, services, use cases, repositories, and external integrations when present.
- Avoid generic diagrams. If the repository has concrete projects, modules, routes or libraries, the diagram must name them directly.
- The HTML must prioritize project structure, technologies, conventions, projects, routes, components/pages, services/use cases, layers, shared libraries and Module Federation when present.
- Runtime flow steps must explicitly describe the mechanisms detected in the analyzed project. For example: local routing, lazy loading via `loadChildren`/`loadComponent`, Module Federation remotes/manifests, NgRx Store/Effects, direct services, use cases, repositories, HTTP clients, storage, SDKs, or any equivalent pattern detected in another framework.
- Do not leave runtime flow steps generic when project evidence exists. If a mechanism is not detected, say so with project-specific wording instead of assuming it.
- If no explicit architecture pattern is detected with enough evidence, add a final `Suggested Architecture` section to the HTML and JSON with the architecture type that could fit the analyzed project and a short reason why.
- Keep the result concise. This is a map, not full documentation.
- Do not modify source code.

## Integration with other skills

When another skill needs repo context, first check:

```text
preflight-results/preflight-map.json
```
