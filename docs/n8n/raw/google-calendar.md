# google-calendar (n8n)

## Operations

```json
{
  "provider": "google-calendar",
  "nodeType": "n8n-nodes-base.googleCalendar",
  "resources": {
    "event": {
      "operations": {
        "create": {
          "params": {
            "required": [
              "title",
              "start",
              "end"
            ],
            "optional": [
              "description",
              "attendees"
            ]
          },
          "returns": {
            "data": [
              "eventId",
              "htmlLink"
            ]
          }
        },
        "getMany": {
          "params": {
            "required": [],
            "optional": [
              "timeMin",
              "timeMax",
              "limit"
            ]
          },
          "returns": {
            "data": [
              "events",
              "nextPageToken"
            ]
          }
        }
      }
    }
  },
  "sourceDocs": [
    "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/"
  ]
}

```