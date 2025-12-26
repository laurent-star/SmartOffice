# Plan Humain — Smart Office

Ce document liste les taches a realiser cote operations/deploiement.

## Taches

1) Publier les registries sur Google Drive
   - `registries/tools.json`
   - `registries/capabilities.json`
   - `registries/usecases.json`

2) Configurer les variables n8n
   - `REGISTRY_TOOLS_FILE_ID`
   - `REGISTRY_CAPABILITIES_FILE_ID`
   - `REGISTRY_USECASES_FILE_ID`
   - Recuperer les IDs des fichiers Google Drive (URL du fichier -> ID entre `/d/` et `/view`)
   - n8n Docker :
     - definir les variables dans l'environnement du container
     - redemarrer n8n pour prise en compte
   - n8n UI (si supporte par la stack) :
     - Settings > Variables
     - ajouter les trois variables avec leurs IDs
   - Pour verifier si l'UI est disponible :
     - ouvrir `http://<host>:5678` et confirmer l'editeur n8n

3) Importer les workflows dans n8n
   - `workflows/agent/planner.workflow.json` → `so.agent.planner`
   - `workflows/agent/supervisor.workflow.json` → `so.agent.supervisor`
   - `workflows/executor/executor.workflow.json` → `so.executor.core`
   - `workflows/tools/axonaut.workflow.json` → `so.tool.axonaut`
   - `workflows/tools/brevo.workflow.json` → `so.tool.brevo`
   - `workflows/tools/gmail.workflow.json` → `so.tool.gmail`
   - `workflows/tools/google-calendar.workflow.json` → `so.tool.google-calendar`
   - `workflows/tools/google-docs.workflow.json` → `so.tool.google-docs`
   - `workflows/tools/google-drive.workflow.json` → `so.tool.google-drive`
   - `workflows/tools/google-sheets.workflow.json` → `so.tool.google-sheets`
   - `workflows/tools/monday.workflow.json` → `so.tool.monday`
   - `workflows/tools/openai.workflow.json` → `so.tool.openai`
   - `workflows/tools/slack.workflow.json` → `so.tool.slack`
   - `workflows/triggers/gmail.trigger.workflow.json` → `so.trigger.gmail`
   - `workflows/triggers/manual.trigger.workflow.json` → `so.trigger.manual`
   - `workflows/triggers/registry-loader.trigger.workflow.json` → `so.trigger.registry-loader`
   - `workflows/triggers/schedule.trigger.workflow.json` → `so.trigger.schedule`
   - `workflows/triggers/slack.trigger.workflow.json` → `so.trigger.slack`
   - `workflows/triggers/webhook.trigger.workflow.json` → `so.trigger.webhook`

4) Importer le loader de registry
   - `workflows/triggers/registry-loader.trigger.workflow.json`

5) Verifier les credentials Google Drive dans n8n

6) Tester un flux complet
   - Trigger -> Executor -> Tool (ex: Slack)

7) Verifier les logs et la sortie de l'executor

8) Onboarding mapping intelligent (tous les tools)
   - Canal Slack : `#smartoffice`
   - Dossier Drive : creer automatiquement `mappings/` via workflow
   - Use case : `mapping.onboarding.run`
   - Les tools utilisent `sampleFetch` pour recuperer un payload minimal
   - Plan detaille : `docs/.codex/PLAN_MAPPING_ONBOARDING.md`
   - Etat : `docs/.codex/STATE_MAPPING_ONBOARDING.json`

   - Verifier le runtime de mapping (tests) si besoin :
     - `node --test tests/mapping/mapping_runtime.test.js`
   - Pour un nouveau client (minimum) :
     - adapter les mappings `registries/mappings/<source>/*.json`
     - `node scripts/mapping_lint.js --interactive` (si besoin)
     - `node scripts/mapping_lint.js --ci`
     - suivre `docs/n8n-installation.md`

## Debug runtime (executor)

- `debug` est actif par defaut dans l'executor.
- Pour forcer le debug depuis un trigger/agent :
  - `payload.options.debug = true`

## Notes

- Le loader charge les registries et les injecte dans l'enveloppe.
- L'executor attend `payload.registryFiles`.
