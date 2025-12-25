# n8n gmail (structured)

```json
{
  "provider": "gmail",
  "nodeType": "n8n-nodes-base.gmail",
  "resources": {
    "message": {
      "operations": {
        "get": {
          "params": {
            "required": [
              "messageId"
            ],
            "optional": [
              "format"
            ]
          },
          "returns": {
            "data": [
              "id",
              "internalDate",
              "payload",
              "snippet",
              "threadId"
            ],
            "binary": []
          }
        },
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "includeSpamTrash",
              "limit",
              "query"
            ]
          },
          "returns": {
            "data": [
              "messages",
              "nextPageToken"
            ],
            "binary": []
          }
        },
        "send": {
          "params": {
            "required": [
              "subject",
              "to"
            ],
            "optional": [
              "attachments",
              "html",
              "text",
              "threadId"
            ]
          },
          "returns": {
            "data": [
              "id",
              "labelIds",
              "threadId"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/
