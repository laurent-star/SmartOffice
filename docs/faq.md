# FAQ Smart Office

## Pourquoi l'agent ne peut-il pas "dérouler toutes les tâches" et ouvrir une PR globale automatiquement ?

Plusieurs étapes du plan (onboarding interactif, mapping multi-sources, configuration n8n, etc.) nécessitent des choix produits ou des secrets non présents dans le dépôt. L'agent évite donc d'exécuter ou de committer en bloc sans validation pour ces raisons :

- **Dépendances externes et secrets** : certaines tâches exigent des accès API (Monday, CRM, Drive) et des IDs de boards/colonnes qui ne sont pas versionnés.
- **Actions manuelles** : l'onboarding interactif et la configuration n8n requièrent des confirmations humaines (mapping à valider, cadence de synchro, alerting).
- **Risque de régression** : enchaîner toutes les étapes sans entrée utilisateur peut casser des workflows existants ou introduire des mappings incomplets.
- **Bonnes pratiques Git** : regrouper des changements hétérogènes en une seule PR complique la revue et le rollback. Mieux vaut livrer par lots cohérents (moteur, mappings, workflows, onboarding).

En pratique, chaque lot doit être validé (tests, inputs, credentials) avant d'ouvrir une PR dédiée. L'agent peut aider à préparer ces lots, mais il ne déclenchera pas automatiquement les étapes qui demandent des données ou décisions humaines.
