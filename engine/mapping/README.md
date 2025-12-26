# Mapping engine (runtime)

Minimal runtime utilities to apply declarative mappings (in `registries/mappings/`) to raw payloads and validate them against canonical domain definitions (in `registries/domain/`).

## Modules
- `converters.js` : built-in converters (enum map, date ISO, concat, coalesce, normalize array).
- `mapper.js` : load a mapping YAML, resolve converters, extract values from payloads, and produce canonical entities.
- `validators.js` : load domain definitions and validate mapped entities (required fields, enum values, primitive shapes).
- `detectors.js` : coverage checks (required fields not mapped) and schema drift helpers.

## CLI helper
`scripts/mapping_lint.js` provides a quick way to:
- load a mapping file + domain definition,
- report coverage of required fields,
- optionally apply the mapping to a sample payload and surface validation errors.

Example:
```bash
node scripts/mapping_lint.js registries/mappings/monday/project.yaml registries/domain/project.yaml sample/project.json
```

Outputs a short report with coverage, mapped entity preview, and validation errors (if any).
