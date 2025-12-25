# n8n google-drive (structured)

```json
{
  "provider": "google-drive",
  "nodeType": "n8n-nodes-base.googleDrive",
  "resources": {
    "file": {
      "operations": {
        "download": {
          "params": {
            "required": [
              "fileId"
            ],
            "optional": [
              "binaryPropertyName"
            ]
          },
          "returns": {
            "data": [
              "fileId"
            ],
            "binary": [
              "binaryPropertyName"
            ]
          }
        },
        "get": {
          "params": {
            "required": [
              "fileId"
            ],
            "optional": [
              "simplifyOutput"
            ]
          },
          "returns": {
            "data": [
              "id",
              "mimeType",
              "name",
              "parents",
              "webViewLink"
            ],
            "binary": []
          }
        },
        "upload": {
          "params": {
            "required": [
              "binary",
              "folderId",
              "name"
            ],
            "optional": [
              "mimeType"
            ]
          },
          "returns": {
            "data": [
              "id",
              "mimeType",
              "name",
              "webViewLink"
            ],
            "binary": []
          }
        }
      }
    },
    "fileFolder": {
      "operations": {
        "search": {
          "params": {
            "required": [
              "query"
            ],
            "optional": [
              "limit",
              "returnAll"
            ]
          },
          "returns": {
            "data": [
              "items",
              "nextPageToken"
            ],
            "binary": []
          }
        }
      }
    },
    "folder": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "name"
            ],
            "optional": [
              "parentFolderId"
            ]
          },
          "returns": {
            "data": [
              "id",
              "name"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/
