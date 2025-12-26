# Axonaut → CRM mapping checklist

## Prérequis
- Compte sandbox Axonaut avec API key de test (ne pas committer la clé).
- Ressource ciblée : contacts/prospects et statut (lead, client...).
- Dépendances installées : `npm ci`.

## Champs attendus (ex. domaine `prospect`)
- `id` : identifiant du contact.
- `name` : concat prénom + nom.
- `lifecycle_stage` : valeurs normalisées (lead/opportunity/etc.).
- Coordonnées : `email`, `phone` en tableau.
- `owner` ou conseiller.

## Conventions de mapping
- Utiliser `concat` pour combiner `firstname` + `lastname`.
- Mapper le statut Axonaut vers les enums du domaine via `enum_map`.
- Normaliser emails/téléphones via `normalize_array`.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/axonaut/payload.example.json`.
- Tests moteur : `npm run test:mapping`.

## Troubleshooting
- Données manquantes : vérifier les champs retournés par l'API (certains endpoints renvoient des clés différentes).
- Enum inconnue : étendre la map de statut dans le YAML.
- Champs requis : compléter via `--interactive` ou ajouter un `fallback` temporaire pour débloquer le lint.
