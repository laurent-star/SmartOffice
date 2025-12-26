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
   - utils

2) Completer les goldens manquants ou incomplets ✅
   - I/O explicites et deterministes
   - pas de credentials
   - usage des utils quand pertinent
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
   - utils/ : workflows utilitaires reutilisables (mais ignores par defaut)

4) Validation ✅
   - AJV sur formats/
   - validate_all.sh (workflows, configs, registries, links)

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

## Definition of Done

- Goldens complets et coherents ✅
- Workflows reels generes ✅
- Configs et registries a jour ✅
- Guide n8n disponible ✅
