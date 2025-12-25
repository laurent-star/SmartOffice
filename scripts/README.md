# README — Scripts (Smart Office)

Outils internes pour valider et maintenir les contrats, configs et workflows.

## Scripts

- `validate_n8n_docs.js` : vérifie la présence et la structure minimale des docs n8n locales (`docs/n8n/raw`).
- `parse_n8n_docs.js` : extrait les opérations officielles depuis les docs locales (JSON embarqué) et prépare un artefact temporaire.
- `generate_n8n_official_ops_fragments.js` : fusionne la sortie du parseur et les overrides pour alimenter les fragments `registries/n8n-official-ops/*.json`.
- `validate_n8n_official_ops_fragments.js` : valide fragments et overrides via schémas AJV.
- `build_n8n_official_ops.js` : assemble les fragments `registries/n8n-official-ops/*.json` en registry globale déterministe.
- `validate_n8n_official_ops.js` : reconstruit et valide la registry globale.
- `generate_tool_categories.js` / `validate_tool_categories.js` : dérivent les catégories des outils depuis les opérations officielles et la cartographie provider -> catégorie.
- `generate_capabilities.js` / `validate_capabilities.js` : dérivent les capacités atomiques couvrant 100% des opérations officielles.
- `generate_tools_registry.js` : aligne la registry des outils (nodeType, catégorie, actions, capacités) sur les opérations officielles.
- `generate_tool_workflows.js` : génère un workflow par provider en couvrant toutes les actions déclarées.
- `smoke_build_tools.js` : lance la pipeline `build:tools` et vérifie la présence des artefacts clés.
