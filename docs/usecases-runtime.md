# Use cases Runtime — Smart Office

This document defines the runtime contract for use cases.
It describes what must stay stable, not how workflows are wired.

---

## Purpose

Use cases orchestrate capabilities to deliver business scenarios.

---

## Position in the architecture

Trigger or Agent
↓
Use case (expands to capabilities)
↓
Executor
↓
Tools

---

## Use case definition

Definitions live in:

- `config/use-cases/*.usecase.json`
- `registries/usecases.json` (compiled catalog)

Each use case includes:

- `inputs`: expected fields (input/context/memory)
- `outputs`: produced fields (memory)
- `steps`: ordered list of capability/tool/usecase steps

---

## Rules

- Use cases do not call tools directly unless required.
- Steps must follow `contracts/step.schema.json`.
- Inputs and outputs must be explicit.

---

## Invariants

- Definitions are configuration-only.
- No workflow logic embedded in use cases.
