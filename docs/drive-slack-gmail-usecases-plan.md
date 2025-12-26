# Use cases Drive ↔ Slack ↔ Gmail — Resume

Ce document est un resume fonctionnel des use cases cibles.
Il ne contient pas de plan d'execution. Le suivi se fait via le README principal.

## Use cases

- document.file.notify : recupere un document Drive, le resume et notifie sur Slack.
- document.request.email : repond a une requete avec un document Drive puis envoi Gmail.

## Capabilities requises

- document.file.fetch
- content.text.summarize
- notification.message.send
- human.validation.request (optionnel)

## Outils impliques

- google-drive
- slack
- gmail
- openai
