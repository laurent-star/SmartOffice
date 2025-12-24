README — Workflows Tools (Smart Office)

But

Les tools implementent des actions atomiques liees a des APIs.
Chaque tool execute une operation unique et renvoie un resultat structure.

Spec de reference : docs/tools-runtime.md
Schemas :
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json

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
- Le resultat doit suivre le schema tool-result.
