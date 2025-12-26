# Google Calendar → event mapping checklist

## Prérequis
- Compte de service/OAuth avec scope calendar.readonly (ne pas committer les credentials).
- Agenda cible identifié et sample d'évènement (voir `samples/google-calendar/payload.example.json`).
- Dépendances installées : `npm ci`.

## Champs attendus (domaine événement ou custom)
- `id` : identifiant d'évènement.
- `summary`/`title` : titre de l'évènement.
- `start` / `end` : `dateTime` en ISO (UTC si possible).
- Participants : `attendees[].email`.
- Lien visioconférence : `conferenceData.entryPoints[].uri`.
- Organisateur / creator : emails.

## Conventions de mapping
- Normaliser les dates via `date_iso` pour éviter les offsets.
- Pour récupérer la visioconf, prioriser `entryPoints` de type `video`.
- Nettoyer les emails en tableau via `normalize_array` si le domaine cible l'exige.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif ciblé : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/google-calendar/payload.example.json`.
- Tests runtime (moteur) : `npm run test:mapping`.

## Troubleshooting
- Décalage horaire : préciser `timezone: UTC` dans le converter `date_iso`.
- Attendees vides : vérifier que l'API est appelée avec `maxAttendees` suffisant et `conferenceDataVersion` activé.
- Champs requis manquants : compléter via le mode `--interactive`.
