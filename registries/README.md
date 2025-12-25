# README — Registries (Smart Office)

## But

Les registries sont des catalogues compilés à partir des docs locales et des configs. Ils servent de source unique pour l'executor, les capacités et la génération des workflows.

## Fichiers

- `registries/n8n-official-ops.json` : opérations officielles par provider n8n (assemblées depuis `registries/n8n-official-ops/*.json`).
- `registries/tool-categories.json` : mapping catégories -> providers/operations (dérivé de la registry officielle et de `config/provider-category.map.json`).
- `registries/capabilities.json` : capacités atomiques couvrant 100% des opérations officielles.
- `registries/tools.json` : registre des outils aligné sur les opérations officielles (nodeType, catégorie, actions, capacités).
- `registries/usecases.json` : catalogue des usecases (inchangé).

## Fragments n8n-official-ops

- Chaque provider est décrit dans un fragment JSON individuel dans `registries/n8n-official-ops/<provider>.json`.
- Les overrides optionnels sont placés dans `registries/n8n-official-ops/_overrides/` et doivent rester minimaux.
- Le script `node scripts/build_n8n_official_ops.js` assemble tous les fragments en un fichier global `registries/n8n-official-ops.json` (validation schema + cohérences params/returns).

## Pipeline outils

1. Docs locales (`docs/n8n/raw`, avec bloc JSON) -> `validate_n8n_docs.js` puis `parse_n8n_docs.js`.
2. Fragments + overrides -> `generate_n8n_official_ops_fragments.js` -> `build_n8n_official_ops.js`.
3. Catégories (`generate_tool_categories.js`) puis capacités (`generate_capabilities.js`).
4. Registry outils (`generate_tools_registry.js`).
5. Workflows outils (`generate_tool_workflows.js`).

Exécuter `npm run build:tools` pour enchaîner l'ensemble de la pipeline.
Pour mettre a jour les sources n8n, utiliser `./scripts/fetch_n8n_docs.sh`.
