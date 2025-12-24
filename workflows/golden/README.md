# README — Golden Workflows (Smart Office)

## Purpose

Golden workflows are **canonical reference implementations** for the Smart Office project.

They serve as:
- Stable starting points
- Shared references for humans and AI agents (Codex, Copilot, etc.)
- Living documentation of recommended n8n patterns

Golden workflows are **expected to evolve**.
Changes are allowed and encouraged as long as they remain coherent with the project architecture.
Version history is handled by Git.

They must generally align with:
- `/docs`
- `/contracts`

Reference specification:
docs/golden-workflows.md

markdown
Copier le code

---

## Philosophy

Golden workflows are:
- Reference-first, not production-ready
- Readable and modifiable
- Designed to be copied, adapted, and improved

They are **not frozen artifacts**.
Iteration, refactoring, and experimentation are allowed.

> If a change makes the system clearer, safer, or more reusable, it is welcome.

---

## Workflows

Current golden workflows:

- `10_agent.json`
  Reference patterns for agent interaction and orchestration.

- `20_tools.json`
  Canonical implementations of tool execution patterns.

- `30_executor.json`
  Core execution workflow (step iteration, dispatch, outputs).

- `40_triggers.json`
  Common trigger patterns (manual, webhook, schedule, system).

- `50_utils.json`
  Reusable utility nodes and helper patterns.

Additional golden workflows may be added as new stable patterns emerge.

---

## Supported n8n Nodes & Patterns (Non-Deprecated)

Golden workflows should **prefer current, supported n8n nodes**.
Deprecated nodes are not forbidden but should be avoided when a modern equivalent exists.

### Preferred Triggers

Use:
- `Manual Trigger`
- `Schedule Trigger`
- `Webhook`
- `Error Trigger`
- `n8n Trigger` (system-level events)

Avoid:
- Legacy `Start` node

---

### Preferred Core Nodes

Use:
- `HTTP Request`
- `Edit Fields` (preferred over legacy `Set`)
- `Code` (modern replacement for `Function` / `Function Item`)
- `Loop Over Items`
- `Aggregate`
- `Merge`
- `If`
- `Switch`
- `Split In Batches`
- `Limit`
- `Sort`
- `Remove Duplicates`
- `Date & Time`

Avoid when possible:
- Legacy `Function`
- Legacy `Function Item`
- Old `Set`
- Old `Loop`

---

### Code Node Usage

The `Code` node is allowed and encouraged when:
- Data transformation is explicit
- Logic is deterministic
- Inputs and outputs are clear

Avoid:
- Hidden state
- Side effects
- Business logic that should live in JSON contracts

---

### Execution Patterns

Golden workflows should favor:
- Explicit inputs / outputs
- Linear or clearly branched execution
- Minimal implicit behavior

Preferred patterns:
Trigger
→ Validation
→ Dispatch / Execution
→ Aggregation
→ Output

yaml
Copier le code

---

## Modification Guidelines (Permissive)

Golden workflows **may be modified directly**.

It is acceptable to:
- Add or remove nodes
- Refactor structure
- Replace deprecated nodes
- Improve naming, layout, and readability
- Update workflows as n8n evolves

When modifying:
- Prefer clarity over cleverness
- Keep workflows generic and reusable
- Avoid unnecessary coupling

Git history is the source of truth.

---

## Technical Notes

- Golden workflows **must not include environment-specific credentials**
- Secrets belong to n8n credentials, not workflow JSON
- URLs, IDs, and keys should be placeholders when possible

Temporary exceptions are acceptable during migration or refactoring phases.

---

## For Codex / AI Assistants

AI assistants are encouraged to:
- Modify golden workflows directly
- Replace deprecated nodes with modern equivalents
- Align workflows with `/contracts` and `/docs`
- Improve structure, naming, and consistency

No strict constraints apply beyond maintaining overall coherence.

Recommended loop:
Edit → Validate → Review → Commit

yaml
Copier le code

---

## Status

- Structure: evolving
- Contracts: authoritative
- Golden workflows: living references
- n8n compatibility: current
- AI compatibility: high

---

End of README.
