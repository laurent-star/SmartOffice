# Installation n8n — Smart Office

Ce guide decrit l'installation et l'import des workflows Smart Office
(goldens puis reels) dans n8n.

---

## Prerequis

- n8n recent (version stable)
- Acces aux credentials des outils (Slack, Gmail, Drive, etc.)
- Variables d'environnement pour n8n (si necessaire)

---

## Ordre d'import recommande

1) Importer les workflows golden
   - Ils servent de reference minimale
   - Pas de credentials obligatoires

2) Importer les workflows reels
   - tools/
   - triggers/
   - agent/
   - executor/ (si tu utilises la version exportee)

---

## Import dans n8n

1) Ouvrir n8n
2) Menu Workflows > Import from File
3) Importer les JSON depuis :
   - workflows/golden/
   - workflows/tools/
   - workflows/triggers/
   - workflows/agent/
   - workflows/executor/

4) Importer le loader des registries (optionnel mais recommande)
   - workflows/triggers/registry-loader.trigger.workflow.json

---

## Credentials

- Associer les credentials a chaque workflow tool
- Garder les credentials hors Git
- Verifier que les nodes utilisent le bon credential name

## Variables d'environnement (registries Google Drive)

Pour charger les registries depuis Google Drive, definir ces variables
dans l'environnement n8n :

- `REGISTRY_TOOLS_FILE_ID`
- `REGISTRY_CAPABILITIES_FILE_ID`
- `REGISTRY_USECASES_FILE_ID`

Ces variables sont optionnelles : si elles ne sont pas definies ou si les
binaires Google Drive sont vides, le workflow `so.trigger.registry-loader`
repliera automatiquement sur les copies locales du depot
(`registries/tools.json`, `registries/capabilities.json`,
`registries/usecases.json`). Le fallback est egalement insere dans
`payload.options.fallbackRegistry` pour garantir que l'Executor dispose
toujours d'un catalogue valide.

## Onboarding intelligent (mapping)

Pour un onboarding complet des mappings tools, suivre le plan :
- docs/.codex/PLAN_MAPPING_ONBOARDING.md

Etat et suivi :
- docs/.codex/STATE_MAPPING_ONBOARDING.json

---

## Verification rapide

- Executer un workflow golden (manuel)
- Executer un tool simple (ex: slack)
- Verifier l'enveloppe en sortie
 - Verifier les tests mapping si besoin :
   - `node --test tests/mapping/mapping_runtime.test.js`

---

## Notes

- Les goldens sont des references, pas des workflows production
- Les workflows reels peuvent evoluer en fonction des APIs
