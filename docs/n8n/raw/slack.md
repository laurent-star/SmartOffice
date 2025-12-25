# slack (n8n)

## Operations

```json
{
  "provider": "slack",
  "nodeType": "n8n-nodes-base.slack",
  "resources": {
    "message": {
      "operations": {
        "send": {
          "params": {
            "required": [
              "channel",
              "text"
            ],
            "optional": [
              "threadTs",
              "blocks",
              "attachments"
            ]
          },
          "returns": {
            "data": [
              "channel",
              "ts",
              "message"
            ]
          }
        },
        "search": {
          "params": {
            "required": [
              "query"
            ],
            "optional": [
              "sort",
              "sortDir",
              "count",
              "page"
            ]
          },
          "returns": {
            "data": [
              "messages",
              "pagination"
            ]
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
            ]
          }
        },
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
            ]
          }
        }
      }
    },
    "file": {
      "operations": {
        "upload": {
          "params": {
            "required": [
              "channels",
              "binary"
            ],
            "optional": [
              "filename",
              "title",
              "initialComment"
            ]
          },
          "returns": {
            "data": [
              "file"
            ]
          }
        },
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
            ]
          }
        },
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "user",
              "channel",
              "tsFrom",
              "tsTo",
              "count",
              "page"
            ]
          },
          "returns": {
            "data": [
              "files",
              "pagination"
            ]
          }
        }
      }
    },
    "conversation": {
      "operations": {
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "types",
              "limit",
              "cursor"
            ]
          },
          "returns": {
            "data": [
              "conversations",
              "responseMetadata"
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/"
  ]
}

```