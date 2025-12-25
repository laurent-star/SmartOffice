# monday (n8n)

## Operations

```json
{
  "provider": "monday",
  "nodeType": "n8n-nodes-base.mondayCom",
  "resources": {
    "boardItem": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "boardId",
              "itemName"
            ],
            "optional": [
              "groupId",
              "columnValues"
            ]
          },
          "returns": {
            "data": [
              "id",
              "boardId"
            ]
          }
        },
        "updateColumnValues": {
          "params": {
            "required": [
              "itemId",
              "columnValues"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "id"
            ]
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
              "id",
              "name",
              "columnValues"
            ]
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
            ]
          }
        },
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
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom/"
  ]
}

```