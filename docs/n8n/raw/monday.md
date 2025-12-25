# n8n monday (structured)

```json
{
  "provider": "monday",
  "nodeType": "n8n-nodes-base.mondayCom",
  "resources": {
    "boardItem": {
      "operations": {
        "addUpdate": {
          "params": {
            "required": [
              "itemId",
              "text"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "id"
            ],
            "binary": []
          }
        },
        "create": {
          "params": {
            "required": [
              "boardId",
              "itemName"
            ],
            "optional": [
              "columnValues",
              "groupId"
            ]
          },
          "returns": {
            "data": [
              "boardId",
              "id"
            ],
            "binary": []
          }
        },
        "get": {
          "params": {
            "required": [
              "itemId"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "columnValues",
              "id",
              "name"
            ],
            "binary": []
          }
        },
        "getMany": {
          "params": {
            "required": [
              "boardId"
            ],
            "optional": [
              "limit",
              "page"
            ]
          },
          "returns": {
            "data": [
              "items",
              "pagination"
            ],
            "binary": []
          }
        },
        "updateColumnValues": {
          "params": {
            "required": [
              "columnValues",
              "itemId"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "id"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom/
