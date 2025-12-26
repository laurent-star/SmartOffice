# HubSpot → prospect mapping checklist

## Prérequis
- Clé API privée ou token OAuth de test (ne pas committer la valeur).
- Pipeline/objects ciblés : contacts et deals associés si besoin.
- Dépendances installées : `npm ci`.

## Champs attendus (domaine `prospect`)
- `id` (obligatoire) : `contact.vid` ou équivalent.
- `name` : concat `firstname` + `lastname`.
- `lifecycle_stage` : normalisé via `lifecycle_map` (lead/marketing_qualified/sales_qualified/opportunity/closed).
- `owner` : `hubspot_owner_id`.
- `emails` / `phone_numbers` / `tags` : tableaux.

## Conventions de mapping
- Utiliser le converter `concat` pour le nom et `normalize_array` pour les listes.
- Étendre la map `lifecycle_map` si de nouvelles valeurs HubSpot apparaissent.
- Prévoir un `fallback` pour le nom si `firstname` ou `lastname` sont vides.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Dry-run : `node scripts/mapping_lint.js registries/mappings/hubspot/prospect.yaml registries/domain/prospect.yaml samples/hubspot/payload.example.json`.
- Lint interactif : `node scripts/mapping_lint.js --interactive registries/mappings/hubspot/prospect.yaml registries/domain/prospect.yaml samples/hubspot/payload.example.json`.
- Tests runtime : `npm run test:mapping`.

## Troubleshooting
- Champs HubSpot manquants : vérifier que l'API contacts inclut bien les propriétés nécessaires (lifecyclestage, email...).
- Array vide : appliquer `normalize_array` pour conserver le format attendu par le domaine.
- Champs requis : compléter via `--interactive` ou ajouter un `fallback` temporaire.
