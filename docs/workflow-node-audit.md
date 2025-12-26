# Audit des nodes n8n utilises dans les workflows

## Inventaire des nodes

L'analyse des exports n8n montre 20 types de nodes utilises (132 instances) couvrant les couches triggers, outils et logiques (Set/Code/Switch/etc.).
Les principaux types incluent les integrations Gmail, Slack, Google (Drive/Docs/Sheets/Calendar), Monday, Axonaut, Brevo et OpenAI, ainsi que les nodes core (`manualTrigger`, `webhook`, `code`, `switch`, `if`, `merge`, `set`, etc.).【694201†L1-L20】

## Comparaison doc vs declaration des nodes

Les registries `registries/n8n-official-ops/*.json` listent les parametres requis/optionnels pour chaque operation. Les workflows d'outils propagent desormais les `params` normalises vers ces champs requis et utilisent `additionalFields` uniquement pour les options documentees.

### Slack (`n8n-nodes-base.slack`)
- **Doc** : `message.send` requiert `channel` et `text` (optionnels `attachments`, `blocks`, `threadTs`), tandis que `message.delete/getPermalink` exigent `channel` et `messageTs` et `message.search` requiert `query`.【F:registries/n8n-official-ops/slack.json†L83-L156】
- **Workflows** : les nodes alimentent désormais tous les champs obligatoires via `params` (`fileId`, `binary`, `channels`, `channel`, `messageTs`, `query`, `text`) et isolent les options dans `additionalFields` (pagination, pièces jointes, threads, blocs, etc.).【F:workflows/tools/slack.workflow.json†L115-L214】
- **Ajustement applique** : chaque operation s'appuie sur l'entrée normalisée, supprimant les noeuds avec `additionalFields` vides.

### Google Drive (`n8n-nodes-base.googleDrive`)
- **Doc** : `file.download` et `file.get` requierent `fileId`; `file.upload` requiert `binary`, `folderId`, `name`; `fileFolder.search` requiert `query`; `folder.create` requiert `name`.【F:registries/n8n-official-ops/google-drive.json†L1-L115】
- **Workflows** : les nodes propagent maintenant `fileId`, `binary`, `folderId`, `name`, `query` et fixent `binaryPropertyName` par defaut a `data` pour `file.download`, en gardant les options (`mimeType`, `limit`, `returnAll`, `parentFolderId`) dans `additionalFields`.【F:workflows/tools/google-drive.workflow.json†L96-L156】
- **Ajustement applique** : chaque operation peut cibler le fichier/dossier voulu sans recourir a des valeurs par defaut implicites.

### Google Docs (`n8n-nodes-base.googleDocs`)
- **Doc** : `document.create` requiert `title`; `document.get/update` requierent `documentId`.【F:registries/n8n-official-ops/google-docs.json†L1-L90】
- **Workflows** : les operations injectent `title` et `documentId` depuis `params` et placent `folderId`, `html`, `requests`, `text` dans `additionalFields` pour conserver la separation requis/options.【F:workflows/tools/google-docs.workflow.json†L93-L160】
- **Ajustement applique** : la creation et la mise a jour ciblent bien les documents demandes.

### Google Sheets (`n8n-nodes-base.googleSheets`)
- **Doc** : `sheet.append` et `sheet.update` exigent `spreadsheetId`, `range` et `values`; `sheet.read` exige `spreadsheetId` et `range`; `spreadsheet.create` requiert `title`.【F:registries/n8n-official-ops/google-sheets.json†L1-L80】
- **Workflows** : les nodes mappent `range`, `spreadsheetId`, `values` et `title` depuis `params`, en rangeant `valueInputMode`, `returnAll`, `folderId`, `templateId` dans `additionalFields`.【F:workflows/tools/google-sheets.workflow.json†L93-L172】
- **Ajustement applique** : les ecritures et lectures se font sur les feuilles ciblees, sans champs manquants.

### Google Calendar (`n8n-nodes-base.googleCalendar`)
- **Doc** : `event.create` requiert `title`, `start`, `end`; `event.getMany` n'a pas de requis.!【F:registries/n8n-official-ops/google-calendar.json†L1-L60】
- **Workflows** : `event.create` et `sampleFetch` consomment `title`, `start`, `end` et exposent les options `attendees`, `description`, `limit`, `timeMax`, `timeMin` dans `additionalFields`.【F:workflows/tools/google-calendar.workflow.json†L93-L154】
- **Ajustement applique** : les evenements utilisaient bien les parametres transmis par l'appelant.

### Gmail (`n8n-nodes-base.gmail`)
- **Doc** : `message.get` requiert `messageId`; `message.getMany` n'a pas de requis; `message.send` requiert `to` et `subject` (body optionnel via `additionalFields`).【F:registries/n8n-official-ops/gmail.json†L1-L80】
- **Workflows** : `message.get` lit `messageId`, `message.send`/`sampleFetch` remplissent `subject` et `to` et utilisent `additionalFields` pour `format`, `query`, `attachments`, `html`, `text`, `threadId`.【F:workflows/tools/gmail.workflow.json†L114-L189】
- **Ajustement applique** : envoi et lecture respectent les exigences Gmail sans champs manquants.

### Monday.com (`n8n-nodes-base.mondayCom`)
- **Doc** : les operations `addUpdate`, `create`, `get`, `getMany`, `updateColumnValues` requierent respectivement (`itemId` + `text`), (`boardId` + `itemName`), (`itemId`), (`boardId`), (`columnValues` + `itemId`).【F:registries/n8n-official-ops/monday.json†L1-L88】
- **Workflows** : tous ces champs sont injectes depuis `params`, avec les options (`columnValues`, `groupId`, `limit`, `page`) regroupees dans `additionalFields` pour conserver la distinction requis/options.【F:workflows/tools/monday.workflow.json†L95-L184】
- **Ajustement applique** : les appels Monday peuvent maintenant cibler elements et tableaux sans parametres implicites.

### Axonaut (`n8n-nodes-base.axonaut`)
- **Doc** : `company.update` exige `company`; `contact.create` exige `contact`.【F:registries/n8n-official-ops/axonaut.json†L5-L38】
- **Workflows** : les champs `company` et `contact` sont désormais fournis via `params`, y compris sur le node de sample pour aligner les exemples.【F:workflows/tools/axonaut.workflow.json†L83-L132】
- **Ajustement applique** : les payloads Axonaut sont passes tels quels depuis les appels entrants.

### Brevo (`n8n-nodes-base.brevo`)
- **Doc** : `campaign.createCampaign` requiert `content` et `name`; `email.sendEmail` requiert `body`, `subject`, `to`.【F:registries/n8n-official-ops/brevo.json†L5-L45】
- **Workflows** : les nodes saisissent ces champs depuis `params` et reservent `attachments` a `additionalFields` pour les emails. Le sample applique le meme schema.【F:workflows/tools/brevo.workflow.json†L82-L134】
- **Ajustement applique** : les envois de campagnes et emails sont conformes aux exigences Brevo.

### OpenAI LangChain (`n8n-nodes-langchain.lmchatopenai`)
- **Doc** : `assistant.classify` attend `labels` et `text`; `assistant.extract` attend `schema` et `text`; `assistant.summarize` attend `text` (optionnellement `instructions`).【F:registries/n8n-official-ops/openai.json†L1-L60】
- **Workflows** : chaque node renseigne les champs attendus depuis `params` et expose `instructions` en option pour `assistant.summarize` et le sample associe.【F:workflows/tools/openai.workflow.json†L90-L144】
- **Ajustement applique** : les prompts et schemas sont systematiquement fournis par l'appelant.

### Google Drive dans le loader de registries
- **Doc** : `file.download` requiert `fileId` et accepte `binaryPropertyName`.【F:registries/n8n-official-ops/google-drive.json†L1-L24】
- **Workflows** : les nodes de `so.trigger.registry-loader` fournissent `fileId` et `binaryPropertyName` sans laisser d'`additionalFields` superflu, conformément a la doc.【F:workflows/triggers/registry-loader.trigger.workflow.json†L14-L71】
- **Ajustement applique** : suppression des `additionalFields` vides pour coller a la specification.

## Synthese

- Les workflows d'outils sont alignes avec les exigences documentaires : chaque node lit les champs requis via `params` et reserve `additionalFields` aux options.
- Les triggers utilitaires (ex. loader de registries) ont ete nettoyes pour ne conserver que les attributs supportes par les nodes n8n utilises.
- La validation contractuelle (schema `workflow-tool`) inclut desormais le passage obligatoire par un node **Normalize Input** pour garantir la presence des `params` normalises avant dispatch.
