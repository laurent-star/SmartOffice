# Capabilities Runtime — Smart Office

This document defines the runtime contract for capabilities.
It describes what must stay stable, not how workflows are wired.

---

## Purpose

Capabilities are reusable sequences of steps.
They group tool calls into stable building blocks.

---

## Position in the architecture

Agent or Use case
↓
Capability (expands to steps)
↓
Executor
↓
Tools

---

## Capability definition

Definitions live in:

- `config/capabilities/*.capability.json`
- `registries/capabilities.json` (compiled catalog)

Cross references:

- `docs/tools-runtime.md`

Each capability includes:

- `inputs`: expected fields (input/context/memory)
- `outputs`: produced fields (memory)
- `steps`: ordered list of tool/capability/usecase steps

---

## Naming (configs)

- Format : `domain.resource.action`
- Exemple : `email.message.fetch`, `content.text.summarize`
- Les wrappers (ex: `calendar.event.next`) restent des capabilities et ne contiennent
  qu'un preset de parametres.

---

## Rules

- Capabilities must be deterministic.
- A capability must not embed business decisions.
- Steps must follow `contracts/step.schema.json`.

---

## Invariants

- Inputs and outputs must be documented.
- Steps must reference existing tools or capabilities.
