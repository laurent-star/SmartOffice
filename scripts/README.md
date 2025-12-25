README — Scripts (Smart Office)

But

Outils internes pour valider et maintenir les contrats et les configs.

Scripts

- validate_contracts_preload.js : precharge les schemas et valide formats/
- validate_config.js : valide les fichiers config/ contre les schemas
- validate_workflows.js : valide les workflows par type (structure minimale)
- validate_n8n_official_ops.js : valide registries/n8n-official-ops.json (schema + coherence interne)
- generate_registries.js : verifie les tools vs operations officielles et regenere registries/tool-categories.json et registries/tools.json
- validate_tool_categories.js : valide registries/tool-categories.json
- generate_tool_workflows.js : genere les workflows/tools/<provider>.workflow.json a partir des tools + n8n-official-ops
- agent-planning.schema.json : schema pour config/agent/planning_rules.json
- agent-tool-selection.schema.json : schema pour config/agent/tool_selection.json
