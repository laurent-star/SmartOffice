# Mapping runtime (multi-source → canonical domains)

This document summarizes how to map heterogeneous tools (Monday, CRM, Drive, etc.) into Smart Office canonical domains.

## Goals
- Provide a single canonical schema per domain (client, prospect, project, document, task).
- Use declarative mapping files per source/domain pair.
- Keep onboarding simple with repeatable steps and minimal custom code.

## Registry layout
- `registries/domain/`: canonical domain definitions with required fields and types.
- `registries/mappings/_templates/`: starting templates for new mappings.
- `registries/mappings/<source>/<domain>.yaml`: concrete mappings (e.g., Monday → project, HubSpot → prospect, Drive → document).

## Sequential onboarding flow
1. **Discover source schema**: list fields/columns for the source collection (board, pipeline, drive files, etc.).
2. **Draft mapping file**: copy `_templates/template.yaml`, set `source`, `domain`, and describe the collection/board.
3. **Fill field correspondences**: map each canonical field, set converters (enum map, date, coalesce) and fallbacks.
4. **Dry-run validation**: run a workflow/tool that fetches sample payloads and checks required/enum fields against the domain definition.
5. **Iterate interactively**: if a field is unmapped, prompt the operator (CLI/chat) to choose the source field or default value.
6. **Finalize and version**: commit the mapping file and update onboarding notes for the source.
7. **Enable sync**: plug the mapping step into the fetch → map → persist workflow for the domain.

## Runtime components
- `engine/mapping/mapper.js`: loads a mapping YAML and applies it to payloads (supports enum_map, date_iso, normalize_array, concat, coalesce, converter registry with `id`/`use`).
- `engine/mapping/validators.js`: validates mapped entities against canonical domain definitions (required + enum values + basic shapes).
- `engine/mapping/detectors.js`: reports coverage gaps (required fields not mapped) and unknown mapping targets.
- `engine/mapping/converters.js`: centralizes built-in converters.

### CLI helper for onboarding
Use `node scripts/mapping_lint.js <mapping.yaml> <domain.yaml> [sample.json]` to:
- check that all required fields of the domain are mapped;
- flag mapping targets that do not exist in the domain definition;
- optionally map a sample payload and surface validation errors.

Additional modes:
- `node scripts/mapping_lint.js --ci` scans every mapping under `registries/mappings` and fails with a non-zero exit code when required targets are missing, unknown targets are present, or sample validation fails.
- `node scripts/mapping_lint.js --interactive <mapping> <domain> [sample]` prompts for missing required targets (TTY only) and writes the updated mapping file with deterministic ordering.

### Integration in workflows (fetch → map → persist)
1. Fetch raw data from the source (tool-specific workflow).
2. Apply `mapPayloadToDomain` with the proper mapping file.
3. Validate with `validateEntity` before persisting or routing.
4. Monitor drift with `detectors` (e.g., missing required targets) and alert on failures.

## Notes
- Prefer declarative converters (enum_map, date_iso, normalize_array, concat) before adding custom hooks.
- Keep mappings minimal to reduce maintenance when source schemas change.
- Align validations with `registries/domain/` required fields so downstream use cases stay consistent.

## Onboarding assets
- Samples for dry-run: see `samples/<source>/payload.example.json` (Monday, HubSpot, Drive, Slack, Gmail, Google Calendar, Google Docs, Axonaut, Brevo).
- Checklists: `docs/onboarding/*.checklist.md` provide per-source prerequisites, conventions and troubleshooting.
- Mapping lint in CI: `.github/workflows/mapping-lint.yml` runs `npm run lint:mappings` on pull requests.
- Local commands: `npm run lint:mappings` for non-interactive lint, `npm run test:mapping` for runtime tests, and `node scripts/mapping_lint.js --interactive ...` for assisted completion.
