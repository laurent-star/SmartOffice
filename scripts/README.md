README — Scripts (Smart Office)

But

Outils internes pour valider et maintenir les contrats, configs et workflows.

Scripts

- build_n8n_official_ops.js : assemble les fragments `registries/n8n-official-ops/*.json` en registry globale
- validate_contracts_preload.js : precharge les schemas et valide formats/
- validate_config.js : valide les fichiers config/ contre les schemas
- validate_workflows.js : valide les workflows par type (structure minimale)
- validate_n8n_official_ops.js : verifie n8n-official-ops.json (AJV + coherence params) en reconstruisant le fichier global
- validate_tool_categories.js : verifie tool-categories.json
- generate_registries.js : regenere registries + tool-categories + tools.json (reconstruit n8n-official-ops au prealable)
- generate_tool_categories.js : genere tool-categories.json depuis config/tools
- generate_tool_workflows.js : genere les workflows tools de base (reconstruit n8n-official-ops au prealable)
