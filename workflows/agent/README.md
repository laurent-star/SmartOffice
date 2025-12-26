README — Workflows Agent (Smart Office)

But

Les workflows agent implementent la couche de decision et de planification.
Ils traduisent une intention en une liste ordonnee de steps pour l'executor.

Spec de reference : [docs/agent-runtime.md](docs/agent-runtime.md)

Workflows

- planner.workflow.json
  Construit un plan d'execution (steps) a partir d'un contexte et ajoute un step de clarification si les inputs sont incomplets.

- supervisor.workflow.json
  Supervise ou ajuste le plan avant execution; injecte une clarification si le plan manque des prerequis.

Regles

- L'agent ne declenche aucun tool directement.
- L'agent doit produire une execution envelope valide.
- Les decisions restent dans l'agent, jamais dans l'executor.
- Les boucles de clarification/human validation renvoient vers l'agent avant toute execution.

Utilisation des utils

- Normalisation d'entrees (legacy -> execution envelope)
- Validation des steps avant envoi a l'executor
- Evaluation des conditions when lors de la planification
