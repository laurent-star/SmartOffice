README — Workflows Tools (Smart Office)

But

Les tools implementent des actions atomiques liees a des APIs.
Chaque tool execute une operation unique et renvoie un resultat structure.

Spec de reference : docs/tools-runtime.md
Schemas :
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json
Catalogue :
- config/tools/*.tool.json
- registries/tools.json

Workflows

- axonaut.workflow.json
- brevo.workflow.json
- gmail.workflow.json
- google-docs.workflow.json
- google-drive.workflow.json
- monday.workflow.json
- openai.workflow.json
- slack.workflow.json

Regles

- Un tool ne planifie pas et n'orchestre pas.
- Un tool est execute par l'executor.
- Le routage se fait par provider et operation.
- Le resultat doit suivre le schema tool-result.
- Un workflow par provider (Switch(operation) complet) genere via scripts/generate_tool_workflows.js
- Les operations outillees doivent exister dans registries/n8n-official-ops.json
- Chaque branche renvoie un "tool-result" structure (Code node)

Utilisation des utils

- Normalisation des params d'entree
- Validation du tool-input et du tool-result
- Mapping uniforme des erreurs
