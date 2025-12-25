# n8n google-sheets (structured)

```json
{
  "provider": "google-sheets",
  "nodeType": "n8n-nodes-base.googleSheets",
  "resources": {
    "sheet": {
      "operations": {
        "append": {
          "params": {
            "required": [
              "range",
              "spreadsheetId",
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
            ],
            "binary": []
          }
        },
        "read": {
          "params": {
            "required": [
              "range",
              "spreadsheetId"
            ],
            "optional": [
              "returnAll"
            ]
          },
          "returns": {
            "data": [
              "values"
            ],
            "binary": []
          }
        },
        "update": {
          "params": {
            "required": [
              "range",
              "spreadsheetId",
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
            ],
            "binary": []
          }
        }
      }
    },
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
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
