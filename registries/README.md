README — Registries (Smart Office)

But

Les registries sont des catalogues compiles a partir des configs.
Ils servent de source d'information pour l'executor et la generation des workflows.

Fichiers

- registries/tools.json
- registries/capabilities.json
- registries/usecases.json
- registries/n8n-official-ops.json (operations officielles par provider n8n, assemble a partir des fragments du dossier registries/n8n-official-ops/)
- registries/tool-categories.json (mapping categories -> providers/operations)

Fragments n8n-official-ops

- Chaque provider est decrit dans un fragment JSON individuel dans `registries/n8n-official-ops/<provider>.json`.
- Le script `node scripts/build_n8n_official_ops.js` assemble tous les fragments en un fichier global `registries/n8n-official-ops.json` (docs uniques, detection des doublons, validation schema).

Regles

- Regenerer apres modification des configs
- Doivent rester coherents avec config/*
- Les operations autorisees sont referencees dans n8n-official-ops.json (reconstruit depuis les fragments)
