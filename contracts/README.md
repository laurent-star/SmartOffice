# Contracts — Smart Office

This folder contains JSON Schemas that define the stable interfaces of the system.
These schemas are the source of truth for runtime validation.

## Files

- capability.schema.json
- envelope.schema.json
- memory.schema.json
- result.schema.json
- step.schema.json
- tool-call.schema.json
- tool-input.schema.json
- tool-result.schema.json
- usecase.schema.json

## Validation

Use `scripts/validate_contracts_preload.js` to validate examples in `formats/`.
