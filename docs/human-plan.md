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

## Onboarding intelligent (mapping)

Objectif : finaliser le mapping des tools pour un nouveau client.

1) Suivre le plan d'onboarding
   - `docs/.codex/PLAN_MAPPING_ONBOARDING.md`

2) Mettre a jour l'etat du mapping
   - `docs/.codex/STATE_MAPPING_ONBOARDING.json`

3) Verifier le runtime de mapping (tests)
   - `node --test tests/mapping/mapping_runtime.test.js`

### Pour un nouveau client (minimum requis)

- Adapter les mappings dans `registries/mappings/<source>/*.json`
- Valider via `node scripts/mapping_lint.js --interactive` si besoin
- Repasser `node scripts/mapping_lint.js --ci`
- Poursuivre l'onboarding n8n (workflows + credentials) via `docs/n8n-installation.md`

## Debug runtime (executor)

- `debug` est actif par defaut dans l'executor.
- Pour forcer le debug depuis un trigger/agent :
  - `payload.options.debug = true`

## Notes

- Le loader charge les registries et les injecte dans l'enveloppe.
- L'executor attend `payload.registryFiles`.
