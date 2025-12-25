# axonaut (n8n)

## Operations

```json
{
  "provider": "axonaut",
  "nodeType": "n8n-nodes-base.axonaut",
  "resources": {
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
            ]
          },
          "description": "Cree un contact dans Axonaut"
        }
      }
    },
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
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/third-party/axonaut/"
  ]
}

```