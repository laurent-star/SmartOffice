# Smart Office — Bundle ChatGPT

## Objectif
Super mémo unique destiné à ChatGPT qui recense **tous les fichiers Markdown du projet** (hors dépendances `node_modules`) et en résume le rôle. Le document sert de plan de découverte complet : architecture des répertoires, specs runtime, checklists d'onboarding, archives et guides n8n.【F:README.md†L121-L142】【F:README.md†L167-L180】

## Architecture et conventions essentielles
- Chaîne stricte : Triggers → Agent → Executor → Tools ; capabilities et use cases s'intercalent comme blocs déclaratifs.【F:README.md†L47-L69】【F:docs/agent-runtime.md†L15-L24】
- Envelope unique issue de `contracts/` ; la mémoire circule via `payload.memory`/`context.memory` et reste l'unique état mutable.【F:README.md†L49-L69】【F:docs/agent-runtime.md†L51-L70】
- Déterminisme absolu : aucune logique heuristique, Executor stateless et conforme aux schémas JSON publics.【F:docs/executor-runtime.md†L117-L139】
- Nommage : workflows `so.<layer>.<name>` ; configs `domain.resource.action` pour capabilities/use cases.【F:README.md†L97-L114】【F:config/capabilities/README.md†L13-L23】
- Cartographie racine : contracts/ (schémas), docs/ (specs), formats/ (exemples), workflows/ (agent/executor/tools/triggers/utils/golden), registries/ (catalogues), scripts/ (helpers).【F:README.md†L167-L180】

## Index complet des Markdown
### Racine et backlog
- `README.md` — synthèse architecture, conventions et liens vers toute la doc.【F:README.md†L1-L142】
- `TODO.md` — backlog priorisé et chantiers en attente.【F:TODO.md†L1-L41】

### Documentation runtime et catalogues (docs/)
- `docs/agent-runtime.md` — contrat runtime de l'Agent : positionnement, interdits, fabrication de l'envelope et règles de planning.【F:docs/agent-runtime.md†L1-L76】
- `docs/executor-runtime.md` — rôle d'exécution séquentielle, résolution par registries, invariants de déterminisme.【F:docs/executor-runtime.md†L9-L120】
- `docs/triggers-runtime.md` — conversions d'événements externes, mémoire obligatoire, gestion des registries Drive.【F:docs/triggers-runtime.md†L7-L125】
- `docs/tools-runtime.md` — contrat d'un tool n8n, structure `{ ok, data, error, meta? }`, inputs/outputs attendus.【F:docs/tools-runtime.md†L7-L86】
- `docs/capabilities-runtime.md` — définition d'une capability déterministe et structure des steps.【F:docs/capabilities-runtime.md†L7-L60】
- `docs/usecases-runtime.md` — rôle métier des use cases et composition capabilities/outils.【F:docs/usecases-runtime.md†L7-L92】
- `docs/utils-runtime.md` — règles pour helpers sans I/O externe.【F:docs/utils-runtime.md†L7-L53】
- `docs/mapping-runtime.md` — modèle de mapping/exécution pour orchestrer les correspondances.【F:docs/mapping-runtime.md†L1-L76】
- `docs/tools-catalog.md` — catalogue fonctionnel et couverture des providers/tools.【F:docs/tools-catalog.md†L1-L120】
- `docs/tools-nodes.md` — détails sur les nodes n8n/outils disponibles et leurs options.【F:docs/tools-nodes.md†L1-L80】
- `docs/registry-loader-workflow.md` — explication du loader de registries et étapes associées.【F:docs/registry-loader-workflow.md†L1-L64】
- `docs/n8n-installation.md` — guide d'import des workflows (golden puis réels) et configuration des registries Drive dans n8n.【F:docs/n8n-installation.md†L1-L68】
- Plans et audits : `docs/codex-plan.md`, `docs/human-plan.md`, `docs/drive-slack-gmail-usecases-plan.md`, `docs/workflow-node-audit.md`, `docs/.codex/PLAN_MAPPING_ONBOARDING.md` détaillent roadmaps, onboarding et contrôles qualité.【F:docs/codex-plan.md†L1-L64】【F:docs/human-plan.md†L1-L52】【F:docs/drive-slack-gmail-usecases-plan.md†L1-L52】【F:docs/workflow-node-audit.md†L1-L120】【F:docs/.codex/PLAN_MAPPING_ONBOARDING.md†L1-L32】
- Archives : `docs/archives/md-audit-2025-12-24.md` (audit Markdown), `docs/archives/status-auto.md` (statuts automatisés).【F:docs/archives/md-audit-2025-12-24.md†L1-L36】【F:docs/archives/status-auto.md†L1-L36】
- Onboarding humain et patterns d'usage : `docs/human-plan.md` et `docs/faq.md`.【F:docs/human-plan.md†L1-L52】【F:docs/faq.md†L1-L80】

### Documentation n8n (docs/n8n/)
- `docs/n8n/README.md` — conventions de documentation des nodes officiels et portée du catalogue.【F:docs/n8n/README.md†L1-L56】
- `docs/n8n/minimal-types.md` — typage minimal requis pour les nodes personnalisés.【F:docs/n8n/minimal-types.md†L1-L60】
- `docs/n8n/sources.md` — sources officielles utilisées pour construire le catalogue n8n.【F:docs/n8n/sources.md†L1-L64】
- Guides humains par provider (`docs/n8n/human/*.md`) : Brevo, Gmail, Slack, Drive, Google Docs/Sheets/Calendar, Google Drive, Monday, Axonaut, OpenAI ; couvrent paramètres et limites propres à chaque node.【F:docs/n8n/human/slack.md†L1-L80】【F:docs/n8n/human/google-drive.md†L1-L120】

### Onboarding par produit (docs/onboarding/)
Checklists opérationnelles par outil : Slack, Gmail, Brevo, Google Drive/Docs/Sheets/Calendar, Axonaut, Monday. Chaque fichier liste prérequis, création de credentials et tests rapides.【F:docs/onboarding/slack.checklist.md†L1-L48】【F:docs/onboarding/google-calendar.checklist.md†L1-L52】

### Configurations et prompts (config/)
- `config/README.md` — règles générales, structure des dossiers et validation par schémas.【F:config/README.md†L1-L18】
- Capabilities/Use cases : conventions `domain.resource.action` et champs obligatoires décrits dans `config/capabilities/README.md` et `config/use-cases/README.md`.【F:config/capabilities/README.md†L13-L27】【F:config/use-cases/README.md†L13-L27】
- Tools : structure d'un fichier `.tool.json` documentée dans `config/tools/README.md`.【F:config/tools/README.md†L1-L23】
- Agent : prompts et règles (`system_prompt.md`, `planning_rules.json`) expliqués dans `config/agent/README.md`.【F:config/agent/README.md†L1-L24】【F:config/agent/system_prompt.md†L1-L60】

### Registries, formats et contrats
- `registries/README.md` + sous-dossiers `domain/` et `mappings/` décrivent la génération des catalogues (tools, capabilities, use cases).【F:registries/README.md†L1-L41】【F:registries/domain/README.md†L1-L44】【F:registries/mappings/README.md†L1-L22】
- `formats/README.md` — jeux d'exemples JSON validant les schémas (envelope, tool input/result, memory).【F:formats/README.md†L1-L18】
- `contracts/README.md` — référence des schémas (envelope, step, tool-definition, agent planning/selection).【F:contracts/README.md†L1-L38】

### Workflows (workflows/)
- `workflows/agent/README.md`, `workflows/executor/README.md`, `workflows/triggers/README.md`, `workflows/tools/README.md`, `workflows/golden/README.md` — scopes et attentes de chaque famille de workflows n8n ; rappels de nommage `so.<layer>.<name>`.【F:workflows/agent/README.md†L1-L48】【F:workflows/golden/README.md†L1-L28】
- `workflows/utils/` ne contient pas de README dédié mais suit les règles générales décrites ci-dessus.【F:README.md†L86-L119】

### Scripts et moteur
- `scripts/README.md` — scripts d'automatisation (validation de schémas, build registries).【F:scripts/README.md†L1-L32】
- `engine/mapping/README.md` — logique de mapping exécutée par l'engine avec exemples de payloads.【F:engine/mapping/README.md†L1-L64】

### Bundles et échantillons
- `bundle-chatgpt/README.md` (ce document) — condensé global pour assistant.【F:bundle-chatgpt/README.md†L1-L94】
- `samples/` et `formats/` fournissent des exemples prêts à l'emploi, référencés dans les sections ci-dessus.【F:formats/README.md†L1-L18】

### Notes supplémentaires
- Les fichiers Markdown inclus dans `node_modules/` (README/CHANGELOG des dépendances) restent accessibles mais ne sont pas couverts par ce mémo pour éviter le bruit côté assistant.
- Les ressources n8n supplémentaires (workflows golden, registries) s'appuient sur les schémas décrits dans `contracts/` et doivent respecter la convention de nommage rappelée en ouverture.【F:README.md†L107-L119】

