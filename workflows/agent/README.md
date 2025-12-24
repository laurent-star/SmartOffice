README — Workflows Agent (Smart Office)

But

Les workflows agent implementent la couche de decision et de planification.
Ils traduisent une intention en une liste ordonnee de steps pour l'executor.

Spec de reference : docs/agent-runtime.md

Workflows

- planner.workflow.json
  Construit un plan d'execution (steps) a partir d'un contexte.

- supervisor.workflow.json
  Supervise ou ajuste le plan avant execution.

Regles

- L'agent ne declenche aucun tool directement.
- L'agent doit produire une execution envelope valide.
- Les decisions restent dans l'agent, jamais dans l'executor.

Utilisation des utils

- Normalisation d'entrees (legacy -> execution envelope)
- Validation des steps avant envoi a l'executor
- Evaluation des conditions when lors de la planification
