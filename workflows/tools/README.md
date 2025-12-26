README — Workflows Tools (Smart Office)

But

Les tools implementent des actions atomiques liees a des APIs.
Chaque tool execute une operation unique et renvoie un resultat structure.

Spec de reference : [docs/tools-runtime.md](docs/tools-runtime.md)
Schemas :
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json
Catalogue :
- config/tools/*.tool.json
- registries/tools.json
- registries/n8n-official-ops.json

Workflows

- 1 workflow par provider (workflows/tools/<provider>.workflow.json)
- Nommage n8n recommande : `so.tool.<provider>`
- Routage par node Code couvrant toutes les actions declarees
- Chaque branche renvoie un "tool-result" minimal
- Les operations doivent exister dans n8n-official-ops

I/O contract

- Input attendu (cote tool) : `toolInput` conforme a `contracts/tool-input.schema.json`.
- Normalisation recommande :
  - `tool.operation` -> `operation`
  - `tool.provider` -> `provider`
  - `params` -> `params`
- Output obligatoire : `toolResult` conforme a `contracts/tool-result.schema.json`.
- L'Executor consomme `toolResult` et alimente `output.results[]` + `memory.state` si `save` est defini.

Nodes (par workflow)

- axonaut.workflow.json (`n8n-nodes-base.axonaut`)
  - Manual Trigger — Manual Trigger : point d'entree de test.
  - Normalize Input — Code : reduit l'item a `provider`, `operation`, `params` venant de l'input.
  - Dispatch Operation — Code : route sur `operation` (company.update, contact.create, sampleFetch).
  - company.update — Axonaut : attend `params.companyId` et champs de mise a jour; renvoie la reponse API Axonaut.
  - contact.create — Axonaut : attend `params.companyId` et donnees de contact; renvoie l'objet contact cree.
  - sampleFetch — Set : renvoie un exemple statique (outil de test) avec `ok`, `data`.

- brevo.workflow.json (`n8n-nodes-base.brevo`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques a ci-dessus.
  - campaign.createCampaign — Brevo : attend `params.name`, `type`, `subject`, `sender`... selon node Brevo; produit les metadonnees de campagne.
  - email.sendEmail — Brevo : attend `params.sender`, `params.to`, `params.subject`, `params.htmlContent` ; renvoie la reponse d'envoi.
  - sampleFetch — Set : payload de demonstration.

- gmail.workflow.json (`n8n-nodes-base.gmail`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - message.get — Gmail : attend `params.messageId`; renvoie le message.
  - message.getMany — Gmail : attend filtres dans `params` (userId, query...); renvoie une liste.
  - message.send — Gmail : attend `params.to`, `params.subject`, `params.body`/`params.raw` ; renvoie l'id d'envoi.
  - sampleFetch — Gmail : utilise `operation: sampleFetch` pour lire un message d'exemple.

- google-calendar.workflow.json (`n8n-nodes-base.googleCalendar`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - event.create — Google Calendar : attend `params.title`, `params.start`, `params.end`, `params.calendar` et optionnellement `params.attendees`/`params.description`; renvoie l'event cree.
  - event.getMany — Google Calendar : attend `params.calendar` et les filtres `params.timeMin`, `params.timeMax`, `params.limit`; renvoie les events du calendrier cible.
  - sampleFetch — Google Calendar : recupere un event exemple.

- google-docs.workflow.json (`n8n-nodes-base.googleDocs`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - document.create — Google Docs : attend `params.title`; renvoie le doc cree.
  - document.get — Google Docs : attend `params.documentId`; renvoie le contenu.
  - document.update — Google Docs : attend `params.documentId` et optionnellement `params.requests`/`params.html`/`params.text`; renvoie la reponse update.
  - sampleFetch — Google Docs : recupere un doc exemple.

- google-drive.workflow.json (`n8n-nodes-base.googleDrive`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - file.download — Google Drive : attend `params.fileId` et optionnellement `params.binaryPropertyName` (defaut `data`); renvoie le fichier en binaire ou metadata.
  - file.get — Google Drive : attend `params.fileId`; renvoie les metadonnees.
  - file.upload — Google Drive : attend `params.folderId`, `params.name`, `params.binary` (defaut `data`) et `params.mimeType`; renvoie le fichier cree.
  - fileFolder.search — Google Drive : attend `params.query` avec `params.returnAll`/`params.limit` optionnels; renvoie la liste.
  - folder.create — Google Drive : attend `params.parentFolderId` et `params.name`; renvoie le dossier.
  - sampleFetch — Google Drive : exemple de resultat.

- google-sheets.workflow.json (`n8n-nodes-base.googleSheets`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - sheet.append — Google Sheets : attend `params.spreadsheetId`, `params.range`, `params.values` et optionnellement `params.valueInputMode` ; renvoie la plage ecrite.
  - sheet.read — Google Sheets : attend `params.spreadsheetId`, `params.range` ; renvoie les lignes.
  - sheet.update — Google Sheets : attend `params.spreadsheetId`, `params.range`, `params.values` et eventuellement `params.valueInputMode`; renvoie la plage mise a jour.
  - spreadsheet.create — Google Sheets : attend `params.title` et eventuellement feuilles; renvoie l'id du classeur.
  - sampleFetch — Google Sheets : lecture de test.

- monday.workflow.json (`n8n-nodes-base.mondayCom`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - boardItem.addUpdate — Monday.com : attend `params.boardId`, `params.itemId`, `params.body`; renvoie la mise a jour.
  - boardItem.create — Monday.com : attend `params.boardId`, `params.groupId`, `params.itemName`, `params.columnValues`; renvoie l'item cree.
  - boardItem.get — Monday.com : attend `params.boardId`, `params.itemId`; renvoie l'item.
  - boardItem.getMany — Monday.com : attend `params.boardId` et filtres; renvoie la liste.
  - boardItem.updateColumnValues — Monday.com : attend `params.boardId`, `params.itemId`, `params.columnValues`; renvoie l'item.
  - sampleFetch — Monday.com : jeu de donnees exemple.

- openai.workflow.json (`n8n-nodes-langchain.lmchatopenai` + Code)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - assistant.classify — LangChain ChatOpenAI : attend `params.prompt`/`params.messages`, `params.model`, `params.temperature`; renvoie `data.response` avec la classification.
  - assistant.extract — LangChain ChatOpenAI : attend `params.prompt`/`params.schema`; renvoie les champs extraits.
  - assistant.summarize — LangChain ChatOpenAI : attend `params.prompt`/`params.context`; renvoie un resume texte.
  - sampleFetch — Set : resultat de demonstration.

- slack.workflow.json (`n8n-nodes-base.slack`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - conversation.getMany — Slack : attend `params.types` et filtres de pagination; renvoie les conversations.
  - file.get — Slack : attend `params.fileId`; renvoie le fichier.
  - file.getMany — Slack : attend filtres (channel, user...); renvoie les fichiers.
  - file.upload — Slack : attend `params.channel`, `params.binaryProperty`, `params.filename`; renvoie le fichier uploade.
  - message.delete — Slack : attend `params.channel`, `params.ts`; renvoie l'etat de suppression.
  - message.getPermalink — Slack : attend `params.channel`, `params.ts`; renvoie le permalink.
  - message.search — Slack : attend `params.query`; renvoie les messages trouves.
  - message.send — Slack : attend `params.channel`, `params.text`, `params.blocks`/`params.attachments`/`params.threadTs`; renvoie le message envoye.
  - sampleFetch — Slack : lecture d'un message exemple.

Utilisation des utils

- Normalisation des params d'entree
- Validation du tool-input et du tool-result
- Mapping uniforme des erreurs

Regle de nommage

- Convention : `so.<layer>.<name>`

Gaps vs doc officielle / plan d'actions

- Google Calendar : workflows acceptent `params.calendar` pour cibler explicitement un calendrier dans `event.create`, `event.getMany` et `sampleFetch`.
- Google Drive : les appels doivent utiliser `folderId`/`name`/`binary` et `mimeType`, avec `binaryPropertyName` par defaut `data` pour les downloads; les workflows sont alignes.
- Google Sheets : les workflows attendent `values` + `valueInputMode` et non `data`. Adapter les steps agents/executor pour envoyer `values` (tableau) et optionnellement `valueInputMode`.
