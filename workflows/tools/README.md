README — Tools Workflows (Smart Office)

Purpose

Tool workflows implement atomic API actions.
They execute one operation and return a structured result.

Reference spec: docs/tools-runtime.md
Tool input schema: contracts/tool-input.schema.json
Tool result schema: contracts/tool-result.schema.json

Workflows

- axonaut.workflow.json
- brevo.workflow.json
- gmail.workflow.json
- google-docs.workflow.json
- google-drive.workflow.json
- monday.workflow.json
- openai.workflow.json
- slack.workflow.json

Notes

- Tools do not plan or orchestrate steps.
- Tools are executed by the Executor.
