# Golden Workflows — Smart Office

This document defines the role and rules of Golden workflows.
Golden workflows are the canonical reference implementations.

---

## Purpose

Golden workflows are the source of truth for how runtime contracts are
implemented in n8n. They must align with specs in `/docs` and `/contracts`.

---

## Location

Golden workflows live in:

- `workflows/golden/`

---

## Naming and ordering

Files use a numeric prefix to ensure deterministic ordering:

- `NN_name.json`

Example:

- Executor : `workflows/executor/executor.workflow.json`

---

## Scope

Golden workflows should exist for each workflow category:

- agent
- executor
- tools
- triggers
- utils

Each golden workflow represents the minimal, compliant implementation
for its category.

---

## Rules

Golden workflows must:

- be exportable and importable in n8n
- avoid environment-specific credentials in the export
- implement the contracts exactly
- avoid business logic outside the Agent

Golden workflows must not:

- include local-only test nodes
- depend on hard-coded IDs or credentials
- diverge from `/contracts` schemas

Existing non-golden workflows (for example in `workflows/tools/`)
may still contain credentials or placeholders. Golden workflows
must not copy those values.
