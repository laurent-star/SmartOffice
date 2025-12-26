# Google Sheets → mapping checklist

## Prerequis

- Acces au fichier Google Sheets cible
- Nom d'onglet et colonnes stables
- Credentials Google Sheets actifs dans n8n

## Champs attendus (exemples)

- `lead_id`
- `email`
- `status`
- `owner`
- `created_at`

## Commandes utiles

- Dry-run :
  `node scripts/mapping_lint.js registries/mappings/google-sheets/<domain>.yaml registries/domain/<domain>.yaml samples/google-sheets/payload.example.json`

## Troubleshooting

- Colonnes manquantes : verifier l'onglet et les noms de colonnes.
- Dates invalides : verifier le format ISO 8601.
