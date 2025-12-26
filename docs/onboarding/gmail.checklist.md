# Gmail → email/message mapping checklist

## Prérequis
- Compte de service ou OAuth test avec scopes Gmail readonly (ne jamais committer de credentials).
- Identifiant de mailbox / user pour les tests et samples (voir `samples/gmail/payload.example.json`).
- Dépendances installées : `npm ci`.

## Champs attendus (selon domaine ciblé)
- Identifiant de message : `message.id`.
- Métadonnées : `From`, `To`, `Subject` (headers).
- Corps ou snippet : `snippet`/`payload.parts`.
- Pièces jointes : `parts[].body.attachmentId` et `filename`/`mimeType`.
- Horodatage : `internalDate` (ms depuis epoch).

## Conventions de mapping
- Convertir `internalDate` en ISO via `date_iso` ou un converter custom si nécessaire.
- Pour combiner plusieurs headers (nom + email), utiliser `concat` avec des bindings explicites.
- Normaliser les pièces jointes en tableau avant validation (`normalize_array`).

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif ciblé : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/gmail/payload.example.json`.
- Tests runtime : `npm run test:mapping`.

## Troubleshooting
- Headers manquants : vérifier les scopes Gmail et le format de la collecte (full vs metadata only).
- Attachments absents : s'assurer que `payload.parts` est inclus dans la réponse Gmail.
- Champs requis manquants : compléter via `--interactive` ou ajouter des `fallback` explicites.
