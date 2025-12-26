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

3) Importer les workflows dans n8n
   - workflows golden
   - workflows reels (tools, triggers, agent, executor)

4) Importer le loader de registry
   - `workflows/triggers/registry-loader.trigger.workflow.json`

5) Verifier les credentials Google Drive dans n8n

6) Tester un flux complet
   - Trigger -> Executor -> Tool (ex: Slack)

7) Verifier les logs et la sortie de l'executor

## Notes

- Le loader charge les registries et les injecte dans l'enveloppe.
- L'executor attend `payload.registryFiles`.
