# Catalogue des tools — Actions et params

Ce document résume les tools, leur catégorie et les paramètres attendus.

| Tool | Category | Action | Params attendus | Output |
|---|---|---|---|---|
| axonaut | crm | contact.create | contact | contact_id |
| axonaut | crm | company.update | company | company_id |
| brevo | marketing | email.sendEmail | to, subject, body | message_id |
| brevo | marketing | campaign.createCampaign | name, content | campaign_id |
| gmail | trigger_message | message.send | to, subject, body | message_id |
| gmail | trigger_message | message.getMany | query | messages |
| google-calendar | calendar | event.create | title, start, end | event_id |
| google-calendar | calendar | event.getMany | time_min, time_max | events |
| google-docs | ged | document.create | title, content | document_id |
| google-docs | ged | document.update | document_id, data | document_id |
| google-drive | ged | file.upload | path, folder | file_id |
| google-drive | ged | file.download | file_id | file |
| monday | sales | boardItem.create | board_id, item | item_id |
| monday | sales | boardItem.updateColumnValues | item_id, fields | item_id |
| openai | llm | assistant.summarize | text | summary |
| openai | llm | assistant.classify | text, labels | classification |
| openai | llm | assistant.extract | text, schema | structured_data |
| slack | validation_humaine | message.send | channel, text | message_id |
| slack | validation_humaine | conversation.getMany | types | conversations |
| slack | validation_humaine | file.upload | channels, binary | file |

## Référentiel opérations n8n

La source de vérité des opérations disponibles est maintenue dans [`registries/n8n-official-ops.json`](../registries/n8n-official-ops.json).

## Génération & validation

- `node scripts/validate_n8n_official_ops.js`
- `node scripts/generate_registries.js`
- `node scripts/validate_tool_categories.js`
- `node scripts/generate_tool_workflows.js`

Les générateurs relisent `registries/n8n-official-ops.json` pour contrôler les actions déclarées et produire les workflows/tool
s en cohérence avec les contrats.
