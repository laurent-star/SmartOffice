# README — Workflows Golden (Smart Office)

## But

Les workflows golden sont des implementations de reference.
Ils servent de base stable pour les humains et les assistants AI.
Ils doivent rester coherents avec les specs dans docs/ et contracts/.

Spec de reference : [docs/codex-plan.md](docs/codex-plan.md)

---

## Philosophie

Les golden workflows sont :
- Reference-first, pas forcement production-ready
- Lisibles et modifiables
- Concus pour etre copies et adaptes

Ils ne sont pas figes : les evolutions sont encouragees tant
qu'elles respectent l'architecture.

---

## Workflows

- 10_agent.json (`so.golden.agent`)
  Exemples de construction d'enveloppe d'execution par un agent.
  Nodes : Manual Trigger (`n8n-nodes-base.manualTrigger`) → Build Execution Envelope (`n8n-nodes-base.code`) : attend `header`/`payload` facultatifs, renvoie une enveloppe avec steps et memoire par defaut.

- 15_agent_planner.json (`so.golden.agent_planner`)
  Exemple de planification avec boucle de clarification.
  Nodes : Planner Trigger — Manual Trigger → Build Plan Envelope — Code : attend `payload.memory.state.context_complete`; produit un plan avec step de clarification ou de notification et header vers agent/executor.

- 16_agent_supervisor.json (`so.golden.agent_supervisor`)
  Exemple de supervision du plan avant execution.
  Nodes : Supervisor Trigger — Manual Trigger → Build Supervised Envelope — Code : attend `payload.steps`/`payload.memory`; preprend une capability de validation si besoin et renvoie l'enveloppe.

- 20_tools.json (`so.golden.tools`)
  Exemples de pattern d'execution d'un tool (I/O standardise).

  Moteur d'execution canonique (iteration, dispatch, output).
  Nodes : Tool Trigger — Manual Trigger → Dispatch Operation — Code : attend `payload.steps` ou `input.steps`; simule la resolution/dispatch et renvoie un output standardise avec results/debug.

- 40_triggers.json (`so.golden.triggers`)
  Patterns de triggers et emission d'enveloppe.
  Nodes : Trigger Event — Manual Trigger → Build Legacy Envelope — Code : construit une enveloppe legacy a partir du payload manuel.

- 50_utils.json (`so.golden.utils`)
  Utils deterministes et reusables.
  Nodes : Utils Trigger — Manual Trigger → Normalize Text — Code : attend `text` dans l'input; renvoie une version normalisee (trim, lowercase) dans `result`.

---

## Nodes n8n a privilegier (non deprecies)

Les golden workflows doivent privilegier les nodes recents et supportes.
Les nodes deprecies sont a eviter lorsqu'un equivalent moderne existe.

Preferer :
- Manual Trigger
- Schedule Trigger
- Webhook
- Error Trigger
- n8n Trigger
- HTTP Request
- Edit Fields (plutot que Set legacy)
- Code (remplace Function / Function Item)
- Loop Over Items
- Aggregate
- Merge
- If
- Switch
- Split In Batches
- Limit
- Sort
- Remove Duplicates
- Date & Time

A eviter quand possible :
- Function (legacy)
- Function Item (legacy)
- Set (legacy)
- Loop (legacy)

---

## Patterns d'execution

Prefere :
Trigger
→ Validation
→ Dispatch / Execution
→ Aggregation
→ Output

---

## Regles

- Pas de credentials ou d'IDs specifique a un environnement.
- Pas de logique metier en dehors de l'agent.
- I/O explicites et deterministes.
- Modifications directes permises si elles améliorent clarte et cohérence.

Regle de nommage

- Convention : `so.<layer>.<name>`

---

Fin du README.
