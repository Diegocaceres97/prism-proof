# CodeGraph Usage

This skill uses CodeGraph to pre-index project knowledge before producing the map.

Important: do not run `codegraph preflight`. That command is not part of the official CodeGraph CLI and may not exist in installed CodeGraph versions. CodeGraph is used only for indexing/context commands; the preflight artifacts are produced by:

```bash
node .agents/skills/frontend-project-preflight/scripts/generate-preflight-map.js <project-path>
```

## Commands

Verify installation:

```bash
codegraph --version
```

Install when missing, only after user approval:

```bash
npm install -g @colbymchenry/codegraph
```

Initialize and index:

```bash
codegraph init <project-path> --index
```

Re-index existing projects:

```bash
codegraph index <project-path>
```

Check status:

```bash
codegraph status <project-path>
```

Read indexed file structure:

```bash
codegraph files <project-path> --format grouped --json
```

Build task context:

```bash
cd <project-path>
codegraph context "project preflight architecture technology services components" --format json
```

Official CLI reference commands used by this skill:

```text
codegraph init [path]
codegraph index [path]
codegraph status [path]
codegraph files [path]
codegraph context <task>
```

## Missing CodeGraph behavior

If CodeGraph is not installed:

1. Ask the user if they want to install it.
2. If approved, run `npm install -g @colbymchenry/codegraph`.
3. If declined or installation fails, generate the map with `--allow-fallback` and mark:

```json
{
  "codegraph": {
    "available": false,
    "fallbackUsed": true
  }
}
```

## Result location

All generated artifacts must be written under:

```text
preflight-results/
```

The generated map must always include:

- JSON architecture map.
- HTML architecture map.
- Mermaid sequence diagram.
- Mermaid flow diagram.

Do not ask whether to create the visual flow; it is part of the required output.

## Diagram detail rules

All diagrams must be detailed and project-specific:

- Use real project names from `apps/`, `libs/`, `angular.json`, `nx.json`, or `project.json`.
- Show the shell/app entrypoint when detected.
- Show concrete remotes or lazy modules when Module Federation or lazy routing exists.
- Show shared libraries and their roles when present.
- Show state/store/effects and service/use-case/repository layers when detected.
- Show external API/storage/SDK boundaries when inferred from service or data-access files.
- Avoid placeholder-only diagrams such as `Apps -> Presentation -> Application` when concrete modules are available.
