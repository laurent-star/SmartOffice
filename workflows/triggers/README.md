README — Workflows Triggers (Smart Office)

But

Les triggers ingestent des evenements externes et emettent des envelopes.
Ce sont les points d'entree du systeme.

Spec de reference : [docs/triggers-runtime.md](docs/triggers-runtime.md)

Workflows

- gmail.trigger.workflow.json (`so.trigger.gmail`)
- manual.trigger.workflow.json (`so.trigger.manual`)
- schedule.trigger.workflow.json (`so.trigger.schedule`)
- slack.trigger.workflow.json (`so.trigger.slack`)
- webhook.trigger.workflow.json (`so.trigger.webhook`)
- registry-loader.trigger.workflow.json (`so.trigger.registry-loader`)

Variables attendues (n8n env)

- REGISTRY_TOOLS_FILE_ID
- REGISTRY_CAPABILITIES_FILE_ID
- REGISTRY_USECASES_FILE_ID

Regles

- Un trigger ne planifie pas de steps.
- Un trigger n'execute pas de tools.
- Un trigger doit emettre une envelope conforme aux schemas.

Utilisation des utils

- Normalisation des payloads entrants
- Construction d'enveloppe minimale
- Validation Ajv avant emission

Regle de nommage

- Convention : `so.<layer>.<name>`
