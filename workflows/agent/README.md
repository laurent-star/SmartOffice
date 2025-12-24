README — Agent Workflows (Smart Office)

Purpose

Agent workflows implement the decision and planning layer.
They translate incoming intent into an ordered list of execution steps.

Reference spec: docs/agent-runtime.md

Workflows

- planner.workflow.json
  Builds execution plans (steps) from input context.

- supervisor.workflow.json
  Supervises or refines plans before execution.

Notes

- Agents never execute tools directly.
- Agents must output a valid execution envelope.
