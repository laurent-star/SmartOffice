# Copilot Instructions — Smart Office

This project follows a strict architecture.

## Architecture rules (DO NOT BREAK)

- Tools are atomic and API-bound
- Capabilities are declarative, cross-tools, and reusable
- Use cases are compositions of capabilities
- Workflows must not contain business logic
- All executions go through a standard envelope
- Schemas in /contracts are the source of truth

## Expectations for suggestions

- Prefer configuration over workflows
- Prefer composition over duplication
- Do not introduce new layers unless strictly necessary
- Keep bootstrap minimal
- Avoid premature abstractions

## When proposing changes

- Check consistency with contracts
- Validate against existing schemas
- Prefer backward-compatible improvements
- When validating locally with Ajv, note that some contracts now expose `"$id"` (URI). Use `scripts/validate_contracts_preload.js` to preload schemas into Ajv before validation to avoid `$ref` resolution errors.

Example:

```bash
npm install --prefix . ajv@8 ajv-formats --save-dev
NODE_PATH=./node_modules node scripts/validate_contracts_preload.js
```
