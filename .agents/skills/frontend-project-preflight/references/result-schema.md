# Result Schema

`preflight-results/preflight-map.json` should follow this shape:

```json
{
  "generatedAt": "ISO_DATE",
  "workspace": "ABSOLUTE_REPO_PATH",
  "summary": {
    "packageName": "",
    "version": "",
    "defaultProject": "",
    "projectCount": 0,
    "appCount": 0,
    "libCount": 0,
    "moduleFederationProjectCount": 0,
    "totalFilesScanned": 0,
    "totalTypeScriptFiles": 0
  },
  "codegraph": {
    "available": true,
    "fallbackUsed": false,
    "status": {}
  },
  "technologies": {
    "runtime": {},
    "framework": {},
    "state": {},
    "http": {},
    "testing": {},
    "uiAndBhd": {},
    "tooling": {},
    "other": {}
  },
  "scripts": {},
  "nx": {},
  "tsconfigPaths": {},
  "manifests": [],
  "layers": [],
  "architecture": {
    "detected": [],
    "hasExplicitArchitecture": false,
    "recommendations": []
  },
  "projects": [],
  "conventions": [],
  "notableSharedLibraries": [],
  "flows": {
    "overview": "",
    "sequenceMermaid": "",
    "flowMermaid": "",
    "runtimeSteps": [],
    "viewRouteGroups": [],
    "evidenceFiles": []
  }
}
```

Rules:
- Keep arrays short and high signal.
- Include paths relative to the project root.
- Do not include full file contents.
- Use standard English descriptions in summaries, questions, labels, runtime steps, diagram text, and generated HTML.
- Runtime steps must identify the concrete project mechanisms detected instead of using generic wording. Mention lazy loading, Module Federation, local routes, state management, services, use cases, repositories, HTTP clients, storage, SDKs, or equivalent framework-specific mechanisms only when supported by project evidence.
- If no explicit architecture pattern is detected with enough evidence, include final architecture recommendations in JSON and HTML. Each recommendation must include the architecture name and a brief project-specific reason.
