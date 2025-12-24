# Smart Office

Smart Office est une architecture d’automatisation pilotée par agent,
basée sur des **tools atomiques**, des **capabilities réutilisables**
et des **use cases métier**, exécutés par un **executor récursif**.

## Concepts clés

- **Tool**
  Action atomique liée à une API (Slack, Google Drive, Gmail, Monday, OpenAI…).
  Implémenté comme un workflow n8n avec un switch sur `action`.

- **Capability**
  Suite déclarative de `steps`.
  Indépendante des tools.
  Peut être cross-tools.
  Réutilisable.

- **Use case**
  Suite de capabilities.
  Représente un scénario métier complet.

- **Agent**
  Lit les configurations (tools, capabilities, use cases),
  choisit quoi exécuter, mais **n’exécute rien directement**.

- **Executor**
  Workflow n8n unique.
  Exécute récursivement :
  - tool
  - capability
  - use case

## Règles d’architecture

- Les **tools ne contiennent aucune logique métier**
- Les **capabilities ne connaissent pas les workflows**
- Les **use cases n’appellent que des capabilities**
- Toute communication passe par une **envelope standard**
- Les schemas sont la source de vérité

## Documentation runtime

- docs/executor-runtime.md
- docs/agent-runtime.md
- docs/tools-runtime.md
- docs/triggers-runtime.md
- docs/utils-runtime.md
- docs/golden-workflows.md

## Hors scope volontaire (bootstrap)

- policies complexes
- mappings dédiés
- gestion avancée de la mémoire

## Validation des schémas

Pour valider les schémas JSON localement, certains outils (ex : `ajv-cli`) ont besoin du plugin `ajv-formats` pour reconnaitre les formats standards (`date`, `date-time`, etc.). Si vous obtenez un avertissement `unknown format`, installez et utilisez `ajv-formats` ou validez via un petit script Node.

- Installer (globalement) :

```bash
npm install -g ajv-cli ajv-formats
```

- Exemple rapide (Node) :

```bash
node -e "const Ajv=require('ajv'); const addFormats=require('ajv-formats'); const ajv=new Ajv({allErrors:true}); addFormats(ajv); const s=require('./contracts/envelope.schema.json'); const d=require('./formats/envelope.json'); console.log(ajv.validate(s,d)?'valid':JSON.stringify(ajv.errors,null,2));"
```

Cette note évite les faux positifs d'avertissement lors de la validation locale tout en gardant les schémas inchangés.

### Préchargement et résolution des `$ref`

Les schémas dans `contracts/` utilisent désormais des `"$id"` (parfois des URI) pour permettre des références croisées robustes. Lors de la validation avec Ajv, deux points importants :

- Ajv doit connaître les formats (installer `ajv-formats`) pour valider les champs `format`.
- Si un `$ref` pointe vers une URI (ex. `https://smart-office.local/schemas/step.schema.json`), Ajv ne la résoudra que si le schéma correspondant a été préchargé (via `ajv.addSchema(schema, schema.$id)`) ou si le schéma est accessible à l'URI.

Pour faciliter la validation locale, un script utilitaire existe : `scripts/validate_contracts_preload.js`. Il précharge tous les schémas `contracts/*.schema.json` dans Ajv (en utilisant leur `$id`) puis valide les fichiers `formats/*.json` non vides.

Exécution rapide :

```bash
# installer localement les dépendances (si nécessaire)
npm install --prefix . ajv@8 ajv-formats --save-dev

# lancer le validateur qui précharge les schémas
NODE_PATH=./node_modules node scripts/validate_contracts_preload.js
```

Le script évite les erreurs de résolution liées aux `$id` et permet d'avoir un rapport clair des fichiers valides, invalides ou ignorés (ex : exemples vides).
