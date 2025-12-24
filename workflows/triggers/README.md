README — Workflows Triggers (Smart Office)

But

Les triggers ingestent des evenements externes et emettent des envelopes.
Ce sont les points d'entree du systeme.

Spec de reference : docs/triggers-runtime.md

Workflows

- gmail.trigger.workflow.json
- manual.trigger.workflow.json
- schedule.trigger.workflow.json
- slack.trigger.workflow.json
- webhook.trigger.workflow.json

Regles

- Un trigger ne planifie pas de steps.
- Un trigger n'execute pas de tools.
- Un trigger doit emettre une envelope conforme aux schemas.
