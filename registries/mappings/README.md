# Mapping registry (sources -> canonical domains)

This folder hosts declarative mappings that normalize external tools (Monday, CRM, Drive…) into the canonical domains stored in `registries/domain`. Each mapping file describes how to transform source fields into canonical fields, including conversions, defaults and validation hints.

## Structure

- `registries/domain/`: canonical domain schemas that list required fields and types.
- `registries/mappings/_templates/`: reusable templates to start a new mapping.
- `registries/mappings/<source>/<domain>.yaml`: declarative mapping for a source/domain pair.

## Conventions

- Prefer declarative mapping files; only use hooks/custom converters when unavoidable.
- Keep mappings minimal and close to the source fields for easier maintenance.
- Version mappings explicitly so changes can be tracked across onboardings.
- Align required fields with the canonical domain definitions.

## Suggested workflow

1. Inspect the source API to list fields/columns.
2. Copy an appropriate template from `_templates/` and fill in the field correspondences.
3. Validate the mapping against sample payloads (dry-run) before enabling sync.
4. Commit the mapping file so onboarding steps remain reproducible.
