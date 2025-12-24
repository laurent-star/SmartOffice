# Utils Runtime — Smart Office

This document defines the runtime contract for Utility workflows.
It describes what must stay stable, not how each utility is wired.

---

## Purpose

Utils provide shared, side-effect-free helpers.
They are reusable building blocks for triggers, agents, and executor flows.

---

## What Utils DO

Utils:

- perform transformations or validation
- normalize data shapes
- enrich payloads without external I/O

---

## What Utils MUST NOT DO

Utils must never:

- call external APIs
- mutate external state
- embed business decisions

---

## Input and output

Each utility must document its input/output shape in its workflow description.
Inputs and outputs must be JSON-serializable objects.

---

## Invariants (non-negotiable)

Utils must always:

- be deterministic for given inputs
- be safe to reuse across workflows
- avoid side effects
