# Use cases Drive ↔ Slack ↔ Gmail — Resume

Ce document est un resume fonctionnel des use cases cibles.
Il ne contient pas de plan d'execution. Le suivi se fait via le README principal.

## Use cases

- drive_to_slack_notify : partage un document Drive, le resume et notifie sur Slack.
- slack_drive_to_gmail : repond a une requete Slack avec un document Drive puis envoi Gmail.

## Capabilities requises

- serve_document_drive
- notify_user
- summarize_content (si besoin d'un resume avance)
- human_validation (optionnel)

## Outils impliques

- google-drive
- slack
- gmail
- openai
