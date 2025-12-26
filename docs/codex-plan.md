# Plan Codex — Smart Office

Ce document decrit le plan d'execution pour finaliser le projet.
Le plan est sequence en deux phases : goldens puis reels.

---

## Phase 1 — Goldens (reference)

Objectif : disposer de workflows canoniques et minimalistes,
alignes avec les contrats et la doc runtime.

1) Verifier la coherence des goldens existants ✅
   - executor
   - agent
   - tools
   - triggers

2) Completer les goldens manquants ou incomplets ✅
   - I/O explicites et deterministes
   - pas de credentials
   - ajouts : `15_agent_planner.json`, `16_agent_supervisor.json`

3) Valider la coherence avec les schemas ✅
   - envelope, step, tool-input, tool-result

Livrables :
- workflows/golden/*.json (complets)
- [workflows/golden/README.md](workflows/golden/README.md) aligne

---

## Phase 2 — Reels (implementation)

Objectif : generer les workflows et configs reels a partir des defs.

1) Configs ✅
   - config/tools/*.tool.json
   - config/capabilities/*.capability.json
   - config/use-cases/*.usecase.json

2) Registries ✅
   - registries/tools.json
   - registries/capabilities.json
   - registries/usecases.json

3) Workflows reels ✅
   - tools/ : un workflow par tool
   - triggers/ : un workflow par type d'entree
   - agent/ : planner + supervisor coherents avec specs
   - executor/ : workflow canonique

4) Validation ✅
   - AJV sur formats/
   - validate_all.sh (workflows, configs, registries, links)
   - audit des nodes de workflows (`npm run validate:workflow-nodes`)

Livrables :
- workflows/*.json complets
- configs et registries a jour

---

## Guide d'installation n8n

Objectif : permettre l'import et le deploiement propre des workflows.

A produire :
- prerequis (n8n version, variables, credentials)
- import des workflows golden puis reels
- mapping des credentials par tool
- verification d'execution

Livrable :
- [docs/n8n-installation.md](docs/n8n-installation.md) ✅

---

## Etat actuel

- Les goldens sont en place et valides.
- Les workflows reels sont generes et coherents.
- Les registries sont generes via `validate_all.sh`.
- Le loader Google Drive pour les registries est disponible.
- La doc et les scripts de validation sont en place.
- Onboarding intelligent documente dans `docs/.codex/PLAN_MAPPING_ONBOARDING.md`.
- Use case `onboarding_mapping_intelligent` disponible (LLM + Slack + Drive).
- `sampleFetch` ajoute dans tous les tools workflows.

---

## Reste a faire (operationnel)

- Uploader les registries (`registries/tools.json`, `registries/capabilities.json`, `registries/usecases.json`) sur Google Drive.
- Definir les variables d'environnement n8n :
  - `REGISTRY_TOOLS_FILE_ID`
  - `REGISTRY_CAPABILITIES_FILE_ID`
  - `REGISTRY_USECASES_FILE_ID`
- Importer le workflow `workflows/triggers/registry-loader.trigger.workflow.json`.
- Verifier que les credentials Google Drive sont associes.
- Executer un test n8n de bout en bout (trigger -> executor -> tool).
- Activer ou forcer `payload.options.debug = true` pour tracer l'execution.

---

## Definition of Done

- Goldens complets et coherents ✅
- Workflows reels generes ✅
- Configs et registries a jour ✅
- Guide n8n disponible ✅
