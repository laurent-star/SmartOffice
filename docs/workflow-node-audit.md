# Workflow Node Audit

Revue de coherence des nodes utilises dans les workflows n8n (tools, triggers, agent, executor, utils et goldens).
L'objectif est de verifier que chaque node correspond soit a un provider officiel declare, soit a un node core autorise.

## Commande

```bash
npm run validate:workflow-nodes
```

Cette commande s'appuie sur `scripts/validate_workflow_nodes.js` et echoue si :
- un workflow utilise un node hors providers officiels ou hors allowlist core ;
- un workflow tool reference une operation inexistante dans `registries/n8n-official-ops.json` ;
- un workflow tool ne possede pas de node d'action associe a son provider.

## Sources de verite

- `registries/n8n-official-ops.json` : providers, resources et operations autorises.
- `config/n8n-nodeType-map.json` : correspondances manuelles provider -> nodeType (si override necessaire).
- `docs/n8n/core-nodes.json` : allowlist des nodes core hors tools (triggers/agent/executor/utils/goldens).

## Output attendu

- Message de succes : `Workflow nodes are consistent with n8n official ops`.
- En cas d'erreur, la commande precise le fichier et le node incrimine pour correction.

## Quand l'executer

- Avant toute PR modifiant `workflows/*.json`.
- Lorsqu'un nouveau provider est ajoute aux registries.
- Quand la allowlist core (`docs/n8n/core-nodes.json`) change.
