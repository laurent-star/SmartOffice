README — Trigger Workflows (Smart Office)

Purpose

Trigger workflows ingest external events and emit envelopes.
They are entry points into the system.

Reference spec: docs/triggers-runtime.md

Workflows

- gmail.trigger.workflow.json
- manual.trigger.workflow.json
- schedule.trigger.workflow.json
- slack.trigger.workflow.json
- webhook.trigger.workflow.json

Notes

- Triggers should not plan or execute steps.
- Triggers should emit schema-valid envelopes.
