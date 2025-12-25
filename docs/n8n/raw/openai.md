# n8n openai (structured)

```json
{
  "provider": "openai",
  "nodeType": "n8n-nodes-base.openAi",
  "resources": {
    "assistant": {
      "operations": {
        "classify": {
          "params": {
            "required": [
              "labels",
              "text"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "classification"
            ],
            "binary": []
          }
        },
        "extract": {
          "params": {
            "required": [
              "schema",
              "text"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "structured_data"
            ],
            "binary": []
          }
        },
        "summarize": {
          "params": {
            "required": [
              "text"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "summary"
            ],
            "binary": []
          },
          "notes": [
            "Basé sur le node OpenAI (chat/completion) pour générer un résumé"
          ]
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/
