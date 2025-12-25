# Tools Catalog — Smart Office

La génération des outils repose désormais sur la chaîne suivante :

1. Docs locales n8n (`docs/n8n/raw`) validées par `npm run docs:validate:n8n`.
2. Extraction + fragments officiels -> `npm run ops:parse` puis `npm run ops:fragments`.
3. Assemblage + validation de la registry officielle -> `npm run ops:build` puis `npm run ops:validate`.
4. Dérivation des catégories, capacités et tools (`npm run categories:generate`, `npm run capabilities:generate`, `npm run tools:generate`).
5. Génération des workflows outils (`npm run workflows:tools`).

Le fichier `registries/n8n-official-ops.json` est la source unique des opérations; les fragments et overrides sont les seules entrées éditables.

## Sources n8n

- `docs/n8n/raw/` : bloc JSON utilise par `parse_n8n_docs.js`.
- `docs/n8n/human/` : version lisible pour revue manuelle.
- `docs/n8n/html/` : snapshot brut des pages n8n.
- `docs/n8n/sources.md` : liste des URLs.

Commande rapide :

```bash
./scripts/fetch_n8n_docs.sh --build --rebuild-raw
```
