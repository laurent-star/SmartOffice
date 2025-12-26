# Synthèse auto-générée depuis le dépôt

Cette note dresse l'inventaire des artefacts déjà présents dans le dépôt (sans input externe) et liste les informations manquantes pour finaliser le lancement.

## Workflows n8n

### Golden (`workflows/golden/`)
- 10_agent.json
- 20_tools.json
- 40_triggers.json
- 50_utils.json

### Agent (`workflows/agent/`)
- planner.workflow.json
- supervisor.workflow.json

### Executor (`workflows/executor/`)
- executor.workflow.json

### Tools (`workflows/tools/`)
- axonaut.workflow.json
- brevo.workflow.json
- gmail.workflow.json
- google-docs.workflow.json
- google-drive.workflow.json
- monday.workflow.json
- openai.workflow.json
- slack.workflow.json

### Triggers (`workflows/triggers/`)
- gmail.trigger.workflow.json
- manual.trigger.workflow.json
- schedule.trigger.workflow.json
- slack.trigger.workflow.json
- webhook.trigger.workflow.json

### Utils (`workflows/utils/`)
- Aucun workflow `.json` listé (README présent mais pas de fichiers).

## Configurations déclaratives (`config/`)

### Agent
- planning_rules.json
- system_prompt.md
- tool_selection.json

### Tools (`config/tools/`)
- axonaut.tool.json
- brevo.tool.json
- gmail.tool.json
- google-docs.tool.json
- google-drive.tool.json
- monday.tool.json
- openai.tool.json
- slack.tool.json

### Capabilities (`config/capabilities/`)
- classify_email.capability.json
- generate_document.capability.json
- notify_user.capability.json
- summarize_content.capability.json
- sync_crm_client.capability.json

### Use cases (`config/use-cases/`)
- generate_convention_formation.usecase.json
- incident_management.usecase.json
- lead_to_client.usecase.json
- onboarding_client.usecase.json

## Registries (`registries/`)
- tools.json (8 entrées référencées)
- capabilities.json (5 entrées)
- usecases.json (4 entrées)

## Documentation disponible (`docs/`)
- agent-runtime.md, executor-runtime.md, tools-runtime.md, triggers-runtime.md, utils-runtime.md
- golden-workflows.md (règles et périmètre des goldens)
- n8n-installation.md (guide d’installation)
- codex-plan.md (plan d’exécution)
- docs/archives/md-audit-2025-12-24.md

## Informations manquantes pour finaliser
- État de validation des goldens : quels workflows ont déjà été importés/testés dans n8n et avec quels résultats ?
- Écart éventuel entre registries et configs : faut-il régénérer les registries à partir des fichiers `config/` ou une source de vérité externe prévaut ?
- Scripts/commandes de QA attendus : quelles commandes AJV ou smoke tests doivent être exécutées (et sur quel scope) pour considérer la livraison prête ?
- Spécificités d’installation n8n : versions/credentials cibles, contraintes d’import/export, variables d’environnement à documenter.
- Priorités/échéances : ordre de traitement des catégories restantes et date cible de mise en prod.
- Status des utils : faut-il fournir des workflows utils ou bien sont-ils couverts ailleurs ?
