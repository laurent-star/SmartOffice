# google-drive (n8n)

## Operations

```json
{
  "provider": "google-drive",
  "nodeType": "n8n-nodes-base.googleDrive",
  "resources": {
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
            ]
          }
        }
      }
    },
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
        "upload": {
          "params": {
            "required": [
              "name",
              "folderId",
              "binary"
            ],
            "optional": [
              "mimeType"
            ]
          },
          "returns": {
            "data": [
              "id",
              "name",
              "mimeType",
              "webViewLink"
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
              "name",
              "mimeType",
              "parents",
              "webViewLink"
            ]
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
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/"
  ]
}

```