# Contracts — Smart Office

Ce dossier contient les schemas JSON qui definissent les interfaces stables
du systeme. Ces schemas sont la source de verite pour la validation runtime.

## Fichiers

- capability.schema.json
- envelope.schema.json
- memory.schema.json
- result.schema.json
- step.schema.json
- agent-planning.schema.json
- agent-tool-selection.schema.json
- tool-call.schema.json
- tool-definition.schema.json
- workflow-agent.schema.json
- workflow-executor.schema.json
- workflow-golden.schema.json
- workflow-tool.schema.json
- workflow-trigger.schema.json
- workflow-utils.schema.json
- tool-input.schema.json
- tool-result.schema.json
- usecase.schema.json

## Validation

Utiliser scripts/validate_contracts_preload.js pour valider les exemples
dans formats/.
