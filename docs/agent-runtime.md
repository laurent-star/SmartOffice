# Agent Runtime — Smart Office

This document defines the runtime contract for Agent workflows.
It describes what must stay stable, not how the workflow is wired.

---

## Purpose

The Agent is the decision and planning layer.
It turns incoming intent into a deterministic execution plan for the Executor.

---

## Position in the architecture

Triggers / Chat
↓
Agent
↓
Executor
↓
Tools

---

## What the Agent DOES

The Agent:

- receives input from triggers or chat
- interprets intent and context
- builds an ordered list of steps
- returns a valid Execution Envelope for the Executor
- optionally enriches memory and options

---

## What the Agent MUST NOT DO

The Agent must never:

- execute tools or call APIs directly
- bypass the Executor
- mutate external state
- embed tool implementation logic
- persist data outside explicit memory contracts

---

## Input and output contracts

Inputs may be raw trigger payloads or a legacy Envelope.
Outputs must be an Execution Envelope as defined in `contracts/envelope.schema.json`.

Minimum output requirements:

- `header.id`, `header.version`, `header.timestamp`, `header.source`, `header.destination`, `header.type`
- `payload.steps` as a non-empty array
- each step conforms to `contracts/step.schema.json`

---

## Planning rules

- Steps must be ordered and executable sequentially.
- Step types are limited to: `tool`, `capability`, `usecase`.
- Each step must include a non-empty `ref` and an object `params` (even when empty).
- The Agent may include `save` or `on_error` policies in steps, but must not invent tool behavior.
- If required inputs are missing, the Agent must add a clarification step (capability) instead of guessing tool inputs.

Planning rules are configured in `config/agent/planning_rules.json`
and must validate against `contracts/agent-planning.schema.json`.

---

## Memory handling

- Memory is explicit and passed in the envelope.
- The Agent may read and write memory content.
- The Agent must not persist memory outside the envelope.

---

## Error handling

If planning fails, the Agent must return a structured error:

- either a legacy envelope with `error`
- or an execution envelope with `payload.result.success = false`

## Clarification and human validation loop

- After the initial intent analysis, the planner must verify context completeness (memory + trigger payload).
- When the context is insufficient, the planner emits a first step targeting a clarification capability (ex: `human_validation`).
- The supervisor may inject the same clarification step if a received plan is incomplete or unordered.
- The clarification step must explicitly loop back to the Agent (`header.destination = "agent"` or via tool routing) so the new context can be replanned.
- The Agent marks readiness in memory (ex: `memory.state.context_complete = true`) once all mandatory inputs are gathered.

---

## Invariants (non-negotiable)

The Agent must always:

- emit schema-valid envelopes
- remain the only planner/decision layer
- keep tool execution delegated to the Executor
