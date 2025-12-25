# Docs n8n — Sources et usages

Ce dossier centralise les sources n8n utilisees pour generer les registries et les workflows.

## Arborescence

- `docs/n8n/raw/` : fichiers Markdown contenant un bloc JSON structure (source pour `parse_n8n_docs.js`).
- `docs/n8n/human/` : version lisible (Markdown) des pages n8n pour relecture humaine.
- `docs/n8n/html/` : snapshot HTML des pages n8n (trace brute).
- `docs/n8n/sources.md` : liste des URLs et date de mise a jour.
- `docs/n8n/minimal-types.md` : synthese des types de workflows retenus.
- `docs/n8n/core-nodes.json` : liste des nodes autorises hors tools (utilisee par `validate_workflow_nodes.js`).

## Regles d'edition

- Les fichiers `raw/*.md` doivent contenir un bloc ```json``` valide.
- Les fragments `registries/n8n-official-ops/*.json` restent la reference pour les operations officielles.
- Les overrides, si necessaires, vont dans `registries/n8n-official-ops/_overrides/`.

## Generer les sources

- Telecharger les pages et mettre a jour les sources :
  `./scripts/fetch_n8n_docs.sh`
- Regenerer les `raw` structurés depuis les fragments :
  `./scripts/fetch_n8n_docs.sh --rebuild-raw`
- Lancer toute la pipeline :
  `./scripts/fetch_n8n_docs.sh --build --rebuild-raw`

## Pourquoi deux formats (raw + human)

- `raw/` sert a la generation automatique (JSON stable).
- `human/` sert a la verification et au refactoring manuel.
