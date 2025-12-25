# Catalogue des tools — Actions et params

Ce document resume les tools, leur categorie et les parametres attendus.

| Tool | Category | Action | Params attendus | Output |
|---|---|---|---|---|
| axonaut | crm | create_contact | contact | contact_id |
| axonaut | crm | update_company | company | company_id |
| brevo | marketing | send_email | to, subject, body | message_id |
| brevo | marketing | create_campaign | name, content | campaign_id |
| gmail | trigger_message | send_email | to, subject, body | message_id |
| gmail | trigger_message | search_email | query | messages |
| google-docs | ged | create_document | title, content | document_id |
| google-docs | ged | fill_template | template_id, data | document_id |
| google-drive | ged | upload_file | path, folder | file_id |
| google-drive | ged | share_file | file_id, emails | sharing_status |
| monday | task_manager | create_item | board_id, item | item_id |
| monday | task_manager | update_item | item_id, fields | item_id |
| openai | llm | summarize | text | summary |
| openai | llm | classify | text, labels | classification |
| openai | llm | extract | text, schema | structured_data |
| slack | trigger_message | send_message | channel, text | message_id |
| slack | trigger_message | find_channel | name | channel |
| slack | trigger_message | invite_user | channel, user | status |
