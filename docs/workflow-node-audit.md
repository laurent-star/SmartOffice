# Audit des nodes n8n utilises dans les workflows

## Inventaire des nodes

L'analyse des exports n8n montre 20 types de nodes utilises (132 instances) couvrant les couches triggers, outils et logiques (Set/Code/Switch/etc.).
Les principaux types incluent les integrations Gmail, Slack, Google (Drive/Docs/Sheets/Calendar), Monday, Axonaut, Brevo et OpenAI, ainsi que les nodes core (`manualTrigger`, `webhook`, `code`, `switch`, `if`, `merge`, `set`, etc.).【694201†L1-L20】

## Comparaison doc vs declaration des nodes

Les registries `registries/n8n-official-ops/*.json` listent les parametres requis/optionnels pour chaque operation. Les workflows d'outils declarent uniquement `resource`/`operation` (parfois `additionalFields` vide), ce qui laisse la plupart des champs requis non alimentes.

### Slack (`n8n-nodes-base.slack`)
- **Doc** : `message.send` requiert `channel` et `text` (optionnels `attachments`, `blocks`, `threadTs`), tandis que `message.delete/getPermalink` exigent `channel` et `messageTs` et `message.search` requiert `query`.【F:registries/n8n-official-ops/slack.json†L83-L156】
- **Workflows** : les nodes `message.send`, `message.delete`, `message.getPermalink` et `message.search` ne definissent que `resource`/`operation` avec `additionalFields` vide, aucun champ requis n'est mappe.【F:workflows/tools/slack.workflow.json†L99-L231】
- **Ajustement propose** : renseigner les champs obligatoires via `params` normalise (ex. `channel: ={{$json.params.channel}}`, `text: ={{$json.params.text}}`, etc.) et n'utiliser `additionalFields` que pour les champs optionnels (attachments, blocks, threadTs).

### Google Drive (`n8n-nodes-base.googleDrive`)
- **Doc** : `file.download` et `file.get` requierent `fileId`; `file.upload` requiert `binary`, `folderId`, `name`; `fileFolder.search` requiert `query`; `folder.create` requiert `name`.【F:registries/n8n-official-ops/google-drive.json†L1-L115】
- **Workflows** : dans `so.tool.google-drive`, aucune de ces proprietes n'est definie (seuls `resource`/`operation` + `additionalFields {}`), d'ou l'impossibilite de cibler un fichier/dossier ou de fournir le binaire.【F:workflows/tools/google-drive.workflow.json†L95-L175】
- **Ajustement propose** : mapper `fileId`, `binary`, `folderId`, `name`, `query`, etc. depuis `params` (ex. `fileId: ={{$json.params.fileId}}`, `binaryPropertyName: ={{$json.params.binaryPropertyName || 'data'}}` pour les downloads) et reserver `additionalFields` aux options.

### Google Docs (`n8n-nodes-base.googleDocs`)
- **Doc** : `document.create` requiert `title`; `document.get/update` requierent `documentId`.【F:registries/n8n-official-ops/google-docs.json†L1-L90】
- **Workflows** : les nodes `document.create`, `document.get`, `document.update` n'alimentent aucun de ces champs.【F:workflows/tools/google-docs.workflow.json†L80-L136】
- **Ajustement propose** : assigner `title`/`documentId` via `params` (ex. `documentId: ={{$json.params.documentId}}`).

### Google Sheets (`n8n-nodes-base.googleSheets`)
- **Doc** : `sheet.append` et `sheet.update` exigent `spreadsheetId`, `range` et `values`; `sheet.read` exige `spreadsheetId` et `range`; `spreadsheet.create` requiert `title`.【F:registries/n8n-official-ops/google-sheets.json†L1-L80】
- **Workflows** : aucun de ces champs n'est fourni dans les nodes correspondants.【F:workflows/tools/google-sheets.workflow.json†L83-L155】
- **Ajustement propose** : renseigner les champs requis depuis `params` (ex. `spreadsheetId: ={{$json.params.spreadsheetId}}`, `values: ={{$json.params.values}}`).

### Google Calendar (`n8n-nodes-base.googleCalendar`)
- **Doc** : `event.create` requiert `title`, `start`, `end`; `event.getMany` n'a pas de requis.!【F:registries/n8n-official-ops/google-calendar.json†L1-L60】
- **Workflows** : `event.create` ne mappe aucun de ces champs, seulement `additionalFields` vide.【F:workflows/tools/google-calendar.workflow.json†L83-L118】
- **Ajustement propose** : ajouter `title`, `start`, `end` depuis `params` (et conserver `additionalFields` pour les options telles que calendrier cible).

### Gmail (`n8n-nodes-base.gmail`)
- **Doc** : `message.get` requiert `messageId`; `message.getMany` n'a pas de requis; `message.send` requiert `to` et `subject` (body optionnel via `additionalFields`).【F:registries/n8n-official-ops/gmail.json†L1-L80】
- **Workflows** : les nodes Gmail ne fournissent ni `messageId`, ni `to`/`subject`.【F:workflows/tools/gmail.workflow.json†L80-L135】
- **Ajustement propose** : injecter `messageId`, `to`, `subject` via `params` (ex. `messageId: ={{$json.params.messageId}}`, `to: ={{$json.params.to}}`).

### Monday.com (`n8n-nodes-base.mondayCom`)
- **Doc** : les operations `addUpdate`, `create`, `get`, `getMany`, `updateColumnValues` requierent respectivement (`itemId` + `text`), (`boardId` + `itemName`), (`itemId`), (`boardId`), (`columnValues` + `itemId`).【F:registries/n8n-official-ops/monday.json†L1-L88】
- **Workflows** : aucun de ces champs n'est defini dans les nodes Monday (seulement `resource`/`operation`).【F:workflows/tools/monday.workflow.json†L95-L174】
- **Ajustement propose** : mapper chacun des champs requis depuis `params` (ex. `itemId: ={{$json.params.itemId}}`, `text: ={{$json.params.text}}`, etc.).

### Axonaut (`n8n-nodes-base.axonaut`)
- **Doc** : `company.update` exige `company`; `contact.create` exige `contact`.【F:registries/n8n-official-ops/axonaut.json†L5-L38】
- **Workflows** : les nodes Axonaut ne definissent pas ces attributs et se limitent a `resource`/`operation`.【F:workflows/tools/axonaut.workflow.json†L75-L102】
- **Ajustement propose** : ajouter `company`/`contact` depuis `params` (payload JSON complet attendu par l'API Axonaut).

### Brevo (`n8n-nodes-base.brevo`)
- **Doc** : `campaign.createCampaign` requiert `content` et `name`; `email.sendEmail` requiert `body`, `subject`, `to`.【F:registries/n8n-official-ops/brevo.json†L5-L45】
- **Workflows** : les nodes ne fournissent aucun de ces champs.【F:workflows/tools/brevo.workflow.json†L75-L103】
- **Ajustement propose** : mapper `content`, `name`, `body`, `subject`, `to` depuis `params`; utiliser `additionalFields` pour les pieces jointes eventuelles.

### OpenAI LangChain (`n8n-nodes-langchain.lmchatopenai`)
- **Doc** : `assistant.classify` attend `labels` et `text`; `assistant.extract` attend `schema` et `text`; `assistant.summarize` attend `text` (optionnellement `instructions`).【F:registries/n8n-official-ops/openai.json†L1-L60】
- **Workflows** : les nodes OpenAI n'alimentent aucun de ces champs et laissent `additionalFields` vide.【F:workflows/tools/openai.workflow.json†L80-L120】
- **Ajustement propose** : renseigner les proprietes requises via `params` (ex. `text: ={{$json.params.text}}`, `labels: ={{$json.params.labels}}`, `schema: ={{$json.params.schema}}`).

### Google Drive dans le loader de registries
- **Doc** : `file.download` requiert `fileId` et accepte `binaryPropertyName`.【F:registries/n8n-official-ops/google-drive.json†L1-L24】
- **Workflows** : les nodes de `so.trigger.registry-loader` fournissent `fileId` et `binaryPropertyName` mais gardent `additionalFields` vide (parametre non listé dans la doc).【F:workflows/triggers/registry-loader.trigger.workflow.json†L15-L60】
- **Ajustement propose** : supprimer `additionalFields` vide ou le reserver aux options documentees; sinon aucun champ requis ne manque.

## Synthese

- Tous les workflows d'outils devraient propager les `params` normalises vers les champs requis documentes dans les registries, sans quoi les appels API echoueront ou seront invalides.
- Les champs optionnels doivent etre places dans `additionalFields` uniquement lorsque necessaire; laisser ce bloc vide n'est pas bloquant mais n'apporte rien.
- Un patch type consiste a remplacer chaque node minimal par une version parametree (ex. `"channel": "={{$json.params.channel}}"`, `"fileId": "={{$json.params.fileId}}"`, etc.) pour aligner les workflows sur les exigences des registries.
