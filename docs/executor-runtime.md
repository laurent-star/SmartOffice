# Executor Runtime — Smart Office

This document defines the **runtime contract** of the Smart Office Executor.

It does not describe how the workflow is wired.
It defines **what must never change**.

This file exists to prevent architectural drift.

---

## Purpose

The Executor is the **runtime engine** of Smart Office.

It executes declarative execution plans (steps) produced by agents or triggers,
strictly according to the contracts defined in `/contracts`.

The Executor:

- executes instructions
- never decides what to do
- never contains business logic
- never embeds intelligence

---

## Position in the architecture

The Executor sits strictly between:

Trigger / Agent (decision, planning)
↓
Executor
↓
Tools (API actions)

yaml
Copier le code

There is **exactly one Executor** in the system.

---

## What the Executor DOES

The Executor:

- receives an Envelope (legacy or execution)
- normalizes it into an Execution Envelope
- executes steps sequentially
- resolves each step by type:
  - `tool`
  - `capability`
  - `usecase`
- propagates memory across all steps
- applies `when`, `save`, and `on_error` policies
- produces a final `Result`

Tool resolution rules:

- tool definitions are loaded from `registries/tools.json`
- each tool points to `config/tools/*.tool.json`
- `step.params` is forwarded to the tool as-is
- the expected params keys come from `actions[].input`
- if `step.operation` is missing, `step.params.action` is used as fallback

Registry loading:

- the Executor expects `payload.registryFiles` in the execution envelope
- optional fallback registry can be provided via `payload.options.fallbackRegistry`

All behaviors are driven **only by JSON configuration**.

---

## Envelope I/O (read + write)

Read:

- Legacy envelope: `input.steps` + `context.memory` are normalized into an execution state.
- Execution envelope: `header`, `payload.steps`, `payload.memory`, `payload.registryFiles`, `payload.options` are used as-is.
- If the incoming envelope is legacy, a default `header` is created and the payload is rebuilt from legacy fields.

Write:

- The Executor emits a **result envelope** shaped as:
  - `header`: copied from the execution state (or generated if missing).
  - `output`: `{ results[], memory }` with optional `trace`/`debug` when `options.debug = true`.
  - `error`: `null` on success, or a structured error object.
- This output is a legacy-compatible result envelope. If you need a strict execution envelope, wrap it in a trigger/adapter that maps `output` into `payload.result`.

Tool I/O bridge:

- The Executor builds `toolInput` using `contracts/tool-input.schema.json`.
- Tools must return `toolResult` using `contracts/tool-result.schema.json`.
- The Executor stores each `toolResult` in `output.results[]` and can project it into `memory.state` via `save`.

---

## What the Executor MUST NOT DO

The Executor must never:

- decide which use case to run
- generate or modify steps
- contain business rules
- call APIs directly
- persist data outside the provided memory
- learn, optimize, or adapt
- infer missing intent

All decisions belong to the **Agent layer**.

---

## Determinism rule

Given the same Envelope input,
the Executor must always produce the same Result.

No hidden state.
No side effects.
No heuristics.

---

## Memory contract

- Memory is always provided explicitly
- Memory is mutable
- Memory is propagated to every step
- Memory survives the whole execution
- Memory is **never persisted** by the Executor

The Executor is stateless outside the Envelope.

---

## Error handling contract

Error handling is declarative.

Supported modes:

- `stop`
- `continue`
- `fallback`

The Executor applies the declared policy.
It never invents recovery strategies.

---

## Result contract

Execution always produces a Result object.

Rules:

- `success = true` ⇒ `error = null`
- `success = false` ⇒ `error` is required

The Executor does not interpret the result.

---

## Invariants (non-negotiable)

The Executor must always:

- respect JSON schemas
- respect execution order
- remain deterministic
- remain stateless
- be replaceable without changing configurations

If a feature violates one of these points,
it does **not** belong in the Executor.

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.executor.core`
- `so.tool.google-drive`
- `so.trigger.webhook`

---

## Scope boundaries

The following are explicitly out of scope:

- permissions
- policies engine
- learning
- optimization
- parallel execution
- scheduling
- observability

These may exist **around** the Executor, never inside it.

---

## Design philosophy

> The Executor is a machine, not an agent.

It executes exactly what it is told to execute — nothing more.

If something feels “smart”, it does not belong here.
