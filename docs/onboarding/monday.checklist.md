# Monday → project mapping checklist

## Prérequis
- Accès à l'API Monday avec un token de test (pas de secrets en repo).
- Board identifiée (purpose = delivery_projects) et colonnes visibles (status, owner, dates, labels).
- Installer les dépendances Node : `npm ci`.

## Champs attendus (domaine `project`)
- `id` (obligatoire) : identifiant stable de l'item.
- `name` (obligatoire) : nom du projet / item.
- `client_id` : référence client (colonne texte ou relation).
- `status` : valeurs normalisées `backlog | in_progress | blocked | done | archived` (voir map enum dans le YAML).
- `start_date` / `due_date` : dates ISO (UTC).
- `owner` : email de l'owner.
- `tags` : tableau de labels.

## Conventions de mapping
- Utiliser le convertisseur `status_map` pour aligner les colonnes Monday → statut canonique.
- Dates : passer par le converter `date_iso` (timezone UTC) pour les colonnes date.
- Les labels doivent être normalisés en tableau (`normalize_array`).
- Ajouter `fallback` pour les noms si la colonne est vide (ex: "Untitled project").

## Commandes utiles
- Lint non-interactif (tous les mappings) : `npm run lint:mappings`.
- Lint interactif ciblé : `node scripts/mapping_lint.js --interactive registries/mappings/monday/project.yaml registries/domain/project.yaml samples/monday/payload.example.json`.
- Tests runtime mapping : `npm run test:mapping`.

## Dry-run avec sample
- Exemple fourni : `samples/monday/payload.example.json`.
- Exécuter `node scripts/mapping_lint.js registries/mappings/monday/project.yaml registries/domain/project.yaml samples/monday/payload.example.json` pour visualiser l'entité mappée.

## Troubleshooting
- Champs requis manquants : relancer le lint en mode `--interactive` et fournir les sources manquantes.
- Statut non reconnu : compléter la `enum_map` dans le YAML.
- Dates vides ou invalides : vérifier le format source et ajuster le converter `date_iso` ou un fallback.
