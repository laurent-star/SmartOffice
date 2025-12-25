README — Scripts (Smart Office)

But

Outils internes pour valider et maintenir les contrats et les configs.

Scripts

- validate_contracts_preload.js : precharge les schemas et valide formats/
- validate_config.js : valide les fichiers config/ contre les schemas
- validate_workflows.js : valide les workflows par type (structure minimale)
- validate_n8n_official_ops.js : valide registries/n8n-official-ops.json contre son schema + coherences internes
- validate_tool_categories.js : valide registries/tool-categories.json
- generate_registries.js : verifie les tools et genere registries/tool-categories.json (et tools.json) en s'appuyant sur le
  référentiel n8n-official-ops
- generate_tool_workflows.js : genere les workflows/tools/*.workflow.json a partir des actions officielles (contrats n8n-official-ops)
- agent-planning.schema.json : schema pour config/agent/planning_rules.json
- agent-tool-selection.schema.json : schema pour config/agent/tool_selection.json
