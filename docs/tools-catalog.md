# Catalogue des tools — Actions et params

Ce document resume les tools, leur categorie et les parametres attendus.

| Tool | Category | Action | Params attendus | Output |
|---|---|---|---|---|
| axonaut | crm | contact.create | contact | contact_id |
| axonaut | crm | company.update | company_id, fields | company_id |
| brevo | marketing | transactionalEmail.send | to, subject, html | messageId |
| brevo | marketing | campaign.create | name, content | campaignId |
| gmail | trigger_message | message.send | to, subject, text | message |
| gmail | trigger_message | message.getMany | query, limit | messages |
| google-calendar | calendar | event.create | summary, start, end | eventId |
| google-calendar | calendar | event.getAll | timeMin, timeMax | events |
| google-docs | ged | document.create | title, folderId | documentId |
| google-docs | ged | document.update | documentId, text | documentId |
| google-docs | ged | document.get | documentId | document |
| google-drive | ged | file.upload | name, folderId, binary | file |
| google-drive | ged | file.get | fileId | file |
| google-drive | ged | fileFolder.search | query | items |
| monday | sales | boardItem.create | boardId, itemName | itemId |
| monday | sales | boardItem.updateColumnValues | itemId, columnValues | itemId |
| openai | llm | chat.summarize | text | summary |
| openai | llm | chat.classify | text, labels | classification |
| openai | llm | chat.extract | text, schema | structured_data |
| slack | validation_humaine | message.send | channel, text | message_id |
| slack | validation_humaine | message.search | query | messages |
| slack | validation_humaine | conversation.getMany | types, limit | conversations |

## Référentiel opérations n8n

Les operations officielles par provider sont definies dans des fragments `registries/n8n-official-ops/<provider>.json` puis assemblees dans `registries/n8n-official-ops.json` via `node scripts/build_n8n_official_ops.js` (docs dedupliquees, controle des doublons/providers et validation AJV).

## Génération & validation

- `node scripts/build_n8n_official_ops.js`
- `node scripts/validate_n8n_official_ops.js`
- `node scripts/generate_registries.js`
- `node scripts/validate_tool_categories.js`
- `node scripts/generate_tool_workflows.js`
