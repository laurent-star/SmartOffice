# Catalogue des tools — Actions et params

Ce document resume les tools, leurs categories et les parametres attendus.

| Tool | Categories | Action | Params attendus | Output |
|---|---|---|---|---|
| axonaut | crm, sales, billing | contact.create | contact | contact_id |
| axonaut | crm, sales, billing | company.update | company_id, fields | company_id |
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
| monday | sales, task_manager, crm | boardItem.create | boardId, itemName | itemId |
| monday | sales, task_manager, crm | boardItem.updateColumnValues | itemId, columnValues | itemId |
| openai | llm | chat.summarize | text | summary |
| openai | llm | chat.classify | text, labels | classification |
| openai | llm | chat.extract | text, schema | structured_data |
| slack | validation_humaine | message.send | channel, text | message_id |
| slack | validation_humaine | message.search | query | messages |
| slack | validation_humaine | conversation.getMany | types, limit | conversations |
