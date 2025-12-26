# Google Drive → document mapping checklist

## Prérequis
- Compte de service ou OAuth test configuré pour lire les fichiers Drive (pas de credentials dans le repo).
- Connaitre l'espace/collection ciblée (files list) et les MIME types attendus.
- Installer les dépendances Node : `npm ci`.

## Champs attendus (domaine `document`)
- `id` (obligatoire) : id du fichier Drive.
- `title` (obligatoire) : nom du fichier.
- `mime_type` : type normalisé (pdf, doc, sheet, slide…).
- `url` : lien de visualisation.
- `owner` : email du propriétaire.
- `created_at` / `updated_at` : timestamps ISO.
- `tags` : labels ou dossiers clés.

## Conventions de mapping
- Utiliser le converter `mime_to_type` (enum_map) pour normaliser le MIME en type.
- Les labels doivent être transformés en tableau via `normalize_array` si nécessaire.
- Dates : laisser le format ISO fourni par Drive ou passer par `date_iso` si décalage détecté.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Dry-run avec sample : `node scripts/mapping_lint.js registries/mappings/drive/document.yaml registries/domain/document.yaml samples/drive/payload.example.json`.
- Tests mapping : `npm run test:mapping`.

## Troubleshooting
- MIME non pris en charge : compléter la map `mime_to_type` dans le YAML.
- Données manquantes (owner/labels) : vérifier les scopes Drive API utilisés par la collecte.
- Champ requis manquant : lancer le lint `--interactive` et renseigner la source ou un fallback sûr.
