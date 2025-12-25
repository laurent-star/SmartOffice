# Tools Runtime — Smart Office

This document defines the runtime contract for Tool workflows.
It describes what must stay stable, not how each tool is wired.

---

## Purpose

Tools are atomic, API-bound actions.
They execute one operation and return a structured result.

---

## Position in the architecture

Executor
↓
Tools

Tools do not orchestrate other steps.

---

## Tool input contract

Tools accept a tool input object defined by:

- `contracts/tool-input.schema.json`
- `contracts/tool-definition.schema.json` (catalog schema)

This payload is produced by the Executor when it resolves a `tool` step.

---

## Official tool catalog

Tool definitions live in:

- `config/tools/*.tool.json`
- `registries/tools.json` (compiled list used by the Executor)

Each tool definition lists:

- `actions[].name` (operation)
- `actions[].input` (expected params keys)
- `actions[].output` (expected output key)
- `categories` (types fonctionnels du tool)

`params` provided in tool steps must match the `actions[].input` list.

Categories reference:

- `docs/tools-catalog.md`

---

## Tool result contract

Tools return a result object defined by:

- `contracts/tool-result.schema.json`

The result must be deterministic for a given API response.

---

## What Tools DO

Tools:

- execute exactly one API operation
- map API responses to `data`
- map API failures to `error`

---

## What Tools MUST NOT DO

Tools must never:

- decide which tool to call next
- mutate execution order
- manage retries outside declared parameters
- persist memory or write to storage outside their API call

---

## Invariants (non-negotiable)

Tools must always:

- accept the tool input contract
- return a structured tool result
- avoid orchestration or business logic
