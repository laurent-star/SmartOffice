# n8n axonaut (structured)

```json
{
  "provider": "axonaut",
  "nodeType": "n8n-nodes-base.axonaut",
  "resources": {
    "company": {
      "operations": {
        "update": {
          "params": {
            "required": [
              "company"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "company_id"
            ],
            "binary": []
          }
        }
      }
    },
    "contact": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "contact"
            ],
            "optional": []
          },
          "returns": {
            "data": [
              "contact_id"
            ],
            "binary": []
          },
          "description": "Cree un contact dans Axonaut"
        }
      }
    }
  }
}
```

Source: https://docs.n8n.io/integrations/third-party/axonaut/
