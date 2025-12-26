# Exports des workflows Tools

Ce dossier regroupe les exports n8n de tous les tools Smart Office, sans aucun credential pre-renseigne **et sans node provider**. Chaque fichier `*.workflow.json` sert uniquement de squelette `so.tool.<provider>` : importez-le puis ajoutez vous-meme, dans l'UI n8n, les nodes connecteur (Google, Slack, Monday, etc.) avec vos credentials.

## Workflows disponibles
- `axonaut.workflow.json`
- `brevo.workflow.json`
- `gmail.workflow.json`
- `google-calendar.workflow.json`
- `google-docs.workflow.json`
- `google-drive.workflow.json`
- `google-sheets.workflow.json`
- `monday.workflow.json`
- `openai.workflow.json`
- `slack.workflow.json`

## Parametres attendus par provider (pour configurer vos nodes)
Les workflows n'incluent plus aucun node provider ni node `Set` : ajoutez vos propres nodes connecteur dans l'UI et cabler-les a partir du trigger/manipulation qui vous convient. Les operations a declarer et leurs champs attendus sont ci-dessous ; configurez vos nodes avec ces parametres en entree/sortie.

### Axonaut (`n8n-nodes-base.axonaut`)
- Credentials a associer : API Key Axonaut.
- `company.update` : `companyId` + champs a mettre a jour.
- `contact.create` : `companyId` + payload de contact.
- `sampleFetch` : payload de demonstration.

### Brevo (`n8n-nodes-base.brevo`)
- Credentials a associer : API Key Brevo.
- `campaign.createCampaign` : `name`, `type`, `subject`, `sender` et options natives du node.
- `email.sendEmail` : `sender`, `to`, `subject`, `htmlContent`.
- `sampleFetch` : payload de demonstration.

### Gmail (`n8n-nodes-base.gmail`)
- Credentials a associer : OAuth2 Gmail avec scopes lecture/envoi.
- `message.get` : `messageId`.
- `message.getMany` : filtres dans `params` (ex. `userId`, `query`).
- `message.send` : `to`, `subject`, `body` ou `raw`.
- `sampleFetch` : lecture d'un message exemple.

### Google Calendar (`n8n-nodes-base.googleCalendar`)
- Credentials a associer : OAuth2 Google avec scope Calendar.
- `event.create` : `title`, `start`, `end`, `calendar`, plus `attendees`/`description` eventuels.
- `event.getMany` : `calendar` + filtres `timeMin`/`timeMax`/`limit`.
- `sampleFetch` : recuperation d'un event exemple.

### Google Docs (`n8n-nodes-base.googleDocs`)
- Credentials a associer : OAuth2 Google avec scope Docs.
- `document.create` : `title`.
- `document.get` : `documentId`.
- `document.update` : `documentId` + `requests`/`html`/`text` optionnels.
- `sampleFetch` : doc exemple.

### Google Drive (`n8n-nodes-base.googleDrive`)
- Credentials a associer : OAuth2 Google avec scope Drive.
- `file.download` : `fileId`, `binaryPropertyName` optionnel (defaut `data`).
- `file.get` : `fileId`.
- `file.upload` : `folderId`, `name`, `binary` (defaut `data`), `mimeType`.
- `fileFolder.search` : `query` avec `returnAll`/`limit` optionnels.
- `folder.create` : `parentFolderId`, `name`.
- `sampleFetch` : exemple de resultat (meme signature que `file.download`).

### Google Sheets (`n8n-nodes-base.googleSheets`)
- Credentials a associer : OAuth2 Google avec scope Sheets.
- `sheet.append` : `spreadsheetId`, `range`, `values`, `valueInputMode` optionnel.
- `sheet.read` : `spreadsheetId`, `range`.
- `sheet.update` : `spreadsheetId`, `range`, `values`, `valueInputMode` optionnel.
- `spreadsheet.create` : `title` (+ eventuelles feuilles).
- `sampleFetch` : lecture de test.

### Monday.com (`n8n-nodes-base.mondayCom`)
- Credentials a associer : Token d'API Monday.com.
- `boardItem.addUpdate` : `boardId`, `itemId`, `body`.
- `boardItem.create` : `boardId`, `groupId`, `itemName`, `columnValues`.
- `boardItem.get` : `boardId`, `itemId`.
- `boardItem.getMany` : `boardId` + filtres.
- `boardItem.updateColumnValues` : `boardId`, `itemId`, `columnValues`.
- `sampleFetch` : donnees exemple.

### OpenAI (`n8n-nodes-langchain.lmchatopenai`)
- Credentials a associer : API Key OpenAI + model choisi.
- `assistant.classify` : `prompt` ou `messages`, `model`, `temperature`.
- `assistant.extract` : `prompt` ou `schema`.
- `assistant.summarize` : `prompt` ou `context`.
- `sampleFetch` : resultat de demonstration.

### Slack (`n8n-nodes-base.slack`)
- Credentials a associer : OAuth2/Bot Token Slack avec scopes adequats (chat:write, files:read, etc.).
- `conversation.getMany` : `types` + filtres de pagination.
- `file.get` : `fileId`.
- `file.getMany` : filtres (channel, user...).
- `file.upload` : `channel`, `binaryProperty`, `filename`.
- `message.delete` : `channel`, `ts`.
- `message.getPermalink` : `channel`, `ts`.
- `message.search` : `query`.
- `message.send` : `channel`, `text`, `blocks`/`attachments`/`threadTs` eventuels.
- `sampleFetch` : lecture de message exemple.

## Connexion des credentials et ajout des nodes providers
Les exports ne contiennent volontairement plus aucun node provider (ni credentials). Apres import :
- ajoutez dans l'UI n8n les nodes connecteur de chaque provider ci-dessus ;
- configurez les credentials adequats ;
- mappez les champs `operation` et `params` attendus par operation telle que decrit plus haut ;
- si besoin, ajoutez un node Code de normalisation en entree, sinon vous pouvez directement cabler vos triggers vers les nodes providers que vous placez.

## Triggers et chainage
Ces exports sont des squelettes : placez vos propres triggers (`webhook`, `schedule`, `manual`...) puis orientez vers vos nodes providers configures. Le trigger `so.trigger.registry-loader` reste disponible pour charger des registries depuis Google Drive via les variables d'environnement `REGISTRY_TOOLS_FILE_ID`, `REGISTRY_CAPABILITIES_FILE_ID` et `REGISTRY_USECASES_FILE_ID` dans n8n. Les workflows conservent la convention `so.tool.<provider>` pour l'appel depuis l'executor ; veillez simplement a ce que vos nodes providers renvoient le `tool-result` attendu si vous l'utilisez.
