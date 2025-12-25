# n8n brevo (structured)

```json
{
  "provider": "brevo",
  "nodeType": "n8n-nodes-base.brevo",
  "resources": {
    "campaign": {
      "operations": {
        "createCampaign": {
          "params": {
            "required": [
              "content",
              "name"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "campaign_id"
            ],
            "binary": []
          }
        }
      }
    },
    "email": {
      "operations": {
        "sendEmail": {
          "params": {
            "required": [
              "body",
              "subject",
              "to"
            ],
            "optional": [
              "attachments"
            ]
          },
          "returns": {
            "data": [
              "message_id"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.brevo/
