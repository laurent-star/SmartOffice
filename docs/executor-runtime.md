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
