# Use cases Runtime — Smart Office

This document defines the runtime contract for use cases.
It describes what must stay stable, not how workflows are wired.

---

## Purpose

Use cases orchestrate capabilities and other use cases to deliver business scenarios.

---

## Position in the architecture

Trigger or Agent
↓
Use case (expands to capabilities/use cases)
↓
Executor
↓
Tools

---

## Use case definition

Definitions live in:

- `config/use-cases/*.usecase.json`
- `registries/usecases.json` (compiled catalog)

Cross references:

- `docs/capabilities-runtime.md`

Each use case includes:

- `inputs`: expected fields (input/context/memory)
- `outputs`: produced fields (memory)
- `steps`: ordered list of capability/tool/usecase steps

---

## Naming (configs)

- Format : `domain.resource.action`
- Exemple : `briefing.daily.generate`, `mapping.onboarding.run`

## Use case: mapping.onboarding.run

Purpose:
- Orchestration pour un mapping par tool (LLM + validation Slack + stockage Drive).

Inputs (minimum):
- `input.tool_id`
- `input.domain`
- `input.sample_payload`
- `context.slack.channel` (ex: `smartoffice`)
- `context.drive.mappings_folder_id`

Outputs:
- `memory.state.mapping.proposal_yaml`
- `memory.state.mapping.justification`
- `memory.state.mapping.drive_file_id`
- `memory.state.mapping.slack_message_id`

---

## Rules

- Use cases can call capabilities or other use cases. Tool calls are allowed when no atomic capability exists.
- Steps must follow `contracts/step.schema.json`.
- Inputs and outputs must be explicit.

---

## Invariants

- Definitions are configuration-only.
- No workflow logic embedded in use cases.
