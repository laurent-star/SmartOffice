# n8n google-docs (structured)

```json
{
  "provider": "google-docs",
  "nodeType": "n8n-nodes-base.googleDocs",
  "resources": {
    "document": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "title"
            ],
            "optional": [
              "folderId"
            ]
          },
          "returns": {
            "data": [
              "documentId",
              "title"
            ],
            "binary": []
          }
        },
        "get": {
          "params": {
            "required": [
              "documentId"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "body",
              "documentId",
              "title"
            ],
            "binary": []
          }
        },
        "update": {
          "params": {
            "required": [
              "documentId"
            ],
            "optional": [
              "html",
              "requests",
              "text"
            ]
          },
          "returns": {
            "data": [
              "documentId"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledocs/
