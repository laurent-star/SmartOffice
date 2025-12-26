# Brevo (ex-Sendinblue) → contact mapping checklist

## Prérequis
- API key Brevo de test (ne jamais la committer).
- Liste(s) ciblées identifiées pour récupérer des contacts (listIds).
- Dépendances installées : `npm ci`.

## Champs attendus (domaine `prospect/contact`)
- `id` ou identifiant interne.
- `email` (souvent obligatoire côté Brevo).
- `attributes` : FIRSTNAME, LASTNAME, COMPANY…
- `listIds` : appartenance aux listes.
- Flags blacklist : `emailBlacklisted`, `smsBlacklisted`.

## Conventions de mapping
- Utiliser `normalize_array` pour les listes si besoin.
- Mapper les attributs custom vers le domaine cible via `enum_map` ou `concat` (ex: FULLNAME).
- Prévoir un fallback pour les noms si seuls les emails sont fournis.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/brevo/payload.example.json`.
- Tests moteur : `npm run test:mapping`.

## Troubleshooting
- Attribut manquant : vérifier que l'endpoint `contacts/{id}` inclut bien les `attributes` demandés.
- Champs sensibles (blacklist) : s'assurer que les booléens sont bien conservés, sinon ajouter un converter.
- Champs requis du domaine : compléter via `--interactive` ou ajouter un fallback JSON.
