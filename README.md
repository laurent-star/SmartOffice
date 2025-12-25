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

## Flux Git recommande (VS Code ou CLI)

1. **Recuperer les derniers commits** : `git fetch --all` puis verifier la branche courante avec `git status -sb` (la branche active actuelle est `work`).
2. **Conserver vos modifications locales** : si vous avez edite des fichiers (ex. README) sans commit, utilisez `git stash push -m "save local README"` avant de changer de branche ou de rebase, puis `git stash pop` apres mise a jour.
3. **Mettre a jour depuis la branche distante** : `git pull --rebase origin <branche>` pour re-appliquer vos changements au-dessus des derniers commits et limiter les merges inutiles.
4. **Commiter et pousser** : une fois vos modifications valides, `git commit -am "message"` puis `git push origin <branche>`.
5. **Coordination** : si un collaborateur pousse sur une autre branche, preferez ouvrir une nouvelle branche derivee de `work` pour vos travaux, puis creez une PR pour fusionner.
6. **Publier des README en cours** : si vous avez des README locaux non commits (ex. saisie via VS Code), creez une branche dediee avant de pousser pour isoler vos changements :

   ```bash
   git switch work
   git pull --rebase
   git switch -c feature/push-readme-updates
   git add README.md docs/**/*.md workflows/**/README.md
   git commit -m "Publier les README en attente"
   git push origin feature/push-readme-updates
   ```

### Depannage : branche `work` absente dans VS Code

- Par defaut, ce depot ne declare **aucun remote** et ne contient qu'une branche locale `work`.
- Si VS Code affiche `main` en haut a gauche, c'est simplement l'intitule par defaut propose lorsqu'aucune branche n'est selectionnee ou lorsqu'un remote n'est pas configure.
- Pour recuperer/afficher la branche `work` dans VS Code :

  ```bash
  git remote add origin <url-de-votre-depot>
  git fetch origin
  git switch work
  git push --set-upstream origin work   # optionnel : definir l'upstream si vous souhaitez la publier
  ```

- Une fois la branche `work` checkout, VS Code la listera dans la palette Git et dans le bandeau inferieur.
- Si VS Code continue d'afficher `main`, verifier que vous avez bien ouvert le dossier racine du projet (`/workspace/SmartOffice` ou `smart-office.code-workspace`) : ouvrir uniquement `/workspace` fait apparaitre un depot parent vide qui affiche `main` par defaut.
- Pensez a recharger la fenetre VS Code apres avoir ajoute le remote ou change de dossier (`Developer: Reload Window`) pour rafraichir la detection Git.

### Publier tous les fichiers modifies dans une PR

Si vous avez modifie plusieurs README, schemas ou workflows et voulez tout pousser en une seule PR :

1. Assurez-vous d'etre sur `work` et a jour :

   ```bash
   git switch work
   git pull --rebase
   ```

2. Creez une branche dediee a la publication :

   ```bash
   git switch -c feature/push-all-updates
   ```

3. Ajoutez l'ensemble des fichiers modifies (y compris les nouveaux) :

   ```bash
   git add -A
   ```

4. Commitez puis poussez :

   ```bash
   git commit -m "Publier les fichiers modifies"
   git push -u origin feature/push-all-updates
   ```

5. Ouvrez la PR depuis `feature/push-all-updates` vers la branche cible (ex. `work`) et verifiez que tous les fichiers attendus apparaissent dans l'onglet *Files changed*.

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
