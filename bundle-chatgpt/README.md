# Smart Office — Bundle ChatGPT

## Objectif
Ce guide condensé rassemble les points clés de la documentation Smart Office pour armer ChatGPT : architecture, contrats d'exécution, conventions de configuration et pipeline de registries. Il sert de référence unique sans remplacer les fichiers source.

## Vue d'ensemble de l'architecture
- Chaîne stricte : Triggers → Agent → Executor → Tools. Les capacités et use cases se déploient entre l'Agent et l'Executor via des steps déclaratifs.【F:README.md†L57-L69】【F:docs/agent-runtime.md†L15-L24】
- Envelope unique : tous les flux utilisent les schémas de `contracts/` (envelope, step, tool, capability, usecase). La mémoire circule uniquement via `payload.memory`/`context.memory`.【F:README.md†L49-L69】【F:docs/agent-runtime.md†L51-L70】
- Déterminisme : aucun composant ne contient de logique heuristique ; la même entrée produit le même résultat. Le moteur d'exécution reste stateless hors envelope.【F:docs/executor-runtime.md†L117-L139】
- Conventions de nommage : workflows `so.<layer>.<name>` ; configs `domain.resource.action`.【F:README.md†L97-L114】【F:docs/capabilities-runtime.md†L46-L52】

## Rôles et contrats par couche
### Agent
- Rôle : interpréter l'intention (triggers/chat) et produire un plan ordonné de steps dans une Execution Envelope.【F:docs/agent-runtime.md†L13-L29】
- Ne fait pas : exécuter des tools, muter l'état externe, bypasser l'Executor ou inférer des params manquants sans étape de clarification.【F:docs/agent-runtime.md†L50-L75】
- Planning : steps `tool|capability|usecase` avec `ref` et `params` obligatoires ; politique `save/on_error` optionnelle ; boucle de clarification si le contexte manque. Règles dans `config/agent/planning_rules.json` (schema `contracts/agent-planning.schema.json`).【F:docs/agent-runtime.md†L77-L109】
- I/O : fabrique toujours une envelope complète (`header` + `payload.memory` + `payload.steps`), même en transformant un legacy envelope.【F:docs/agent-runtime.md†L34-L48】

### Executor
- Rôle : normaliser l'envelope (legacy ou exécution), exécuter les steps séquentiellement et retourner un `Result`. Aucun choix métier.【F:docs/executor-runtime.md†L9-L44】
- Résolution : steps routés via les registries `tools.json`/`capabilities.json`/`usecases.json`; support des politiques `when`, `save`, `on_error`; application des `payload.registryFiles` ou fallback registry.【F:docs/executor-runtime.md†L46-L82】
- I/O : enveloppe de résultat `header` + `output { results[], memory }` (+ trace si `options.debug`); construit `toolInput` (`contracts/tool-input.schema.json`) et attend un `toolResult`.【F:docs/executor-runtime.md†L84-L120】
- Invariants : déterminisme, respect des schémas, pas de logique métier ni d'appel API direct.【F:docs/executor-runtime.md†L121-L147】

### Triggers
- Rôle : convertir un événement externe en envelope cible Agent ou Executor, avec `context.memory`/`payload.memory` toujours présent.【F:docs/triggers-runtime.md†L7-L38】【F:docs/triggers-runtime.md†L74-L96】
- Ne font pas : planification ou choix de use case ; pas d'appels tools. Peuvent rediriger vers une capability de clarification.【F:docs/triggers-runtime.md†L40-L63】
- Registries Drive : injectent `payload.registryFiles` et `payload.options.fallbackRegistry` en cas d'absence des fichiers Drive (IDs `REGISTRY_*_FILE_ID`).【F:docs/triggers-runtime.md†L98-L125】

### Capabilities
- Rôle : séquences réutilisables et déterministes qui regroupent des appels tools. Pas de logique métier.【F:docs/capabilities-runtime.md†L7-L33】
- Définition : `config/capabilities/*.capability.json` → `registries/capabilities.json`; inputs/outputs obligatoires ; steps conformes à `contracts/step.schema.json`.【F:docs/capabilities-runtime.md†L35-L60】

### Use cases
- Rôle : porter le scénario métier et orchestrer capabilities/use cases (outils si aucun bloc atomique).【F:docs/usecases-runtime.md†L7-L33】【F:docs/usecases-runtime.md†L59-L72】
- Définition : `config/use-cases/*.usecase.json` → `registries/usecases.json`; inputs/outputs explicites. Exemple clé : `mapping.onboarding.run` (mapping LLM + validation Slack + stockage Drive).【F:docs/usecases-runtime.md†L35-L58】【F:docs/usecases-runtime.md†L73-L92】

### Tools
- Rôle : action API atomique, une seule opération, résultat structuré `{ ok, data, error, meta? }`.【F:docs/tools-runtime.md†L7-L33】【F:docs/tools-runtime.md†L63-L86】
- Définition : `config/tools/*.tool.json` (schéma `contracts/tool-definition.schema.json`) → `registries/tools.json`. Chaque action définit `input` attendu et `output` principal ; catégories fonctionnelles documentées dans `docs/tools-catalog.md`.【F:docs/tools-runtime.md†L35-L60】
- Entrée : Executor fournit `{ runId, stepId, tool, params, context.memory }`, souvent normalisé en `{ provider, operation, params }` par Code node. Aucun dispatch par Switch.【F:docs/tools-runtime.md†L41-L62】

### Utils
- Rôle : helpers déterministes sans I/O externe (normalisation, validation, enrichissement).【F:docs/utils-runtime.md†L7-L32】
- Contrat : entrées/sorties JSON sérialisables, pas d'effet de bord ni de décision métier.【F:docs/utils-runtime.md†L34-L53】

## Configurations, registries et dossiers clés
- Configs sont la source de vérité : tools, capabilities, use cases, agent prompts/règles. Chaque fichier respecte son schéma contractuel.【F:config/README.md†L1-L15】【F:config/agent/README.md†L1-L13】
- Conventions de nommage des configs : `domain.resource.action` pour capabilities et use cases (ex: `email.message.fetch`, `briefing.daily.generate`).【F:config/capabilities/README.md†L13-L23】【F:config/use-cases/README.md†L13-L23】
- Registries compilées pour l'exécution : `registries/tools.json`, `registries/capabilities.json`, `registries/usecases.json`, plus catalogues n8n (`n8n-official-ops.json`, `tool-categories.json`).【F:registries/README.md†L1-L24】
- Pipeline outils : docs n8n → fragments → build officiel → catégories → capacités → registry tools → workflows tools. Automatisé par `npm run build:tools`.【F:registries/README.md†L26-L41】

## Workflows et livrables
- Workflows utilisés : `agent`, `triggers`, `executor`, `tools`, `utils` (réutilisables). Les autres artefacts restent purement déclaratifs.【F:README.md†L101-L119】
- Règle de nommage des workflows (rappel) : `so.<layer>.<name>` pour assurer le routage (ex: `so.tool.google-drive`, `so.trigger.webhook`, `so.agent.planner`).【F:README.md†L79-L99】【F:docs/executor-runtime.md†L149-L160】
- Onboarding client : importer les workflows n8n, connecter les credentials par tool, puis déployer les registries. Les samples/format en `formats/` fournissent des exemples valides pour les schémas.【F:README.md†L84-L99】【F:formats/README.md†L1-L18】

## Références rapides
- Schémas : `contracts/*.schema.json` (envelopes, steps, tools, capabilities, use cases, agent planning/selection).
- Exemples validés : `formats/*.json` (tool-input, tool-result, envelope, memory, etc.).【F:formats/README.md†L1-L18】
- Catalogues et docs : voir `docs/tools-catalog.md`, `docs/n8n/README.md` pour la couverture des nodes officiels.

