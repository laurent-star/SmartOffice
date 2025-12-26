README — Workflow Executor (Smart Office)

But

L'Executor est le moteur d'execution de Smart Office.
Il execute des plans declaratifs (steps) produits par l'agent ou un trigger.

Spec de reference : [docs/executor-runtime.md](docs/executor-runtime.md)

Position dans l'architecture

Trigger / Agent
↓
Executor
↓
Tools

Il n'existe qu'un seul executor.
Fichier : workflows/executor/executor.workflow.json

Ce que l'executor fait

- Recoit une envelope (legacy ou execution)
- Normalise en execution envelope
- Execute les steps sequentiellement
- Resolves chaque step par type : tool, capability, usecase
- Propage la memoire a chaque step
- Produit un Result final

Ce que l'executor ne fait pas

- Ne decide pas quel use case lancer
- Ne genere pas de steps
- N'embarque pas de logique metier
- N'appelle pas d'API directement
- Ne persiste pas de donnees hors memoire fournie

Types de steps supportes

Tool step

{ "type": "tool", "ref": "slack", "params": { "channel": "#ops", "text": "Bonjour" } }

Comportement :
- Resout la definition du tool dans le registry
- Utilise provider et operation pour router l'execution
- Execute le tool
- Gere resultats, save, on_error

Capability step

{ "type": "capability", "ref": "cap.slack.notify.v1" }

Comportement :
- Charge la capability
- Injecte ses steps
- Continue l'execution

Use case step

{ "type": "usecase", "ref": "uc.training.convention.v1" }

Comportement :
- Charge le use case
- Injecte ses steps
- Continue l'execution

Conditions (when)

Les steps peuvent definir un when (string ou predicat).
L'executor evalue la condition et saute le step si faux.

Sauvegarde (save)

Les steps peuvent definir save pour copier des valeurs
dans memory.state a partir du resultat.

Gestion d'erreur (on_error)

Modes supportes : stop (defaut), continue, fallback.

Resultat

L'executor produit un Result a la fin :

{ "success": true, "data": null, "error": null, "meta": {} }

Invariants

- Respect des schemas JSON
- Ordre d'execution respecte
- Determinisme
- Stateless hors envelope

Notes d'implementation (n8n)

- Implementé en un workflow n8n unique
- Orchestration via nodes de type Code / Function
- Appel des tools via Execute Workflow
- Catalogue tools : registries/tools.json (actions et params attendus)

Utilisation des utils

Les utils peuvent etre appeles depuis l'executor pour factoriser :
- Normalisation d'enveloppe
- Validation AJV des contrats
- Guards de controle (maxSteps, maxDepth)
- Expansion de steps (capability/usecase)
- Application des policies (when, save, on_error)

Hors scope

- Policies complexes
- Permissions
- Learning
- Optimisation
- Parallelisation
- Observabilite
