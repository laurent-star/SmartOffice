README — Workflows Tools (Smart Office)

But

Les tools implementent des actions atomiques liees a des APIs.
Chaque tool execute une operation unique et renvoie un resultat structure.

Spec de reference : [docs/tools-runtime.md](docs/tools-runtime.md)
Schemas :
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json
Catalogue :
- config/tools/*.tool.json
- registries/tools.json
- registries/n8n-official-ops.json

Workflows

- 1 workflow par provider (workflows/tools/<provider>.workflow.json)
- Routage par Switch(operation) couvrant toutes les actions declarees
- Chaque branche renvoie un "tool-result" minimal
- Les operations doivent exister dans n8n-official-ops

Utilisation des utils

- Normalisation des params d'entree
- Validation du tool-input et du tool-result
- Mapping uniforme des erreurs
