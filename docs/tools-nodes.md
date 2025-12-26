# Inventaire des nodes

Tous les workflows d'outils normalisent l'entrée (`provider`, `operation`, `params`) puis alimentent les champs requis documentés dans `registries/n8n-official-ops/*.json`. Les options facultatives sont regroupées dans `additionalFields` ou `options` selon le node.

I/O contract (rappel):

- Input attendu : `toolInput` (voir `contracts/tool-input.schema.json`).
- Normalisation type : `tool.operation` -> `operation`, `tool.provider` -> `provider`, `params` -> `params`.
- Output obligatoire : `toolResult` (voir `contracts/tool-result.schema.json`).

## Tools

### Google Drive (`workflows/tools/google-drive.workflow.json`)
- Nombre total de nodes : 8
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, file.download, file.upload, fileFolder.search, folder.create, sampleFetch
- Champs requis mappés : `fileId` (download/sample), `binary` + `folderId` + `name` (upload), `query` (fileFolder.search), `name` (folder.create) avec `binaryPropertyName` par défaut `data` dans `options` pour les téléchargements.【F:workflows/tools/google-drive.workflow.json†L93-L154】

### OpenAI (`workflows/tools/openai.workflow.json`)
- Nombre total de nodes : 7
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, text.classifyTextForViolations, text.generateModelResponse, text.generateChatCompletion, sampleFetch
- Champs requis mappés : `text` pour chaque opération, avec `labels` et `schema` injectés dans le prompt pour les actions de classification et d'extraction.【F:workflows/tools/openai.workflow.json†L90-L144】

### Slack (`workflows/tools/slack.workflow.json`)
- Nombre total de nodes : 12
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, conversation.getMany, file.get, file.getMany, file.upload, message.delete, message.getPermalink, message.search, message.send, sampleFetch
- Champs requis mappés : `fileId` (file.get), `binary`/`channels` (file.upload), `channel`/`messageTs` (delete/getPermalink), `query` (search/sample), `channel`/`text` (send) avec options réparties dans `additionalFields`.【F:workflows/tools/slack.workflow.json†L115-L214】

### Gmail (`workflows/tools/gmail.workflow.json`)
- Nombre total de nodes : 8
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, message.get, message.getMany, message.send, sampleFetch, sampleFetch utilise send
- Champs requis mappés : `messageId` (get), `subject`/`to` (send/sample) et options `format`, `query`, `attachments`, `html`, `text`, `threadId` au sein de `additionalFields`.【F:workflows/tools/gmail.workflow.json†L114-L189】

### Google Calendar (`workflows/tools/google-calendar.workflow.json`)
- Nombre total de nodes : 6
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, event.create, event.getMany, sampleFetch
- Champs requis mappés : `title`, `start`, `end`, `calendar` pour `event.create` et `sampleFetch`, avec options `attendees`, `description`, `limit`, `timeMax`, `timeMin` dans `additionalFields`.【F:workflows/tools/google-calendar.workflow.json†L93-L154】

### Google Docs (`workflows/tools/google-docs.workflow.json`)
- Nombre total de nodes : 7
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, document.create, document.get, document.update, sampleFetch
- Champs requis mappés : `title` (create), `documentId` (get/update/sample) et champs optionnels `folderId`, `html`, `requests`, `text` dans `additionalFields`.【F:workflows/tools/google-docs.workflow.json†L93-L160】

### Google Sheets (`workflows/tools/google-sheets.workflow.json`)
- Nombre total de nodes : 9
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, sheet.append, sheet.read, sheet.update, spreadsheet.create, sampleFetch
- Champs requis mappés : `range`, `spreadsheetId`, `values` (append/update), `range`/`spreadsheetId` (read/sample), `title` (spreadsheet.create) avec options `valueInputMode`, `returnAll`, `folderId`, `templateId` dans `additionalFields`.【F:workflows/tools/google-sheets.workflow.json†L93-L172】

### Monday.com (`workflows/tools/monday.workflow.json`)
- Nombre total de nodes : 9
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, boardItem.addUpdate, boardItem.create, boardItem.get, boardItem.getMany, boardItem.updateColumnValues, sampleFetch
- Champs requis mappés : `itemId`/`text` (addUpdate), `boardId`/`itemName` (create), `itemId` (get/updateColumnValues/sample), `boardId` (getMany) avec options `columnValues`, `groupId`, `limit`, `page`.【F:workflows/tools/monday.workflow.json†L95-L184】

### Axonaut (`workflows/tools/axonaut.workflow.json`)
- Nombre total de nodes : 5
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, company.update, contact.create, sampleFetch
- Champs requis mappés : `company` (update) et `contact` (create/sample) pour respecter les payloads attendus par l'API Axonaut.【F:workflows/tools/axonaut.workflow.json†L83-L132】

### Brevo (`workflows/tools/brevo.workflow.json`)
- Nombre total de nodes : 5
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, campaign.createCampaign, email.sendEmail, sampleFetch
- Champs requis mappés : `content`/`name` (createCampaign) et `body`/`subject`/`to` (sendEmail/sample), avec `attachments` en option.【F:workflows/tools/brevo.workflow.json†L82-L134】

## Agents

### Supervisor (`workflows/agent/supervisor.workflow.json`)
- Nombre total de nodes : 2
- Liste : Agent Trigger, Build Execution Envelope

### Planificator (`workflows/agent/planner.workflow.json`)
- Nombre total de nodes : 2
- Liste : Agent Trigger, Build Execution Envelope
