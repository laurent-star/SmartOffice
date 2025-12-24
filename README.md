# Smart Office

Smart Office est une architecture d'automatisation pilotee par agent,
bassee sur des tools atomiques, des capabilities reutilisables
et des use cases metier, executes par un executor recursif.

## Concepts cles

- Tool
  Action atomique liee a une API (Slack, Google Drive, Gmail, Monday, OpenAI...).
  Implemente comme un workflow n8n avec un switch sur l'action.

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

## Regles d'architecture

- Les tools ne contiennent aucune logique metier
- Les capabilities ne connaissent pas les workflows
- Les use cases n'appellent que des capabilities
- Toute communication passe par une envelope standard
- Les schemas sont la source de verite

## Documentation runtime

- docs/executor-runtime.md
- docs/agent-runtime.md
- docs/tools-runtime.md
- docs/triggers-runtime.md
- docs/utils-runtime.md
- docs/golden-workflows.md

## Readme par repertoire

- contracts/README.md
- workflows/agent/README.md
- workflows/executor/README.md
- workflows/tools/README.md
- workflows/triggers/README.md
- workflows/utils/README.md
- workflows/golden/README.md

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
