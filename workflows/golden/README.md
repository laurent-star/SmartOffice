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

- 15_agent_planner.json (`so.golden.agent_planner`)
  Exemple de planification avec boucle de clarification.

- 16_agent_supervisor.json (`so.golden.agent_supervisor`)
  Exemple de supervision du plan avant execution.

- 20_tools.json (`so.golden.tools`)
  Exemples de pattern d'execution d'un tool (I/O standardise).

  Moteur d'execution canonique (iteration, dispatch, output).

- 40_triggers.json (`so.golden.triggers`)
  Patterns de triggers et emission d'enveloppe.

- 50_utils.json (`so.golden.utils`)
  Utils deterministes et reusables.

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
