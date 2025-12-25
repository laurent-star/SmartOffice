# google-sheets (n8n)

## Operations

```json
{
  "provider": "google-sheets",
  "nodeType": "n8n-nodes-base.googleSheets",
  "resources": {
    "spreadsheet": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "title"
            ],
            "optional": [
              "folderId",
              "templateId"
            ]
          },
          "returns": {
            "data": [
              "spreadsheetId",
              "spreadsheetUrl",
              "title"
            ]
          }
        }
      }
    },
    "sheet": {
      "operations": {
        "append": {
          "params": {
            "required": [
              "spreadsheetId",
              "range",
              "values"
            ],
            "optional": [
              "valueInputMode"
            ]
          },
          "returns": {
            "data": [
              "updatedRange",
              "updates"
            ]
          }
        },
        "read": {
          "params": {
            "required": [
              "spreadsheetId",
              "range"
            ],
            "optional": [
              "returnAll"
            ]
          },
          "returns": {
            "data": [
              "values"
            ]
          }
        },
        "update": {
          "params": {
            "required": [
              "spreadsheetId",
              "range",
              "values"
            ],
            "optional": [
              "valueInputMode"
            ]
          },
          "returns": {
            "data": [
              "updatedRange",
              "updates"
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/"
  ]
}

```