README — Registries (Smart Office)

But

Les registries sont des catalogues compiles a partir des configs.
Ils servent de source d'information pour l'executor et la generation des workflows.

Fichiers

- registries/tools.json
- registries/capabilities.json
- registries/usecases.json
- registries/n8n-official-ops.json (operations officielles par provider n8n)
- registries/tool-categories.json (mapping categories -> providers/operations)

Regles

- Regenerer apres modification des configs
- Doivent rester coherents avec config/*
- Les operations autorisees sont referencees dans n8n-official-ops.json
