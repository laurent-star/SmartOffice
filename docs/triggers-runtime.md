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

- receive external events (webhook, schedule, inbox, chat, drive updates)
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

Envelope fabrication rules:

- Legacy envelope:
  - `context.memory` is required (empty object allowed).
  - `input.steps` is optional (triggers may forward raw event data instead).
- Execution envelope:
  - `header` must be complete.
  - `payload.memory` must exist.
  - `payload.steps` must exist when targeting the Executor.

## Registry injection (Google Drive)

When routing directly to the Executor, triggers should inject registries
so the Executor can resolve tools/capabilities/usecases.

Expected fields in the execution envelope:

- `payload.registryFiles` as an array of `{ category, ref, content }`
- `payload.options.fallbackRegistry` (optional)

Registries are typically loaded from Google Drive using file IDs stored in:

- `REGISTRY_TOOLS_FILE_ID`
- `REGISTRY_CAPABILITIES_FILE_ID`
- `REGISTRY_USECASES_FILE_ID`

All three variables are optional. If a file ID is missing or the Google
Drive node returns an empty file, triggers must still build a valid
execution envelope by falling back to the local copies in
`registries/tools.json`, `registries/capabilities.json` and
`registries/usecases.json`. The fallback should also be passed in
`payload.options.fallbackRegistry` to keep the Executor operational when
remote storage is unavailable.

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

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.trigger.webhook`
- `so.trigger.schedule`
- `so.trigger.google-drive`
