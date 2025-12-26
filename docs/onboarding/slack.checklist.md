# Slack → events/messages mapping checklist

## Prérequis
- Application Slack installée sur l'espace de test avec scopes lecture des messages et fichiers (pas de tokens en clair dans le repo).
- Channel cible identifié et échantillons exportés (utiliser `samples/slack/payload.example.json` pour dry-run).
- Dépendances installées : `npm ci`.

## Champs attendus (selon domaine ciblé)
- Identifiants : `event.id` ou `ts` pour suivre les messages.
- Auteur : `user` et `team`.
- Contenu : `text`, pièces jointes (`files`) avec `mimetype` et `url_private`.
- Métadonnées : `channel`, horodatage (`ts`).

## Conventions de mapping
- Nettoyer les mentions/emoji avant concat si nécessaire (`concat`).
- Normaliser les tableaux de fichiers (`normalize_array`).
- Timezones : convertir `ts` Unix en ISO si attendu par le domaine cible.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif sur un mapping Slack (une fois le YAML créé) : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/slack/payload.example.json`.
- Tests runtime : `npm run test:mapping` (couvre aussi le moteur générique).

## Troubleshooting
- Évènements tronqués : vérifier que l’app Slack collecte bien le champ `files`/`attachments`.
- Horodatage incorrect : appliquer un converter `date_iso` sur la valeur Unix (en ms ou secondes).
- Champs requis manquants : passer par `--interactive` pour ajouter les sources ou des fallbacks sûrs.
