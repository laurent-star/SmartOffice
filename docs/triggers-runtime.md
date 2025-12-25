# Triggers Runtime — Smart Office

This document defines the runtime contract for Trigger workflows.
It describes what must stay stable, not how each trigger is wired.

---

## Purpose

Triggers convert external events into Smart Office envelopes.
They act as the system entry points.

---

## Position in the architecture

External event
↓
Trigger
↓
Agent or Executor

---

## What Triggers DO

Triggers:

- receive external events (webhook, schedule, inbox, chat)
- normalize raw payloads
- emit an envelope for the next layer
- can route incomplete requests toward the Agent for clarification (never performing the clarification themselves)

---

## What Triggers MUST NOT DO

Triggers must never:

- decide which use case to run
- plan execution steps
- call tools or APIs (beyond the trigger source itself)

---

## Output contract

Triggers emit one of the two valid envelope forms:

- Legacy envelope (context/input/output/error)
- Execution envelope (header/payload)

If the trigger targets the Agent, it may emit a legacy envelope
with minimal context and input. The legacy envelope must include
`context.memory` (can be empty) to satisfy the schema.
If the trigger targets the Executor, it must emit a full execution envelope.

---

## Header requirements

When emitting an execution envelope, the header must include:

- `id`, `version`, `timestamp`
- `source` (trigger name)
- `destination` (agent or executor)
- `type` (event or execution type)

---

## Invariants (non-negotiable)

Triggers must always:

- remain stateless beyond the event payload
- emit schema-valid envelopes
- avoid business logic and planning
- include memory (even empty) so the Agent can loop through clarification if needed
