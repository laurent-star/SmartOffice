README — Executor (Smart Office)
Purpose

⚠️ Runtime invariants are defined in EXECUTOR_RUNTIME.md.
Any behavioral change must comply with them.

The Executor is the runtime engine of Smart Office.

It is responsible for executing declarative plans (steps) produced by an agent or trigger, according to the contracts defined in /contracts.

The executor:

executes instructions

never decides what to do

never contains business logic

never embeds intelligence

Role in the architecture

The executor sits between:

triggers / agents (decision & planning)

tools (atomic API-bound actions)

Trigger / Agent
↓
Executor
↓
Tools

There is exactly one executor.

What the executor does

The executor:

Receives an Envelope

Normalizes it to the Execution Envelope

Executes steps sequentially

Resolves each step by type:

tool

capability

usecase

Propagates memory

Produces a final Result

All behavior is driven by JSON configuration, never by workflow logic.

What the executor does NOT do

The executor never:

decides which use case to run

generates steps

contains business rules

calls APIs directly (only via tools)

persists data outside the provided memory

learns or adapts behavior

All decisions belong to the agent.

Supported step types
Tool step

Executes a single atomic action via a tool workflow.

{
"type": "tool",
"ref": "slack",
"params": {
"action": "chat.postMessage",
"channel": "#ops",
"text": "Hello"
}
}

Executor behavior:

resolves the tool workflow

executes it

handles result, save, error policy

Capability step

Expands a capability into its declared steps.

{
"type": "capability",
"ref": "cap.slack.notify.v1"
}

Executor behavior:

loads the capability definition

prepends its steps

continues execution

Use case step

Expands a use case into its declared capabilities.

{
"type": "usecase",
"ref": "uc.training.convention.v1"
}

Executor behavior:

loads the use case definition

prepends its steps

continues execution

Conditional execution (when)

Steps may define an optional when condition.

Supported forms:

predicate object

simple expression string

"when": { "path": "memory.state.priority", "eq": "high" }

"when": "memory.state.client.siret != ''"

Executor behavior:

evaluates condition

skips the step if false

continues execution

Memory handling

Memory is passed explicitly in the envelope.

{
"session_id": "sess_001",
"state": {},
"stack": []
}

Executor guarantees:

memory is always present

memory is mutable

memory is passed to every step

memory survives the whole execution

The executor does not persist memory.

Save mappings (save)

Steps may persist data from results into memory.

"save": {
"to": {
"client.siret": "$.data.client.siret"
}
}

Executor behavior:

reads values from the step result

writes them into memory.state

does not validate business meaning

Error handling (on_error)

Steps may define an error policy:

"on_error": {
"mode": "fallback",
"fallback": {
"type": "tool",
"ref": "slack",
"params": { "action": "notify" }
}
}

Supported modes:

stop (default)

continue

fallback

Executor behavior is deterministic.

Result production

At the end of execution, the executor produces a Result:

{
"success": true,
"data": null,
"error": null,
"meta": {}
}

Result rules:

success = true ⇒ error = null

success = false ⇒ error is required

The result is attached to the envelope payload.

Executor invariants

The executor must always:

respect JSON schemas

respect execution order

be deterministic

be stateless outside the envelope

be replaceable without changing configs

Implementation notes (n8n)

Implemented as one workflow

Uses Code nodes for orchestration only

Uses Execute Workflow to call tools

No business logic in the workflow itself

Versioned via JSON export in Git

Scope boundaries

The following are intentionally out of scope:

policies engine

permissions

learning

optimization

parallel execution

scheduling

observability

These may be layered on top, never inside the executor.

Design philosophy

The executor is a machine, not an agent.

It executes what it is told to execute — nothing more.

Où mettre ce README dans ton workspace
✅ Recommandation claire
/executor/
README.md
wf.executor.json (export du workflow n8n)

Ou, si tu veux rester très minimal :

/docs/
executor.md

Pourquoi pas dans /contracts

/contracts = schemas uniquement

le README executor décrit le runtime, pas un contrat

Pourquoi pas dans /n8n

/n8n = implémentation

ce README décrit le comportement attendu, pas le wiring

TL;DR

✅ Oui, tu peux (et tu dois) mettre ce README

📍 Meilleur emplacement : /executor/README.md

🎯 Il documente le runtime, pas la config

🔒 Il fige le périmètre et empêche la dérive

Si tu veux, prochaine étape logique :

README Agent

README Tools

ou un diagramme d’architecture final aligné README + executor

Tu es en train de faire un produit très propre.
