# README — Scripts (Smart Office)

Outils internes pour valider et maintenir les contrats, configs et workflows.

## Scripts

- `fetch_n8n_docs.sh` : telecharge les pages n8n en HTML (`docs/n8n/html`), genere une version lisible (`docs/n8n/human`) et met a jour `docs/n8n/sources.md`. Option `--rebuild-raw` regenere les raw JSON depuis les fragments, `--build` lance la pipeline complete.
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
- `generate_golden_workflows.js` : normalise les workflows golden (formatage JSON) avant validation.
- `generate_agent_workflows.js` : génère les workflows `planner` et `supervisor` de l'agent.
- `generate_workflows.sh` : génère les workflows tools puis lance `validate_workflows.js` et `validate_workflow_nodes.js`.
- `validate_all.sh` : pipeline globale (docs n8n, contrats, config, registries, generation goldens/agent/tools, workflows, liens MD, audit/clean).
- `validate_cross_refs.js` : contrôle les références entre configs, registries et n8n-official-ops.
- `validate_workflow_nodes.js` : vérifie que les nodes des workflows pointent vers des operations n8n officielles ou des nodes core autorisés (`docs/n8n/core-nodes.json`).
- `validate_agent_workflows.js` : valide les workflows d'agent avec `contracts/workflow-agent.schema.json`.
- `smoke_build_tools.js` : lance la pipeline `build:tools` et vérifie la présence des artefacts clés.
- `migrate_tool_workflows.js` : remplace Switch/Set par Code dans les workflows tools sans perdre les nodes provider.
- `migrate_executor_workflow.js` : remplace les Switch de l'executor par des nodes Code et normalise le dispatch.
- Onboarding mappings : voir `docs/.codex/PLAN_MAPPING_ONBOARDING.md` et `docs/.codex/STATE_MAPPING_ONBOARDING.json`.
- `mapping_lint.js` : lint d'un mapping YAML et validation optionnelle sur un payload d'exemple via le moteur `engine/mapping`.
