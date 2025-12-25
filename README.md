# Smart Office

Smart Office est une architecture d'automatisation pilotee par agent,
bassee sur des tools atomiques, des capabilities reutilisables
et des use cases metier, executes par un executor recursif.

## Concepts cles

- Tool
  Action atomique liee a une API (Slack, Google Drive, Gmail, Monday, OpenAI...).
  Implemente comme un workflow n8n route par provider et operation.

- Capability
  Suite declarative de steps.
  Independante des tools.
  Peut etre cross-tools.
  Reutilisable.

- Use case
  Suite de capabilities.
  Represente un scenario metier complet.

- Agent
  Lit les configurations (tools, capabilities, use cases),
  choisit quoi executer, mais n'execute rien directement.

- Executor
  Workflow n8n unique.
  Execute recursivement :
  - tool
  - capability
  - use case

## Types de tools (catalogue fonctionnel)

Chaque tool est classe par types fonctionnels (champ `categories` dans `config/tools`).
Le mapping officiel provider -> categorie pour la generation des registries se trouve dans `config/provider-category.map.json`.

- trigger_message : canaux d'entree/sortie (Slack, Gmail, WhatsApp, Messenger)
- validation_humaine : boucle humaine (Slack, WhatsApp, Messenger)
- crm : gestion clients (Axonaut, CRM interne)
- sales : gestion prospects (CRM ou outil commercial)
- ged : gestion documentaire (Drive, Docs, GED interne)
- marketing : campagnes et emails marketing (Brevo)
- task_manager : gestion de taches (Monday, Asana)
- calendar : calendriers (Google Calendar, Outlook)
- llm : modeles de langage (OpenAI, Claude)

## Regles d'architecture

- Les tools ne contiennent aucune logique metier
- Les capabilities ne connaissent pas les workflows
- Les use cases n'appellent que des capabilities
- Toute communication passe par une envelope standard
- Les schemas sont la source de verite

## Architecture fonctionnelle

Flux principal :
Trigger ou Agent
→ Executor
→ Tools

Principes :
- L'Agent decide et planifie (liste de steps)
- L'Executor execute sans intelligence ni logique metier
- Les Tools realisent des actions atomiques
- La memoire circule uniquement via l'envelope

Artefacts :
- Configs (capabilities, tools, use cases) decrivent le comportement
- Registries materialisent les references utilisables par l'executor
- Workflows golden servent de reference minimale
- Workflows reels implementent les actions et integrations

## Couches du systeme

- Triggers : points d'entree (webhook, schedule, inbox, chat)
- Agent : planification et selection des steps
- Executor : moteur deterministe d'execution
- Tools : actions atomiques connectees aux APIs
- Utils : helpers partages (normalisation, validation, guards)
- Configs : definitions declaratives (tools, capabilities, use cases)
- Registries : catalogues compiles pour l'execution

## Workflows et configuration

Seuls les workflows suivants sont utilises :
- agent
- triggers
- executor
- tools
- utils (si reutilises par plusieurs workflows)

Tout le reste est du JSON declaratif simple qui respecte les contrats.

Pour demarrer, un nouveau client ne fait que :
- importer les workflows dans n8n
- connecter les credentials pour chaque tool

## Documentation runtime

- docs/executor-runtime.md
- docs/agent-runtime.md
- docs/tools-runtime.md
- docs/capabilities-runtime.md
- docs/usecases-runtime.md
- docs/triggers-runtime.md
- docs/utils-runtime.md
- docs/golden-workflows.md
- docs/codex-plan.md
- docs/tools-catalog.md
- docs/n8n-installation.md
- docs/n8n/README.md
- docs/n8n/minimal-types.md
- docs/n8n/core-nodes.json
- docs/n8n/sources.md
- docs/drive-slack-gmail-usecases-plan.md
- docs/archives/md-audit-2025-12-24.md
- docs/archives/status-auto.md

## Readme par repertoire

- contracts/README.md
- config/README.md
- config/tools/README.md
- config/capabilities/README.md
- config/use-cases/README.md
- config/agent/README.md
- registries/README.md
- formats/README.md
- scripts/README.md
- workflows/agent/README.md
- workflows/executor/README.md
- workflows/tools/README.md
- workflows/triggers/README.md
- workflows/utils/README.md
- workflows/golden/README.md

### Checklist rapide lors d'une mise a jour d'un README

- Verifier que la liste des workflows mentionnes correspond aux fichiers presents dans le dossier.
- Pointer vers la spec runtime associee (docs/*.md) pour garder un lien clair entre theorie et implementation.
- Rappeler les schemas contracts/ pertinents pour eviter les divergences d'I/O.
- Reconfirmer les regles de scope (ce que le dossier fait et ne fait pas) pour limiter la derive fonctionnelle.

## Architecture du repertoire

- contracts/ : schemas JSON de reference
- docs/ : specifications runtime et regles non negociables
- formats/ : exemples de donnees valides pour les schemas
- workflows/
  - agent/ : planification et supervision
  - executor/ : moteur d'execution
  - tools/ : actions atomiques
  - triggers/ : entrees systeme
  - utils/ : utilitaires sans effets de bord
  - golden/ : implementations de reference
- registries/ : definitions de tools, capabilities, use cases
- scripts/ : utilitaires d'automatisation (validation, etc.)

## Validation des schemas

Pour valider les schemas JSON localement, certains outils (ex: ajv-cli)
ont besoin du plugin ajv-formats pour reconnaitre les formats standards
(date, date-time, etc.). Si vous obtenez un avertissement unknown format,
installez et utilisez ajv-formats ou validez via un petit script Node.

- Installer (globalement) :

```bash
npm install -g ajv-cli ajv-formats
```

- Exemple rapide (Node) :

```bash
node -e "const Ajv=require('ajv'); const addFormats=require('ajv-formats'); const ajv=new Ajv({allErrors:true}); addFormats(ajv); const s=require('./contracts/envelope.schema.json'); const d=require('./formats/envelope.json'); console.log(ajv.validate(s,d)?'valid':JSON.stringify(ajv.errors,null,2));"
```

## Prechargement et resolution des $ref

Les schemas dans contracts/ utilisent des $id (parfois des URI) pour permettre
les references croisees robustes. Lors de la validation avec Ajv :

- Ajv doit connaitre les formats (installer ajv-formats)
- Si un $ref pointe vers une URI, Ajv la resolvra seulement si le schema
  correspondant est precharge (ajv.addSchema)

Un script utilitaire existe : scripts/validate_contracts_preload.js.
Il precharge tous les schemas contracts/*.schema.json puis valide
les fichiers formats/*.json non vides.

Execution rapide :

```bash
# installer localement les dependances (si necessaire)
npm install --prefix . ajv@8 ajv-formats --save-dev

# lancer le validateur qui precharge les schemas
NODE_PATH=./node_modules node scripts/validate_contracts_preload.js
```
