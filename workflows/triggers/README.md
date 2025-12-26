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

Nodes et I/O

- gmail.trigger.workflow.json
  - Trigger Event — Gmail Trigger (`n8n-nodes-base.gmailTrigger`) : recoit les evenements Gmail (nouveaux messages) ; produit le payload Gmail brut.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : attend le payload Gmail; construit une enveloppe legacy avec `input`/`context` pre-remplis pour l'executor.

- manual.trigger.workflow.json
  - Trigger Event — Manual Trigger (`n8n-nodes-base.manualTrigger`) : declenchement manuel sans entree; emet un item vide.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : construit une enveloppe legacy minimale avec `input` vide et `context.memory` par defaut.

- schedule.trigger.workflow.json
  - Trigger Event — Schedule Trigger (`n8n-nodes-base.scheduleTrigger`) : cron/interval pour lancer le flux; emet la date de run.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : transforme l'horodatage en enveloppe legacy destinee a l'executor.

- slack.trigger.workflow.json
  - Trigger Event — Slack Trigger (`n8n-nodes-base.slackTrigger`) : recoit les events Slack (messages, reactions... selon config); fournit le payload Slack.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : attend le payload Slack; genere une enveloppe legacy avec `input`/`context` alimente par les metadonnees Slack.

- webhook.trigger.workflow.json
  - Trigger Event — Webhook (`n8n-nodes-base.webhook`) : recoit un appel HTTP et expose body/query/headers.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : lit les donnees HTTP; encapsule dans une enveloppe legacy vers l'executor.

- registry-loader.trigger.workflow.json
  - Trigger Event — Manual Trigger (`n8n-nodes-base.manualTrigger`) : lancement manuel pour charger les registres.
  - Download Tools Registry — Google Drive (`n8n-nodes-base.googleDrive`) : attend `fileId` depuis l'environnement; telecharge le JSON des tools.
  - Parse Tools Registry — Code (`n8n-nodes-base.code`) : parse le fichier tools en objet et ajoute `category:'tools'`.
  - Download Capabilities Registry — Google Drive (`n8n-nodes-base.googleDrive`) : telecharge le JSON des capabilities.
  - Parse Capabilities Registry — Code (`n8n-nodes-base.code`) : parse et marque `category:'capabilities'`.
  - Merge Registries A — Merge (`n8n-nodes-base.merge`) : fusionne tools + capabilities en liste unique.
  - Download Usecases Registry — Google Drive (`n8n-nodes-base.googleDrive`) : telecharge le JSON des usecases.
  - Parse Usecases Registry — Code (`n8n-nodes-base.code`) : parse et marque `category:'usecases'`.
  - Merge Registries B — Merge (`n8n-nodes-base.merge`) : ajoute les usecases au flux fusionne.
  - Build Execution Envelope — Code (`n8n-nodes-base.code`) : construit une enveloppe d'execution contenant `payload.registryFiles` alimente par les trois registres pour l'executor.

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
