# n8n slack (structured)

```json
{
  "provider": "slack",
  "nodeType": "n8n-nodes-base.slack",
  "resources": {
    "conversation": {
      "operations": {
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "cursor",
              "limit",
              "types"
            ]
          },
          "returns": {
            "data": [
              "conversations",
              "responseMetadata"
            ],
            "binary": []
          }
        }
      }
    },
    "file": {
      "operations": {
        "get": {
          "params": {
            "required": [
              "fileId"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "file"
            ],
            "binary": []
          }
        },
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "channel",
              "count",
              "page",
              "tsFrom",
              "tsTo",
              "user"
            ]
          },
          "returns": {
            "data": [
              "files",
              "pagination"
            ],
            "binary": []
          }
        },
        "upload": {
          "params": {
            "required": [
              "binary",
              "channels"
            ],
            "optional": [
              "filename",
              "initialComment",
              "title"
            ]
          },
          "returns": {
            "data": [
              "file"
            ],
            "binary": []
          }
        }
      }
    },
    "message": {
      "operations": {
        "delete": {
          "params": {
            "required": [
              "channel",
              "messageTs"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "ok"
            ],
            "binary": []
          }
        },
        "getPermalink": {
          "params": {
            "required": [
              "channel",
              "messageTs"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "permalink"
            ],
            "binary": []
          }
        },
        "search": {
          "params": {
            "required": [
              "query"
            ],
            "optional": [
              "count",
              "page",
              "sort",
              "sortDir"
            ]
          },
          "returns": {
            "data": [
              "messages",
              "pagination"
            ],
            "binary": []
          }
        },
        "send": {
          "params": {
            "required": [
              "channel",
              "text"
            ],
            "optional": [
              "attachments",
              "blocks",
              "threadTs"
            ]
          },
          "returns": {
            "data": [
              "channel",
              "message",
              "ts"
            ],
            "binary": []
          }
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
