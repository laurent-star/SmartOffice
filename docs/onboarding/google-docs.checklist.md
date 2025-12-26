# Google Docs → document mapping checklist

## Prérequis
- Compte de service/OAuth avec scope docs.readonly (pas de credentials dans le repo).
- DocumentId connu pour les tests (voir `samples/google-docs/payload.example.json`).
- Dépendances Node installées : `npm ci`.

## Champs attendus (domaine document/contenu)
- `documentId` / id canonique.
- `title` : titre du doc.
- Contenu structuré : `body.content` (paragraphes, tables).
- Révision : `revisionId`.
- Auteur/éditeur : `lastModifiedBy.email`.

## Conventions de mapping
- Le payload Google Docs contient des structures imbriquées : utiliser `source[]` pour récupérer plusieurs paragraphes si besoin.
- Normaliser les tableaux (paragraphes, éléments) avec `normalize_array` si le domaine cible l'exige.
- Utiliser `concat` pour aggréger plusieurs textRuns si vous exposez un champ `summary` ou `preview`.

## Commandes utiles
- Lint non-interactif : `npm run lint:mappings`.
- Lint interactif : `node scripts/mapping_lint.js --interactive <mapping> <domain> samples/google-docs/payload.example.json`.
- Tests moteur : `npm run test:mapping`.

## Troubleshooting
- Corps vide : vérifier que l'API renvoie bien `body.content` (pas de restriction de champ).
- Encodage spécial : nettoyer les `textRun` (retours à la ligne) avant concat.
- Champs requis manquants : ajouter les correspondances via `--interactive` et regénérer le YAML.
