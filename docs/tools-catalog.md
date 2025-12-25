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
| google-calendar | calendar | create_event | title, start, end | event_id |
| google-calendar | calendar | list_events | time_min, time_max | events |
| google-docs | ged | create_document | title, content | document_id |
| google-docs | ged | fill_template | template_id, data | document_id |
| google-drive | ged | upload_file | path, folder | file_id |
| google-drive | ged | share_file | file_id, emails | sharing_status |
| monday | sales | create_item | board_id, item | item_id |
| monday | sales | update_item | item_id, fields | item_id |
| openai | llm | summarize | text | summary |
| openai | llm | classify | text, labels | classification |
| openai | llm | extract | text, schema | structured_data |
| slack | validation_humaine | send_message | channel, text | message_id |
| slack | validation_humaine | find_channel | name | channel |
| slack | validation_humaine | invite_user | channel, user | status |
