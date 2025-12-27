# Smart Office

Smart Office est une architecture d'automatisation pilotee par agent,
bassee sur des tools atomiques, des capabilities reutilisables
et des use cases metier, executes par un executor recursif.

## Concepts cles

- Tool
  Action atomique liee a une API (Slack, Google Drive, Gmail, Monday, OpenAI...).
  Implemente comme un workflow n8n route par provider et operation.

- Capability
  Suite declarative de steps.
  Independante des tools.
  Peut etre cross-tools.
  Reutilisable.

- Use case
  Suite de capabilities.
  Represente un scenario metier complet.

- Agent
  Lit les configurations (tools, capabilities, use cases),
  choisit quoi executer, mais n'execute rien directement.

- Executor
  Workflow n8n unique.
  Execute recursivement :
  - tool
  - capability
  - use case

## Types de tools (catalogue fonctionnel)

Chaque tool est classe par types fonctionnels (champ `categories` dans `config/tools`).
Le mapping officiel provider -> categorie pour la generation des registries se trouve dans `config/provider-category.map.json`.

- trigger_message : canaux d'entree/sortie (Slack, Gmail, WhatsApp, Messenger)
- validation_humaine : boucle humaine (Slack, WhatsApp, Messenger)
- crm : gestion clients (Axonaut, CRM interne)
- sales : gestion prospects (CRM ou outil commercial)
- ged : gestion documentaire (Drive, Docs, GED interne)
- marketing : campagnes et emails marketing (Brevo)
- task_manager : gestion de taches (Monday, Asana)
- calendar : calendriers (Google Calendar, Outlook)
- llm : modeles de langage (OpenAI, Claude)

## Regles d'architecture

- Les tools ne contiennent aucune logique metier
- Les capabilities restent atomiques (pas de logique metier)
- Les use cases portent la logique metier et peuvent composer d'autres use cases
- Toute communication passe par une envelope standard
- Les schemas sont la source de verite

## Architecture fonctionnelle

Flux principal :
Trigger ou Agent
→ Executor
→ Tools

Principes :
- L'Agent decide et planifie (liste de steps)
- L'Executor execute sans intelligence ni logique metier
- Les Tools realisent des actions atomiques
- La memoire circule uniquement via l'envelope

Artefacts :
- Configs (capabilities, tools, use cases) decrivent le comportement
- Registries materialisent les references utilisables par l'executor
- Workflows golden servent de reference minimale
- Workflows reels implementent les actions et integrations

## Couches du systeme

- Triggers : points d'entree (webhook, schedule, inbox, chat)
- Agent : planification et selection des steps
- Executor : moteur deterministe d'execution
- Tools : actions atomiques connectees aux APIs
- Utils : helpers partages (normalisation, validation, guards)
- Configs : definitions declaratives (tools, capabilities, use cases)
- Registries : catalogues compiles pour l'execution

## Workflows et configuration

Seuls les workflows suivants sont utilises :
- agent
- triggers
- executor
- tools
- utils (si reutilises par plusieurs workflows)

Tout le reste est du JSON declaratif simple qui respecte les contrats.

## Convention de nommage (configs)

- Format : `domain.resource.action`
- Exemple capability : `email.message.fetch`
- Exemple use case : `briefing.daily.generate`

Pour demarrer, un nouveau client ne fait que :
- importer les workflows dans n8n
- connecter les credentials pour chaque tool

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.tool.google-drive`
- `so.trigger.webhook`
- `so.agent.planner`
- `so.executor.core`
- `so.golden.tools`

Quand un workflow en appelle un autre (Execute Workflow),
utiliser le nom conforme a cette convention pour garantir le routage.

## Documentation runtime

- docs/executor-runtime.md

# Executor Runtime — Smart Office

This document defines the **runtime contract** of the Smart Office Executor.

It does not describe how the workflow is wired.
It defines **what must never change**.

This file exists to prevent architectural drift.

---

## Purpose

The Executor is the **runtime engine** of Smart Office.

It executes declarative execution plans (steps) produced by agents or triggers,
strictly according to the contracts defined in `/contracts`.

The Executor:

- executes instructions
- never decides what to do
- never contains business logic
- never embeds intelligence

---

## Position in the architecture

The Executor sits strictly between:

Trigger / Agent (decision, planning)
↓
Executor
↓
Tools (API actions)

yaml
Copier le code

There is **exactly one Executor** in the system.

---

## What the Executor DOES

The Executor:

- receives an Envelope (legacy or execution)
- normalizes it into an Execution Envelope
- executes steps sequentially
- resolves each step by type:
  - `tool`
  - `capability`
  - `usecase`
- propagates memory across all steps
- applies `when`, `save`, and `on_error` policies
- produces a final `Result`

Tool resolution rules:

- tool definitions are loaded from `registries/tools.json`
- each tool points to `config/tools/*.tool.json`
- `step.params` is forwarded to the tool as-is
- the expected params keys come from `actions[].input`
- if `step.operation` is missing, `step.params.action` is used as fallback

Registry loading:

- the Executor expects `payload.registryFiles` in the execution envelope
- optional fallback registry can be provided via `payload.options.fallbackRegistry`

All behaviors are driven **only by JSON configuration**.

---

## Envelope I/O (read + write)

Read:

- Legacy envelope: `input.steps` + `context.memory` are normalized into an execution state.
- Execution envelope: `header`, `payload.steps`, `payload.memory`, `payload.registryFiles`, `payload.options` are used as-is.
- If the incoming envelope is legacy, a default `header` is created and the payload is rebuilt from legacy fields.

Write:

- The Executor emits a **result envelope** shaped as:
  - `header`: copied from the execution state (or generated if missing).
  - `output`: `{ results[], memory }` with optional `trace`/`debug` when `options.debug = true`.
  - `error`: `null` on success, or a structured error object.
- This output is a legacy-compatible result envelope. If you need a strict execution envelope, wrap it in a trigger/adapter that maps `output` into `payload.result`.

Tool I/O bridge:

- The Executor builds `toolInput` using `contracts/tool-input.schema.json`.
- Tools must return `toolResult` using `contracts/tool-result.schema.json`.
- The Executor stores each `toolResult` in `output.results[]` and can project it into `memory.state` via `save`.

---

## What the Executor MUST NOT DO

The Executor must never:

- decide which use case to run
- generate or modify steps
- contain business rules
- call APIs directly
- persist data outside the provided memory
- learn, optimize, or adapt
- infer missing intent

All decisions belong to the **Agent layer**.

---

## Determinism rule

Given the same Envelope input,
the Executor must always produce the same Result.

No hidden state.
No side effects.
No heuristics.

---

## Memory contract

- Memory is always provided explicitly
- Memory is mutable
- Memory is propagated to every step
- Memory survives the whole execution
- Memory is **never persisted** by the Executor

The Executor is stateless outside the Envelope.

---

## Error handling contract

Error handling is declarative.

Supported modes:

- `stop`
- `continue`
- `fallback`

The Executor applies the declared policy.
It never invents recovery strategies.

---

## Result contract

Execution always produces a Result object.

Rules:

- `success = true` ⇒ `error = null`
- `success = false` ⇒ `error` is required

The Executor does not interpret the result.

---

## Invariants (non-negotiable)

The Executor must always:

- respect JSON schemas
- respect execution order
- remain deterministic
- remain stateless
- be replaceable without changing configurations

If a feature violates one of these points,
it does **not** belong in the Executor.

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.executor.core`
- `so.tool.google-drive`
- `so.trigger.webhook`

---

## Scope boundaries

The following are explicitly out of scope:

- permissions
- policies engine
- learning
- optimization
- parallel execution
- scheduling
- observability

These may exist **around** the Executor, never inside it.

---

## Design philosophy

> The Executor is a machine, not an agent.

It executes exactly what it is told to execute — nothing more.

If something feels “smart”, it does not belong here.


- docs/agent-runtime.md

# Agent Runtime — Smart Office

This document defines the runtime contract for Agent workflows.
It describes what must stay stable, not how the workflow is wired.

---

## Purpose

The Agent is the decision and planning layer.
It turns incoming intent into a deterministic execution plan for the Executor.

---

## Position in the architecture

Triggers / Chat
↓
Agent
↓
Executor
↓
Tools

---

## What the Agent DOES

The Agent:

- receives input from triggers or chat
- interprets intent and context
- builds an ordered list of steps
- returns a valid Execution Envelope for the Executor
- optionally enriches memory and options

---

## What the Agent MUST NOT DO

The Agent must never:

- execute tools or call APIs directly
- bypass the Executor
- mutate external state
- embed tool implementation logic
- persist data outside explicit memory contracts

---

## Input and output contracts

Inputs may be raw trigger payloads or a legacy Envelope.
Outputs must be an Execution Envelope as defined in `contracts/envelope.schema.json`.

Minimum output requirements:

- `header.id`, `header.version`, `header.timestamp`, `header.source`, `header.destination`, `header.type`
- `payload.steps` as a non-empty array
- each step conforms to `contracts/step.schema.json`

Envelope fabrication (Agent output):

- `header` must be fully populated (id/version/timestamp/source/destination/type).
- `payload.memory` must exist (even if empty) and is the only mutable state.
- `payload.steps` must be ordered and explicit; no implicit defaults in tools.
- If the Agent receives a legacy envelope, it must map:
  - `context.memory` → `payload.memory`
  - `input.steps` → `payload.steps`

---

## Planning rules

- Steps must be ordered and executable sequentially.
- Step types are limited to: `tool`, `capability`, `usecase`.
- Each step must include a non-empty `ref` and an object `params` (even when empty).
- The Agent may include `save` or `on_error` policies in steps, but must not invent tool behavior.
- If required inputs are missing, the Agent must add a clarification step (capability) instead of guessing tool inputs.

Planning rules are configured in `config/agent/planning_rules.json`
and must validate against `contracts/agent-planning.schema.json`.

---

## Memory handling

- Memory is explicit and passed in the envelope.
- The Agent may read and write memory content.
- The Agent must not persist memory outside the envelope.

---

## Error handling

If planning fails, the Agent must return a structured error:

- either a legacy envelope with `error`
- or an execution envelope with `payload.result.success = false`

## Clarification and human validation loop

- After the initial intent analysis, the planner must verify context completeness (memory + trigger payload).
- When the context is insufficient, the planner emits a first step targeting a clarification capability (ex: `human.validation.request`).
- The supervisor may inject the same clarification step if a received plan is incomplete or unordered.
- The clarification step must explicitly loop back to the Agent (`header.destination = "agent"` or via tool routing) so the new context can be replanned.
- The Agent marks readiness in memory (ex: `memory.state.context_complete = true`) once all mandatory inputs are gathered.

---

## Invariants (non-negotiable)

The Agent must always:

- emit schema-valid envelopes
- remain the only planner/decision layer
- keep tool execution delegated to the Executor

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.agent.planner`
- `so.agent.supervisor`


- docs/tools-runtime.md

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

Input mapping rules:

- Executor builds `toolInput` with `{ runId, stepId, tool, params, context.memory }`.
- Tool workflows often normalize the incoming item into `{ provider, operation, params }`.
- This normalization is done via a Code node (or Update Fields) to avoid legacy Set nodes.
- Dispatch is performed by a Code node (no Switch), to keep routing deterministic in one place.
- If a workflow receives the full `toolInput`, it must map:
  - `tool.operation` → `operation`
  - `tool.provider` → `provider`
  - `params` → `params`

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

Special case:
- `sampleFetch` is a virtual action used for onboarding mapping.
- It may rely on optional params and return a minimal sample payload.

Categories reference:

- `docs/tools-catalog.md`

---

## Tool result contract

Tools return a result object defined by:

- `contracts/tool-result.schema.json`

The result must be deterministic for a given API response.

Output rules:

- Always return a single `toolResult` object: `{ ok, data, error, meta? }`.
- On API success: `ok=true`, `data` filled, `error=null`.
- On API failure: `ok=false`, `data=null`, `error` filled with a stable code/message.

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

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.tool.google-drive`
- `so.tool.slack`


- docs/capabilities-runtime.md

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

- `inputs`: expected fields (input/context/memory) — required
- `outputs`: produced fields (memory) — required
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
- Capabilities must not embed business decisions (they are atomic building blocks).
- Inputs/outputs must be explicitly documented so the planner can validate context completeness.
- Steps must follow `contracts/step.schema.json`.

---

## Invariants

- Inputs and outputs must be documented.
- Steps must reference existing tools or capabilities.


- docs/usecases-runtime.md

# Use cases Runtime — Smart Office

This document defines the runtime contract for use cases.
It describes what must stay stable, not how workflows are wired.

---

## Purpose

Use cases orchestrate capabilities and other use cases to deliver business scenarios.
Business logic and objectives live here, not inside capabilities or tools.

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
- Business logic stays in use cases to keep the planner aligned with intent.
- Steps must follow `contracts/step.schema.json`.
- Inputs and outputs must be explicit.

---

## Invariants

- Definitions are configuration-only.
- No workflow logic embedded in use cases.


- docs/triggers-runtime.md

# Triggers Runtime — Smart Office

This document defines the runtime contract for Trigger workflows.
It describes what must stay stable, not how each trigger is wired.

---

## Purpose

Triggers convert external events into Smart Office envelopes.
They act as the system entry points.

---

## Position in the architecture

External event
↓
Trigger
↓
Agent or Executor

---

## What Triggers DO

Triggers:

- receive external events (webhook, schedule, inbox, chat, drive updates)
- normalize raw payloads
- emit an envelope for the next layer
- can route incomplete requests toward the Agent for clarification (never performing the clarification themselves)

---

## What Triggers MUST NOT DO

Triggers must never:

- decide which use case to run
- plan execution steps
- call tools or APIs (beyond the trigger source itself)

---

## Output contract

Triggers emit one of the two valid envelope forms:

- Legacy envelope (context/input/output/error)
- Execution envelope (header/payload)

If the trigger targets the Agent, it may emit a legacy envelope
with minimal context and input. The legacy envelope must include
`context.memory` (can be empty) to satisfy the schema.
If the trigger targets the Executor, it must emit a full execution envelope.

Envelope fabrication rules:

- Legacy envelope:
  - `context.memory` is required (empty object allowed).
  - `input.steps` is optional (triggers may forward raw event data instead).
- Execution envelope:
  - `header` must be complete.
  - `payload.memory` must exist.
  - `payload.steps` must exist when targeting the Executor.

## Registry injection (Google Drive)

When routing directly to the Executor, triggers should inject registries
so the Executor can resolve tools/capabilities/usecases.

Expected fields in the execution envelope:

- `payload.registryFiles` as an array of `{ category, ref, content }`
- `payload.options.fallbackRegistry` (optional)

Registries are typically loaded from Google Drive using file IDs stored in:

- `REGISTRY_TOOLS_FILE_ID`
- `REGISTRY_CAPABILITIES_FILE_ID`
- `REGISTRY_USECASES_FILE_ID`

All three variables are optional. If a file ID is missing or the Google
Drive node returns an empty file, triggers must still build a valid
execution envelope by falling back to the local copies in
`registries/tools.json`, `registries/capabilities.json` and
`registries/usecases.json`. The fallback should also be passed in
`payload.options.fallbackRegistry` to keep the Executor operational when
remote storage is unavailable.

---

## Header requirements

When emitting an execution envelope, the header must include:

- `id`, `version`, `timestamp`
- `source` (trigger name)
- `destination` (agent or executor)
- `type` (event or execution type)

---

## Invariants (non-negotiable)

Triggers must always:

- remain stateless beyond the event payload
- emit schema-valid envelopes
- avoid business logic and planning
- include memory (even empty) so the Agent can loop through clarification if needed

---

## Regle de nommage des workflows

Convention : `so.<layer>.<name>`

Exemples :
- `so.trigger.webhook`
- `so.trigger.schedule`
- `so.trigger.google-drive`

Voir aussi : workflows/triggers/README.md

README — Workflows Triggers (Smart Office)

But

Les triggers ingestent des evenements externes et emettent des envelopes.
Ce sont les points d'entree du systeme.

Spec de reference : docs/triggers-runtime.md

Workflows

- google-drive.trigger.workflow.json (`so.trigger.google-drive`)
- gmail.trigger.workflow.json (`so.trigger.gmail`)
- manual.trigger.workflow.json (`so.trigger.manual`)
- schedule.trigger.workflow.json (`so.trigger.schedule`)
- slack.trigger.workflow.json (`so.trigger.slack`)
- webhook.trigger.workflow.json (`so.trigger.webhook`)
- registry-loader.trigger.workflow.json (`so.trigger.registry-loader`)

Nodes et I/O

- google-drive.trigger.workflow.json
  - Trigger Event — Google Drive Trigger (`n8n-nodes-base.googleDriveTrigger`) : surveille un dossier specifique; emet les metadonnees de changement Drive.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : enveloppe legacy avec `input.event.source = google-drive`.

- gmail.trigger.workflow.json
  - Trigger Event — Gmail Trigger (`n8n-nodes-base.gmailTrigger`) : recoit les evenements Gmail (nouveaux messages) ; produit le payload Gmail brut.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : attend le payload Gmail; construit une enveloppe legacy avec `input`/`context` pre-remplis pour l'executor.

- manual.trigger.workflow.json
  - Trigger Event — Manual Trigger (`n8n-nodes-base.manualTrigger`) : declenchement manuel sans entree; emet un item vide.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : construit une enveloppe legacy minimale avec `input` vide et `context.memory` par defaut.

- schedule.trigger.workflow.json
  - Trigger Event — Schedule Trigger (`n8n-nodes-base.scheduleTrigger`) : cron/interval pour lancer le flux; emet la date de run.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : transforme l'horodatage en enveloppe legacy destinee a l'executor.

- slack.trigger.workflow.json
  - Trigger Event — Slack Trigger (`n8n-nodes-base.slackTrigger`) : recoit les events Slack (messages, reactions... selon config); fournit le payload Slack.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : attend le payload Slack; genere une enveloppe legacy avec `input`/`context` alimente par les metadonnees Slack.

- webhook.trigger.workflow.json
  - Trigger Event — Webhook (`n8n-nodes-base.webhook`) : recoit un appel HTTP et expose body/query/headers.
  - Build Legacy Envelope — Code (`n8n-nodes-base.code`) : lit les donnees HTTP; encapsule dans une enveloppe legacy vers l'executor.

- registry-loader.trigger.workflow.json
  - Trigger Event — Manual Trigger (`n8n-nodes-base.manualTrigger`) : lancement manuel pour charger les registres.
  - Download Tools Registry — Google Drive (`n8n-nodes-base.googleDrive`) : attend `fileId` depuis l'environnement; telecharge le JSON des tools si la variable est definie.
  - Parse Tools Registry — Code (`n8n-nodes-base.code`) : parse le fichier tools si present ou renvoie `null` pour activer le fallback local.
  - Download Capabilities Registry — Google Drive (`n8n-nodes-base.googleDrive`) : telecharge le JSON des capabilities quand l'ID Drive existe.
  - Parse Capabilities Registry — Code (`n8n-nodes-base.code`) : parse si un binaire est fourni, sinon laisse le champ vide pour utiliser la copie locale.
  - Merge Registries A — Merge (`n8n-nodes-base.merge`) : fusionne tools + capabilities en un seul item.
  - Download Usecases Registry — Google Drive (`n8n-nodes-base.googleDrive`) : telecharge le JSON des usecases si configure.
  - Parse Usecases Registry — Code (`n8n-nodes-base.code`) : parse si present, sinon laisse la place au fallback.
  - Merge Registries B — Merge (`n8n-nodes-base.merge`) : ajoute les usecases au flux fusionne.
  - Build Execution Envelope — Code (`n8n-nodes-base.code`) : construit une enveloppe d'execution contenant `payload.registryFiles` et `payload.options.fallbackRegistry` en lisant les registries Google Drive ou, a defaut, les fichiers locaux `registries/*.json`.

Variables attendues (n8n env)

- REGISTRY_TOOLS_FILE_ID
- REGISTRY_CAPABILITIES_FILE_ID
- REGISTRY_USECASES_FILE_ID

Regles

- Un trigger ne planifie pas de steps.
- Un trigger n'execute pas de tools.
- Un trigger doit emettre une envelope conforme aux schemas.

Utilisation des utils

- Normalisation des payloads entrants
- Construction d'enveloppe minimale
- Validation Ajv avant emission

Regle de nommage

- Convention : `so.<layer>.<name>`




- docs/utils-runtime.md

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


- docs/codex-plan.md

# Plan Codex — Smart Office

Ce document decrit le plan d'execution pour finaliser le projet.
Le plan est sequence en deux phases : goldens puis reels.

---

## Phase 1 — Goldens (reference)

Objectif : disposer de workflows canoniques et minimalistes,
alignes avec les contrats et la doc runtime.

1) Verifier la coherence des goldens existants ✅
   - executor
   - agent
   - tools
   - triggers

2) Completer les goldens manquants ou incomplets ✅
   - I/O explicites et deterministes
   - pas de credentials
   - ajouts : `15_agent_planner.json`, `16_agent_supervisor.json`

3) Valider la coherence avec les schemas ✅
   - envelope, step, tool-input, tool-result

Livrables :
- workflows/golden/*.json (complets)
- workflows/golden/README.md

# README — Workflows Golden (Smart Office)

## But

Les workflows golden sont des implementations de reference.
Ils servent de base stable pour les humains et les assistants AI.
Ils doivent rester coherents avec les specs dans docs/ et contracts/.

Spec de reference : docs/codex-plan.md

---

## Philosophie

Les golden workflows sont :
- Reference-first, pas forcement production-ready
- Lisibles et modifiables
- Concus pour etre copies et adaptes

Ils ne sont pas figes : les evolutions sont encouragees tant
qu'elles respectent l'architecture.

---

## Workflows

- 10_agent.json (`so.golden.agent`)
  Exemples de construction d'enveloppe d'execution par un agent.
  Nodes : Manual Trigger (`n8n-nodes-base.manualTrigger`) → Build Execution Envelope (`n8n-nodes-base.code`) : attend `header`/`payload` facultatifs, renvoie une enveloppe avec steps et memoire par defaut.

- 15_agent_planner.json (`so.golden.agent_planner`)
  Exemple de planification avec boucle de clarification.
  Nodes : Planner Trigger — Manual Trigger → Build Plan Envelope — Code : attend `payload.memory.state.context_complete`; produit un plan avec step de clarification ou de notification et header vers agent/executor.

- 16_agent_supervisor.json (`so.golden.agent_supervisor`)
  Exemple de supervision du plan avant execution.
  Nodes : Supervisor Trigger — Manual Trigger → Build Supervised Envelope — Code : attend `payload.steps`/`payload.memory`; preprend une capability de validation si besoin et renvoie l'enveloppe.

- 20_tools.json (`so.golden.tools`)
  Exemples de pattern d'execution d'un tool (I/O standardise).

  Moteur d'execution canonique (iteration, dispatch, output).
  Nodes : Tool Trigger — Manual Trigger → Dispatch Operation — Code : attend `payload.steps` ou `input.steps`; simule la resolution/dispatch et renvoie un output standardise avec results/debug.

- 40_triggers.json (`so.golden.triggers`)
  Patterns de triggers et emission d'enveloppe.
  Nodes : Trigger Event — Manual Trigger → Build Legacy Envelope — Code : construit une enveloppe legacy a partir du payload manuel.

- 50_utils.json (`so.golden.utils`)
  Utils deterministes et reusables.
  Nodes : Utils Trigger — Manual Trigger → Normalize Text — Code : attend `text` dans l'input; renvoie une version normalisee (trim, lowercase) dans `result`.

---

## Nodes n8n a privilegier (non deprecies)

Les golden workflows doivent privilegier les nodes recents et supportes.
Les nodes deprecies sont a eviter lorsqu'un equivalent moderne existe.

Preferer :
- Manual Trigger
- Schedule Trigger
- Webhook
- Error Trigger
- n8n Trigger
- HTTP Request
- Edit Fields (plutot que Set legacy)
- Code (remplace Function / Function Item)
- Loop Over Items
- Aggregate
- Merge
- If
- Dispatch (Code)
- Split In Batches
- Limit
- Sort
- Remove Duplicates
- Date & Time

A eviter quand possible :
- Function (legacy)
- Function Item (legacy)
- Set (legacy)
- Loop (legacy)

---

## Patterns d'execution

Prefere :
Trigger
→ Validation
→ Dispatch / Execution
→ Aggregation
→ Output

---

## Regles

- Pas de credentials ou d'IDs specifique a un environnement.
- Pas de logique metier en dehors de l'agent.
- I/O explicites et deterministes.
- Modifications directes permises si elles améliorent clarte et cohérence.

Regle de nommage

- Convention : `so.<layer>.<name>`

---

Fin du README.

 aligne

---

## Phase 2 — Reels (implementation)

Objectif : generer les workflows et configs reels a partir des defs.

1) Configs ✅
   - config/tools/*.tool.json
   - config/capabilities/*.capability.json
   - config/use-cases/*.usecase.json

2) Registries ✅
   - registries/tools.json
   - registries/capabilities.json
   - registries/usecases.json

3) Workflows reels ✅
   - tools/ : un workflow par tool
   - triggers/ : un workflow par type d'entree
   - agent/ : planner + supervisor coherents avec specs
   - executor/ : workflow canonique

4) Validation ✅
   - AJV sur formats/
   - validate_all.sh (workflows, configs, registries, links)
   - audit des nodes de workflows (`npm run validate:workflow-nodes`)

Livrables :
- workflows/*.json complets
- configs et registries a jour

---

## Guide d'installation n8n

Objectif : permettre l'import et le deploiement propre des workflows.

A produire :
- prerequis (n8n version, variables, credentials)
- import des workflows golden puis reels
- mapping des credentials par tool
- verification d'execution

Livrable :
- docs/n8n-installation.md

# Installation n8n — Smart Office

Ce guide decrit l'installation et l'import des workflows Smart Office
(goldens puis reels) dans n8n.

---

## Prerequis

- n8n recent (version stable)
- Acces aux credentials des outils (Slack, Gmail, Drive, etc.)
- Variables d'environnement pour n8n (si necessaire)

---

## Ordre d'import recommande

1) Importer les workflows golden
   - Ils servent de reference minimale
   - Pas de credentials obligatoires

2) Importer les workflows reels
   - tools/
   - triggers/
   - agent/
   - executor/ (si tu utilises la version exportee)

---

## Import dans n8n

1) Ouvrir n8n
2) Menu Workflows > Import from File
3) Importer les JSON depuis :
   - workflows/golden/
   - workflows/tools/
   - workflows/triggers/
   - workflows/agent/
   - workflows/executor/

4) Importer le loader des registries (optionnel mais recommande)
   - workflows/triggers/registry-loader.trigger.workflow.json

---

## Credentials

- Associer les credentials a chaque workflow tool
- Garder les credentials hors Git
- Verifier que les nodes utilisent le bon credential name

## Variables d'environnement (registries Google Drive)

Pour charger les registries depuis Google Drive, definir ces variables
dans l'environnement n8n :

- `REGISTRY_TOOLS_FILE_ID`
- `REGISTRY_CAPABILITIES_FILE_ID`
- `REGISTRY_USECASES_FILE_ID`

Ces variables sont optionnelles : si elles ne sont pas definies ou si les
binaires Google Drive sont vides, le workflow `so.trigger.registry-loader`
repliera automatiquement sur les copies locales du depot
(`registries/tools.json`, `registries/capabilities.json`,
`registries/usecases.json`). Le fallback est egalement insere dans
`payload.options.fallbackRegistry` pour garantir que l'Executor dispose
toujours d'un catalogue valide.

## Onboarding intelligent (mapping)

Pour un onboarding complet des mappings tools, suivre le plan :
- docs/.codex/PLAN_MAPPING_ONBOARDING.md

# PLAN — Mapping Onboarding Hardening (single PR)

Objectif
- Finaliser l’expérience d’onboarding “mappings” en verrouillant la qualité via CI + tests,
  en ajoutant des samples JSON versionnés, en rendant le lint utilisable en interactif,
  et en fournissant des checklists par source.
- Ajouter un onboarding intelligent via Agent (LLM + validation Slack + stockage Drive).

Contrainte
- Tout livrer dans UNE SEULE PR.
- Ne pas casser le mode lint non-interactif existant.
- Pas de secrets/IDs réels dans les samples.

Périmètre des tâches (issues internes)
1) CI lint automatique des mappings
2) Samples JSON pour lint interactif
3) Tests unitaires mapping runtime
4) Lint interactif avec complétion des mappings
5) Checklists d’onboarding par source (Monday/Drive/Slack/Gmail/Google Calendar/Google Docs/Google Sheets/Axonaut/Brevo)
6) Use case onboarding intelligent (LLM + Slack + Drive)
7) Ajout de l’operation `sampleFetch` dans tous les tools workflows

Arborescence cible (proposition)
- scripts/
  - mapping_lint.js                     (existant, à étendre)
  - mapping_lint_interactive.js         (optionnel si séparation utile)
- mappings/
  - <domain>/*.json                     (existant)
- samples/
  - monday/
    - payload.example.json
  - drive/
    - payload.example.json
  - slack/
    - payload.example.json
  - gmail/
    - payload.example.json
  - google-calendar/
    - payload.example.json
  - google-docs/
    - payload.example.json
  - google-sheets/
    - payload.example.json
  - axonaut/
    - payload.example.json
  - brevo/
    - payload.example.json
- docs/
  - onboarding/
    - monday.checklist.md
    - drive.checklist.md
    - slack.checklist.md
    - gmail.checklist.md
    - google-calendar.checklist.md
    - google-docs.checklist.md
    - google-sheets.checklist.md
    - axonaut.checklist.md
    - brevo.checklist.md
    - mappings.md                        (si doc centrale)
- tests/
  - mapping/
    - mapping_runtime.test.js            (ou __tests__/ selon stack)
- .github/workflows/
  - mapping-lint.yml                     (nouveau ou extension CI)
- config/
  - capabilities/onboarding_mapping_intelligent.capability.json
  - use-cases/onboarding_mapping_intelligent.usecase.json

Exigences fonctionnelles détaillées

(1) CI lint automatique des mappings
- Ajouter un workflow GitHub Actions qui :
  - s’exécute sur pull_request (et idéalement push sur main).
  - installe deps (npm ci / pnpm i selon repo).
  - exécute : node scripts/mapping_lint.js --ci
  - itère sur tous les mapping domains trouvés dans /mappings (ou le chemin réel du repo).
- Le mode --ci doit:
  - retourner exit code != 0 si erreurs.
  - produire une sortie lisible (liste des mappings en erreur + raisons).

(2) Samples JSON versionnés
- Ajouter des payloads exemples MINIMAUX mais réalistes pour:
  - Monday
  - Google Drive
  - Slack
  - Gmail
  - Google Calendar
  - Google Docs
  - Google Sheets
  - Axonaut
  - Brevo
- But : permettre un “dry-run” du lint / mapping sur un input connu.
- Aucun identifiant réel : utiliser des valeurs fictives.

(3) Tests unitaires mapping runtime
- Ajouter tests pour:
  - mapPayloadToDomain (ou équivalent)
  - convertisseurs (date/number/bool/string templates)
  - validateurs/détecteurs (champs requis, target inconnue)
- Au minimum:
  - 1 test “happy path” par source
  - 1 test “required missing”
  - 1 test “unknown target”
- Ajouter script npm si manquant: "test" et/ou "test:mapping".

(4) Mode interactif pour combler les champs manquants
- Étendre le CLI lint pour accepter :
  - --interactive (ou -i)
  - quand un champ requis n’est pas mappé :
    - proposer une liste de cibles possibles (issues du domaine)
    - permettre de saisir une correspondance (sourcePath -> targetField)
    - écrire la mise à jour dans le fichier de mapping (ou générer un patch) AVANT de sortir
- Doit fonctionner aussi en non-interactif (comportement actuel conservé).
- En CI, l’interactif doit être désactivé par défaut.

(5) Checklists par source
- Ajouter des checklists Markdown (Monday/Drive/Slack/Gmail/Google Calendar/Google Docs/Google Sheets/Axonaut/Brevo) décrivant:
  - Pré-requis opérateur
  - Champs attendus / IDs / colonnes
  - Conventions de mapping (ex: date formats, enums, null handling)
  - Commandes à exécuter (lint, dry-run)
  - Erreurs fréquentes + correctifs

(6) Use case onboarding intelligent
- Use case `onboarding_mapping_intelligent` pour orchestrer :
  - sampleFetch (tool workflow)
  - proposition LLM + justification
  - validation humaine via Slack
  - stockage Drive du mapping valide

(7) Ajout de `sampleFetch` dans les tools
- Ajouter `sampleFetch` dans chaque workflow tool (switch).
- Ajouter `sampleFetch` dans chaque config tool (action virtuelle).

Acceptance criteria (DoD)
- Une PR unique contenant:
  - workflow CI opérationnel (mapping lint)
  - samples présents et documentés
  - tests unitaires verts en local + CI
  - lint interactif utilisable (manuel) + CI stable
  - docs checklists ajoutées
  - use case onboarding intelligent disponible
  - tools enrichis avec `sampleFetch`
- README / docs mis à jour pour pointer vers:
  - commandes lint
  - chemin des samples
  - checklists

Guidelines d’implémentation
- Préférer changements incrémentaux et lisibles.
- Pas de refactor massif si non nécessaire.
- Ajouter des logs utiles (sans bruit excessif).
- Respecter conventions du repo (format, lint, test runner).

Plan d’exécution (ordre)
1) Scanner le repo: structure, scripts existants, runner tests, conventions.
2) Ajouter samples + doc minimale.
3) Ajouter tests (et config runner si besoin).
4) Étendre mapping_lint.js : mode --ci + sorties + codes retour.
5) Ajouter workflow GitHub Actions.
6) Ajouter mode --interactive (inquirer/readline) + écriture patch mapping.
7) Ajouter checklists par source.
8) Ajouter use case onboarding intelligent + sampleFetch tools.
9) Mise à jour docs centrale + validation finale (lint + tests).

Notes
- Si le repo utilise pnpm/yarn, adapter toutes les commandes CI.
- Si les mappings ne sont pas dans /mappings, détecter et ajuster.
- Convention de nommage workflows : `so.<layer>.<name>` (ex: `so.tool.google-drive`).

---

## Onboarding d'un nouveau client (ce qui est a refaire)

Ce plan vise a durcir le framework. Pour un nouveau client, seules les etapes
ci-dessous sont necessaires (le reste est deja en place une fois pour toutes).

1) Completer/adapter les mappings client
   - `registries/mappings/<source>/*.json`

2) Valider les mappings
   - `node scripts/mapping_lint.js --interactive` (si besoin)
   - `node scripts/mapping_lint.js --ci`

3) Verifier les tests mapping
   - `node --test tests/mapping/mapping_runtime.test.js`

4) Passer a l'onboarding n8n (workflows + credentials)
   - suivre `docs/n8n-installation.md`
5) Lancer l'onboarding intelligent (si active)
   - use case `onboarding_mapping_intelligent`



Etat et suivi :
- docs/.codex/STATE_MAPPING_ONBOARDING.json

---

## Verification rapide

- Executer un workflow golden (manuel)
- Executer un tool simple (ex: slack)
- Verifier l'enveloppe en sortie
 - Verifier les tests mapping si besoin :
   - `node --test tests/mapping/mapping_runtime.test.js`

---

## Notes

- Les goldens sont des references, pas des workflows production
- Les workflows reels peuvent evoluer en fonction des APIs

 ✅

---

## Etat actuel

- Les goldens sont en place et valides.
- Les workflows reels sont generes et coherents.
- Les registries sont generes via `validate_all.sh`.
- Le loader Google Drive pour les registries est disponible.
- La doc et les scripts de validation sont en place.
- Onboarding intelligent documente dans `docs/.codex/PLAN_MAPPING_ONBOARDING.md`.
- Use case `mapping.onboarding.run` disponible (LLM + Slack + Drive).
- `sampleFetch` ajoute dans tous les tools workflows.

---

## Reste a faire (operationnel)

- Uploader les registries (`registries/tools.json`, `registries/capabilities.json`, `registries/usecases.json`) sur Google Drive.
- Definir les variables d'environnement n8n :
  - `REGISTRY_TOOLS_FILE_ID`
  - `REGISTRY_CAPABILITIES_FILE_ID`
  - `REGISTRY_USECASES_FILE_ID`
- Importer le workflow `workflows/triggers/registry-loader.trigger.workflow.json`.
- Verifier que les credentials Google Drive sont associes.
- Executer un test n8n de bout en bout (trigger -> executor -> tool).
- Activer ou forcer `payload.options.debug = true` pour tracer l'execution.

---

## Definition of Done

- Goldens complets et coherents ✅
- Workflows reels generes ✅
- Configs et registries a jour ✅
- Guide n8n disponible ✅


- docs/tools-catalog.md

# Tools Catalog — Smart Office

La génération des outils repose désormais sur la chaîne suivante :

1. Docs locales n8n (`docs/n8n/raw`) validées par `npm run docs:validate:n8n`.
2. Extraction + fragments officiels -> `npm run ops:parse` puis `npm run ops:fragments`.
3. Assemblage + validation de la registry officielle -> `npm run ops:build` puis `npm run ops:validate`.
4. Dérivation des catégories, capacités et tools (`npm run categories:generate`, `npm run capabilities:generate`, `npm run tools:generate`).
5. Génération des workflows outils (`npm run workflows:tools`).

Le fichier `registries/n8n-official-ops.json` est la source unique des opérations; les fragments et overrides sont les seules entrées éditables.

## Sources n8n

- `docs/n8n/raw/` : bloc JSON utilise par `parse_n8n_docs.js`.
- `docs/n8n/human/` : version lisible pour revue manuelle.
- `docs/n8n/html/` : snapshot brut des pages n8n.
- `docs/n8n/sources.md` : liste des URLs.

Commande rapide :

```bash
./scripts/fetch_n8n_docs.sh --build --rebuild-raw
```


- docs/n8n-installation.md
- docs/human-plan.md

# Plan Humain — Smart Office

Ce document liste les taches a realiser cote operations/deploiement.

## Taches

1) Publier les registries sur Google Drive
   - `registries/tools.json`
   - `registries/capabilities.json`
   - `registries/usecases.json`

2) Configurer les variables n8n
   - `REGISTRY_TOOLS_FILE_ID`
   - `REGISTRY_CAPABILITIES_FILE_ID`
   - `REGISTRY_USECASES_FILE_ID`
   - Recuperer les IDs des fichiers Google Drive (URL du fichier -> ID entre `/d/` et `/view`)
   - n8n Docker :
     - definir les variables dans l'environnement du container
     - redemarrer n8n pour prise en compte
   - n8n UI (si supporte par la stack) :
     - Settings > Variables
     - ajouter les trois variables avec leurs IDs
   - Pour verifier si l'UI est disponible :
     - ouvrir `http://<host>:5678` et confirmer l'editeur n8n

3) Importer les workflows dans n8n
   - `workflows/agent/planner.workflow.json` → `so.agent.planner`
   - `workflows/agent/supervisor.workflow.json` → `so.agent.supervisor`
   - `workflows/executor/executor.workflow.json` → `so.executor.core`
   - `workflows/tools/axonaut.workflow.json` → `so.tool.axonaut`
   - `workflows/tools/brevo.workflow.json` → `so.tool.brevo`
   - `workflows/tools/gmail.workflow.json` → `so.tool.gmail`
   - `workflows/tools/google-calendar.workflow.json` → `so.tool.google-calendar`
   - `workflows/tools/google-docs.workflow.json` → `so.tool.google-docs`
   - `workflows/tools/google-drive.workflow.json` → `so.tool.google-drive`
   - `workflows/tools/google-sheets.workflow.json` → `so.tool.google-sheets`
   - `workflows/tools/monday.workflow.json` → `so.tool.monday`
   - `workflows/tools/openai.workflow.json` → `so.tool.openai`
   - `workflows/tools/slack.workflow.json` → `so.tool.slack`
   - `workflows/triggers/gmail.trigger.workflow.json` → `so.trigger.gmail`
   - `workflows/triggers/manual.trigger.workflow.json` → `so.trigger.manual`
   - `workflows/triggers/registry-loader.trigger.workflow.json` → `so.trigger.registry-loader`
   - `workflows/triggers/schedule.trigger.workflow.json` → `so.trigger.schedule`
   - `workflows/triggers/slack.trigger.workflow.json` → `so.trigger.slack`
   - `workflows/triggers/webhook.trigger.workflow.json` → `so.trigger.webhook`

4) Importer le loader de registry
   - `workflows/triggers/registry-loader.trigger.workflow.json`

5) Verifier les credentials Google Drive dans n8n

6) Tester un flux complet
   - Trigger -> Executor -> Tool (ex: Slack)

7) Verifier les logs et la sortie de l'executor

8) Onboarding mapping intelligent (tous les tools)
   - Canal Slack : `#smartoffice`
   - Dossier Drive : creer automatiquement `mappings/` via workflow
   - Use case : `mapping.onboarding.run`
   - Les tools utilisent `sampleFetch` pour recuperer un payload minimal
   - Plan detaille : `docs/.codex/PLAN_MAPPING_ONBOARDING.md`
   - Etat : `docs/.codex/STATE_MAPPING_ONBOARDING.json`

   - Verifier le runtime de mapping (tests) si besoin :
     - `node --test tests/mapping/mapping_runtime.test.js`
   - Pour un nouveau client (minimum) :
     - adapter les mappings `registries/mappings/<source>/*.json`
     - `node scripts/mapping_lint.js --interactive` (si besoin)
     - `node scripts/mapping_lint.js --ci`
     - suivre `docs/n8n-installation.md`

## Debug runtime (executor)

- `debug` est actif par defaut dans l'executor.
- Pour forcer le debug depuis un trigger/agent :
  - `payload.options.debug = true`

## Notes

- Le loader charge les registries et les injecte dans l'enveloppe.
- L'executor attend `payload.registryFiles`.


- docs/n8n/README.md

# Docs n8n — Sources et usages

Ce dossier centralise les sources n8n utilisees pour generer les registries et les workflows.

## Arborescence

- `docs/n8n/raw/` : fichiers Markdown contenant un bloc JSON structure (source pour `parse_n8n_docs.js`).
- `docs/n8n/human/` : version lisible (Markdown) des pages n8n pour relecture humaine.
- `docs/n8n/html/` : snapshot HTML des pages n8n (trace brute).
- `docs/n8n/sources.md` : liste des URLs et date de mise a jour.
- `docs/n8n/minimal-types.md` : synthese des types de workflows retenus.
- `docs/n8n/core-nodes.json` : liste des nodes autorises hors tools (utilisee par `validate_workflow_nodes.js`).

## Regles d'edition

- Les fichiers `raw/*.md` doivent contenir un bloc ```json``` valide.
- Les fragments `registries/n8n-official-ops/*.json` restent la reference pour les operations officielles.
- Les overrides, si necessaires, vont dans `registries/n8n-official-ops/_overrides/`.

## Generer les sources

- Telecharger les pages et mettre a jour les sources :
  `./scripts/fetch_n8n_docs.sh`
- Regenerer les `raw` structurés depuis les fragments :
  `./scripts/fetch_n8n_docs.sh --rebuild-raw`
- Lancer toute la pipeline :
  `./scripts/fetch_n8n_docs.sh --build --rebuild-raw`

## Pourquoi deux formats (raw + human)

- `raw/` sert a la generation automatique (JSON stable).
- `human/` sert a la verification et au refactoring manuel.


- docs/n8n/minimal-types.md

# Types minimaux de workflows n8n

Synthèse basée sur les contrats `/contracts`, les golden workflows (`workflows/golden/*`) et les limites de l'Executor. Les contrats distinguent déjà deux familles fortes :
- `workflow-trigger` impose un nœud de déclenchement spécifique (webhook/schedule/event).
- `workflow-tool` gère l'exécution d'une action avec un dispatch dédié.

L'Executor applique déjà le routage séquentiel, les `when/on_error` déclaratifs et la normalisation des enveloppes ; inutile de créer des types supplémentaires pour cela. On conserve donc **2 types obligatoires** et **2 patterns optionnels** pour rester utile sans multiplier les catégories.

## 1. Trigger (déclencheur)
Point d'entrée du workflow. Couvre les variantes webhook, scheduler ou événement externe. Un connecteur "canal" (ex. Slack) peut avoir un trigger dédié avec sa propre authentification.

## 2. Action / Tool
Invocation d'une opération métier (CRUD, notification, appel API). Chaque tool est lié à ses propres credentials et à des schémas d'entrée/sortie distincts de son éventuel trigger (ex. Slack trigger vs. Slack chat.postMessage).

## Patterns optionnels (seulement si besoin)
Les deux patterns suivants servent à **préparer ou sécuriser** les actions quand les contrats ou le payload ne suffisent pas. Ils ne créent pas de nouvelles catégories métier et doivent rester parcimonieux.

### A. Préparation de données
Validation, normalisation ou enrichissement nécessaires pour respecter les contrats (mapping, contrôle de types, nettoyage). À utiliser avant une action ou avant d'émettre une enveloppe depuis un trigger, uniquement si le payload brut ne respecte pas déjà le schéma attendu.

### B. Pilotage du flux
Branchement conditionnel, limitation des appels ou retries explicites **en plus** des politiques `when/on_error` déjà gérées par l'Executor. À réserver aux cas où le workflow doit rendre visible une règle de pilotage (par exemple, couper un flux après N tentatives ou router selon un attribut métier).

---

### Pourquoi ces 2 + 2 ?
- Les contrats et goldens ne requièrent explicitement que la séparation Trigger / Action ; le reste est déjà pris en charge par l'Executor (séquencement, politiques `when/on_error`, enveloppes).
- Les connecteurs peuvent être duals (un trigger et une action pour le même service) avec des authentifications distinctes : les garder dans des types séparés évite la confusion.
- Les patterns optionnels restent disponibles pour la lisibilité et la conformité aux contrats, sans devenir des catégories supplémentaires.


- [docs/n8n/core-nodes.json](docs/n8n/core-nodes.json)
- docs/n8n/sources.md

# Sources n8n

Mise a jour: 2025-12-26T23:47:35Z

## Core workflows & structure

- workflows: https://docs.n8n.io/workflows/
- workflows-export-import: https://docs.n8n.io/workflows/export-import/

## Execution / run data / error handling

- flow-error-handling: https://docs.n8n.io/flow-logic/error-handling/
- node-error-trigger: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/
- node-webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- node-webhook-common-issues: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/
- node-respond-to-webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/

## Expressions & data mapping

- expressions: https://docs.n8n.io/code/expressions/
- expressions-data-mapping: https://docs.n8n.io/data/data-mapping/data-mapping-expressions/
- expressions-common-issues: https://docs.n8n.io/code/cookbook/expressions/common-issues/
- code-node: https://docs.n8n.io/code/code-node/
- builtin-metadata: https://docs.n8n.io/code/builtin/n8n-metadata/

## Connecteurs

- slack: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
- gmail: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/
- google-drive: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/
- google-docs: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledocs/
- google-sheets: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
- google-calendar: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/
- monday: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom/
- openai: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/
- brevo: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.brevo/
- axonaut: https://docs.n8n.io/integrations/third-party/axonaut/


- docs/drive-slack-gmail-usecases-plan.md

# Use cases Drive ↔ Slack ↔ Gmail — Resume

Ce document est un resume fonctionnel des use cases cibles.
Il ne contient pas de plan d'execution. Le suivi se fait via le README principal.

## Use cases

- document.file.notify : recupere un document Drive, le resume et notifie sur Slack.
- document.request.email : repond a une requete avec un document Drive puis envoi Gmail.

## Capabilities requises

- document.file.fetch
- content.text.summarize
- notification.message.send
- human.validation.request (optionnel)

## Outils impliques

- google-drive
- slack
- gmail
- openai


- docs/archives/md-audit-2025-12-24.md

# Audit des nouveaux fichiers Markdown

Ce fichier recense les documents `.md` recemment ajoutes et resume les exigences
ou points d'attention qu'ils introduisent.

## docs/agent-runtime.md
- L'agent planifie uniquement : aucun appel direct aux tools ou a l'Executor.
- Les steps sont limites aux types `tool`, `capability` ou `usecase` avec `ref` et `params` obligatoires.
- L'agent doit toujours produire une Execution Envelope conforme aux schemas `contracts/envelope.schema.json` et `contracts/step.schema.json`.

Impact : nos definitions de capabilities et use cases restent conformes (suite de steps), mais il faut s'assurer que tout nouveau workflow agent respecte ces invariants lors des prochains ajouts.

## docs/executor-runtime.md
- L'Executor est deterministe, sans logique metier ni decisions ; il execute simplement les steps fournis.
- L'Executor ne doit pas appeler d'API directement ni persister de memoire en dehors de l'envelope.
- Les politiques `when`, `save` et `on_error` sont appliquees telles quelles.

Impact : les workflows executor existants devront etre verifies lors des mises a jour pour rester purement executionnels et stateless.

## docs/tools-runtime.md
- Un tool execute une seule operation API et retourne un `tool result` conforme a `contracts/tool-result.schema.json`.
- Aucun enchainement ou orchestration ne doit se trouver dans un tool.

Impact : lors de l'ajout ou la modification de tools (dans `config/tools/*.json` ou `workflows/tools/`), conserver ce caractere atomique.

## docs/triggers-runtime.md
- Les triggers convertissent les evenements externes en envelopes, sans decider du use case.
- Les envelopes de trigger doivent etre valides (legacy ou execution) avec les champs de header requis.

Impact : tout nouveau trigger doit rester stateless et se limiter a la normalisation du payload entrant.

## docs/utils-runtime.md
- Les utilitaires sont deterministes, sans effets de bord et sans I/O externe.
- Ils servent a transformer ou valider des donnees.

Impact : toute evolution dans `workflows/utils/` doit preserver l'absence d'appel API et de logique metier.

## docs/golden-workflows.md
- Les golden workflows sont les implementations de reference, exportables/importables dans n8n sans credentiels locaux.
- Ils doivent rester alignes avec les schemas et specs runtime.

Impact : lors de la creation de nouveaux golden workflows dans `workflows/golden/`, eviter toute dependance locale ou divergence avec `/contracts`.

## Readme specifiques par repertoire (workflows/*)
- Chaque README (agent, executor, tools, triggers, utils, golden) rappelle les regles de scope : pas de logique metier dans les tools, planification cote agent, execution deterministe cote executor, etc.

Impact : verifier chaque workflow ajoute dans ces repertoires contre les regles locales et les specs runtime correspondantes.


- docs/archives/status-auto.md

# Synthèse auto-générée depuis le dépôt

Cette note dresse l'inventaire des artefacts déjà présents dans le dépôt (sans input externe) et liste les informations manquantes pour finaliser le lancement.

## Workflows n8n

### Golden (`workflows/golden/`)
- 10_agent.json
- 20_tools.json
- 40_triggers.json
- 50_utils.json

### Agent (`workflows/agent/`)
- planner.workflow.json
- supervisor.workflow.json

### Executor (`workflows/executor/`)
- executor.workflow.json

### Tools (`workflows/tools/`)
- axonaut.workflow.json
- brevo.workflow.json
- gmail.workflow.json
- google-docs.workflow.json
- google-drive.workflow.json
- monday.workflow.json
- openai.workflow.json
- slack.workflow.json

### Triggers (`workflows/triggers/`)
- gmail.trigger.workflow.json
- manual.trigger.workflow.json
- schedule.trigger.workflow.json
- slack.trigger.workflow.json
- webhook.trigger.workflow.json

### Utils (`workflows/utils/`)
- Aucun workflow `.json` listé (README présent mais pas de fichiers).

## Configurations déclaratives (`config/`)

### Agent
- planning_rules.json
- system_prompt.md
- tool_selection.json

### Tools (`config/tools/`)
- axonaut.tool.json
- brevo.tool.json
- gmail.tool.json
- google-docs.tool.json
- google-drive.tool.json
- monday.tool.json
- openai.tool.json
- slack.tool.json

### Capabilities (`config/capabilities/`)
- classify_email.capability.json
- generate_document.capability.json
- notify_user.capability.json
- summarize_content.capability.json
- sync_crm_client.capability.json

### Use cases (`config/use-cases/`)
- generate_convention_formation.usecase.json
- incident_management.usecase.json
- lead_to_client.usecase.json
- onboarding_client.usecase.json

## Registries (`registries/`)
- tools.json (8 entrées référencées)
- capabilities.json (5 entrées)
- usecases.json (4 entrées)

## Documentation disponible (`docs/`)
- agent-runtime.md, executor-runtime.md, tools-runtime.md, triggers-runtime.md, utils-runtime.md
- golden-workflows.md (règles et périmètre des goldens)
- n8n-installation.md (guide d’installation)
- codex-plan.md (plan d’exécution)
- docs/archives/md-audit-2025-12-24.md

## Informations manquantes pour finaliser
- État de validation des goldens : quels workflows ont déjà été importés/testés dans n8n et avec quels résultats ?
- Écart éventuel entre registries et configs : faut-il régénérer les registries à partir des fichiers `config/` ou une source de vérité externe prévaut ?
- Scripts/commandes de QA attendus : quelles commandes AJV ou smoke tests doivent être exécutées (et sur quel scope) pour considérer la livraison prête ?
- Spécificités d’installation n8n : versions/credentials cibles, contraintes d’import/export, variables d’environnement à documenter.
- Priorités/échéances : ordre de traitement des catégories restantes et date cible de mise en prod.
- Status des utils : faut-il fournir des workflows utils ou bien sont-ils couverts ailleurs ?


- docs/workflow-node-audit.md

# Workflow Node Audit

Revue de coherence des nodes utilises dans les workflows n8n (tools, triggers, agent, executor, utils et goldens).
L'objectif est de verifier que chaque node correspond soit a un provider officiel declare, soit a un node core autorise.

## Commande

```bash
npm run validate:workflow-nodes
```

Cette commande s'appuie sur `scripts/validate_workflow_nodes.js` et echoue si :
- un workflow utilise un node hors providers officiels ou hors allowlist core ;
- un workflow tool reference une operation inexistante dans `registries/n8n-official-ops.json` ;
- un workflow tool ne possede pas de node d'action associe a son provider.

## Sources de verite

- `registries/n8n-official-ops.json` : providers, resources et operations autorises.
- `config/n8n-nodeType-map.json` : correspondances manuelles provider -> nodeType (si override necessaire).
- `docs/n8n/core-nodes.json` : allowlist des nodes core hors tools (triggers/agent/executor/utils/goldens).

## Output attendu

- Message de succes : `Workflow nodes are consistent with n8n official ops`.
- En cas d'erreur, la commande precise le fichier et le node incrimine pour correction.

## Quand l'executer

- Avant toute PR modifiant `workflows/*.json`.
- Lorsqu'un nouveau provider est ajoute aux registries.
- Quand la allowlist core (`docs/n8n/core-nodes.json`) change.



## Readme par repertoire

- contracts/README.md

# Contracts — Smart Office

Ce dossier contient les schemas JSON qui definissent les interfaces stables
du systeme. Ces schemas sont la source de verite pour la validation runtime.

## Fichiers

- capability.schema.json
- envelope.schema.json
- memory.schema.json
- result.schema.json
- step.schema.json
- agent-planning.schema.json
- agent-tool-selection.schema.json
- tool-call.schema.json
- tool-definition.schema.json
- workflow-agent.schema.json
- workflow-executor.schema.json
- workflow-golden.schema.json
- workflow-tool.schema.json
- workflow-trigger.schema.json
- workflow-utils.schema.json
- tool-input.schema.json
- tool-result.schema.json
- usecase.schema.json

## Validation

Utiliser scripts/validate_contracts_preload.js pour valider les exemples
dans formats/.


- config/README.md

README — Config (Smart Office)

But

Ce dossier contient les definitions declaratives : tools, capabilities, use cases.
Ces fichiers sont la source de verite fonctionnelle.

Sous-dossiers

- config/tools/ : definitions des tools et actions
- config/capabilities/ : sequences de steps reutilisables
- config/use-cases/ : scenarios metier
- config/agent/ : regles et prompts d'agent

Regles

- Les configs sont stables et versionnees
- Chaque fichier doit respecter son schema contractuel


- config/tools/README.md

README — Config Tools (Smart Office)

But

Definir les tools utilisables par l'executor et leurs actions attendues.

Schemas

- contracts/tool-definition.schema.json
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json

Contenu

Chaque tool definit :
- id, version, description
- categories (types fonctionnels)
- actions[].name (operation)
- actions[].input (cles attendues dans params)
- actions[].output (cle principale retournee)

Ces definitions alimentent :
- registries/tools.json

Catalogue :
- docs/tools-catalog.md


- config/capabilities/README.md

README — Config Capabilities (Smart Office)

But

Definir des sequences de steps reutilisables et atomiques.
Chaque capability declare ses inputs et outputs attendus.

Schema

- contracts/capability.schema.json

Contenu

- inputs : champs requis (input/context/memory) — obligatoire
- outputs : champs produits (memory) — obligatoire
- steps : liste ordonnee de steps (avec `params` obligatoire, meme vide)

Ces definitions alimentent :
- registries/capabilities.json

Convention de nommage :
- `domain.resource.action`
- Exemple : `email.message.fetch`


- config/use-cases/README.md

README — Config Use cases (Smart Office)

But

Definir des scenarios metier composes de capabilities et d'autres use cases.
Chaque use case declare ses inputs et outputs attendus.

Schema

- contracts/usecase.schema.json

Contenu

- inputs : champs requis (input/context/memory)
- outputs : champs produits (memory)
- steps : liste ordonnee de steps (avec `params` obligatoire, meme vide)

Ces definitions alimentent :
- registries/usecases.json

Convention de nommage :
- `domain.resource.action`
- Exemple : `briefing.daily.generate`


- config/agent/README.md

README — Config Agent (Smart Office)

But

Regles et prompts utilises par l'agent pour planifier.

Fichiers

- system_prompt.md : prompt de base
- planning_rules.json : regles de planification (limites, types autorises, boucle de clarification)
  - Contract: contracts/agent-planning.schema.json
- tool_selection.json : selection des tools
  - Contract: contracts/agent-tool-selection.schema.json


- registries/README.md

# README — Registries (Smart Office)

## But

Les registries sont des catalogues compilés à partir des docs locales et des configs. Ils servent de source unique pour l'executor, les capacités et la génération des workflows.

## Fichiers

- `registries/n8n-official-ops.json` : opérations officielles par provider n8n (assemblées depuis `registries/n8n-official-ops/*.json`).
- `registries/tool-categories.json` : mapping catégories -> providers/operations (dérivé de la registry officielle et de `config/provider-category.map.json`).
- `registries/capabilities.json` : capacités atomiques couvrant 100% des opérations officielles.
- `registries/tools.json` : registre des outils aligné sur les opérations officielles (nodeType, catégorie, actions, capacités).
- `registries/usecases.json` : catalogue des usecases (inchangé).

## Fragments n8n-official-ops

- Chaque provider est décrit dans un fragment JSON individuel dans `registries/n8n-official-ops/<provider>.json`.
- Les overrides optionnels sont placés dans `registries/n8n-official-ops/_overrides/` et doivent rester minimaux.
- Le script `node scripts/build_n8n_official_ops.js` assemble tous les fragments en un fichier global `registries/n8n-official-ops.json` (validation schema + cohérences params/returns).

## Pipeline outils

1. Docs locales (`docs/n8n/raw`, avec bloc JSON) -> `validate_n8n_docs.js` puis `parse_n8n_docs.js`.
2. Fragments + overrides -> `generate_n8n_official_ops_fragments.js` -> `build_n8n_official_ops.js`.
3. Catégories (`generate_tool_categories.js`) puis capacités (`generate_capabilities.js`).
4. Registry outils (`generate_tools_registry.js`).
5. Workflows outils (`generate_tool_workflows.js`).

Exécuter `npm run build:tools` pour enchaîner l'ensemble de la pipeline.
Pour mettre a jour les sources n8n, utiliser `./scripts/fetch_n8n_docs.sh`.


- formats/README.md

README — Formats (Smart Office)

But

Exemples de donnees valides pour les schemas de contracts/.
Utilises par le validateur AJV.

Fichiers

- capability.json
- envelope.json
- memory.json
- result.json
- step.json
- tool-call.json
- tool-input.json
- tool-result.json
- tool-definition.json
- usecase.json
- agent-planning.json
- agent-tool-selection.json


- scripts/README.md

# README — Scripts (Smart Office)

Outils internes pour valider et maintenir les contrats, configs et workflows.

## Scripts

- `fetch_n8n_docs.sh` : telecharge les pages n8n en HTML (`docs/n8n/html`), genere une version lisible (`docs/n8n/human`) et met a jour `docs/n8n/sources.md`. Option `--rebuild-raw` regenere les raw JSON depuis les fragments, `--build` lance la pipeline complete.
- `validate_n8n_docs.js` : vérifie la présence et la structure minimale des docs n8n locales (`docs/n8n/raw`).
- `parse_n8n_docs.js` : extrait les opérations officielles depuis les docs locales (JSON embarqué) et prépare un artefact temporaire.
- `generate_n8n_official_ops_fragments.js` : fusionne la sortie du parseur et les overrides pour alimenter les fragments `registries/n8n-official-ops/*.json`.
- `validate_n8n_official_ops_fragments.js` : valide fragments et overrides via schémas AJV.
- `build_n8n_official_ops.js` : assemble les fragments `registries/n8n-official-ops/*.json` en registry globale déterministe.
- `validate_n8n_official_ops.js` : reconstruit et valide la registry globale.
- `generate_tool_categories.js` / `validate_tool_categories.js` : dérivent les catégories des outils depuis les opérations officielles et la cartographie provider -> catégorie.
- `generate_capabilities.js` / `validate_capabilities.js` : dérivent les capacités atomiques couvrant 100% des opérations officielles.
- `generate_tools_registry.js` : aligne la registry des outils (nodeType, catégorie, actions, capacités) sur les opérations officielles.
- `generate_tool_workflows.js` : génère un workflow par provider en couvrant toutes les actions déclarées.
- `generate_golden_workflows.js` : normalise les workflows golden (formatage JSON) avant validation.
- `generate_agent_workflows.js` : génère les workflows `planner` et `supervisor` de l'agent.
- `generate_workflows.sh` : génère les workflows tools puis lance `validate_workflows.js` et `validate_workflow_nodes.js`.
- `validate_all.sh` : pipeline globale (docs n8n, contrats, config, registries, generation goldens/agent/tools, workflows, liens MD, audit/clean).
- `validate_cross_refs.js` : contrôle les références entre configs, registries et n8n-official-ops.
- `validate_workflow_nodes.js` : vérifie que les nodes des workflows pointent vers des operations n8n officielles ou des nodes core autorisés (`docs/n8n/core-nodes.json`).
- `validate_agent_workflows.js` : valide les workflows d'agent avec `contracts/workflow-agent.schema.json`.
- `smoke_build_tools.js` : lance la pipeline `build:tools` et vérifie la présence des artefacts clés.
- `migrate_tool_workflows.js` : remplace Switch/Set par Code dans les workflows tools sans perdre les nodes provider.
- `migrate_executor_workflow.js` : remplace les Switch de l'executor par des nodes Code et normalise le dispatch.
- Onboarding mappings : voir `docs/.codex/PLAN_MAPPING_ONBOARDING.md` et `docs/.codex/STATE_MAPPING_ONBOARDING.json`.
- `mapping_lint.js` : lint d'un mapping YAML et validation optionnelle sur un payload d'exemple via le moteur `engine/mapping`.


- workflows/agent/README.md

README — Workflows Agent (Smart Office)

But

Les workflows agent implementent la couche de decision et de planification.
Ils traduisent une intention en une liste ordonnee de steps pour l'executor.

Spec de reference : docs/agent-runtime.md

Workflows

- planner.workflow.json (`so.agent.planner`)
  Construit un plan d'execution (steps) a partir d'un contexte et ajoute un step de clarification si les inputs sont incomplets.
  Nodes :
  - Agent Trigger — Manual Trigger (`n8n-nodes-base.manualTrigger`) : point d'entree sans input attendu ; emet un item vide ou l'event manuel.
  - Build Execution Envelope — Code (`n8n-nodes-base.code`) : attend `header` et `payload` (dont `payload.memory.state.context_complete` et `payload.steps`) ; retourne une enveloppe d'execution complete avec header, steps (clarification ou slack) et memoire.

- supervisor.workflow.json (`so.agent.supervisor`)
  Supervise ou ajuste le plan avant execution; injecte une clarification si le plan manque des prerequis.
  Nodes :
  - Agent Trigger — Manual Trigger (`n8n-nodes-base.manualTrigger`) : point d'entree pour tester le workflow ; forward l'item tel quel.
  - Build Execution Envelope — Code (`n8n-nodes-base.code`) : attend `header`, `payload.steps` et `payload.memory.state.context_complete`; preprend ou ajoute une capability `human.validation.request` si besoin et renvoie une enveloppe d'execution normalisee.

Regles

- L'agent ne declenche aucun tool directement.
- L'agent doit produire une execution envelope valide.
- Les decisions restent dans l'agent, jamais dans l'executor.
- Les boucles de clarification/human validation renvoient vers l'agent avant toute execution.

Regle de nommage

- Convention : `so.<layer>.<name>`


- workflows/executor/README.md

README — Workflow Executor (Smart Office)

But

L'Executor est le moteur d'execution de Smart Office.
Il execute des plans declaratifs (steps) produits par l'agent ou un trigger.

Spec de reference : docs/executor-runtime.md

Position dans l'architecture

Trigger / Agent
↓
Executor
↓
Tools

Il n'existe qu'un seul executor.
Fichier : workflows/executor/executor.workflow.json (`so.executor.core`)

Ce que l'executor fait

- Recoit une envelope (legacy ou execution)
- Normalise en execution envelope
- Execute les steps sequentiellement
- Resolves chaque step par type : tool, capability, usecase
- Propage la memoire a chaque step
- Produit un Result final

Ce que l'executor ne fait pas

- Ne decide pas quel use case lancer
- Ne genere pas de steps
- N'embarque pas de logique metier
- N'appelle pas d'API directement
- Ne persiste pas de donnees hors memoire fournie

Types de steps supportes

Tool step

{ "type": "tool", "ref": "slack", "params": { "channel": "#ops", "text": "Bonjour" } }

Comportement :
- Resout la definition du tool dans le registry
- Utilise provider et operation pour router l'execution
- Execute le tool
- Gere resultats, save, on_error

Capability step

{ "type": "capability", "ref": "cap.slack.notify.v1" }

Comportement :
- Charge la capability
- Injecte ses steps
- Continue l'execution

Use case step

{ "type": "usecase", "ref": "uc.training.convention.v1" }

Comportement :
- Charge le use case
- Injecte ses steps
- Continue l'execution

Conditions (when)

Les steps peuvent definir un when (string ou predicat).
L'executor evalue la condition et saute le step si faux.

Sauvegarde (save)

Les steps peuvent definir save pour copier des valeurs
dans memory.state a partir du resultat.

Gestion d'erreur (on_error)

Modes supportes : stop (defaut), continue, fallback.

Resultat

L'executor produit un Result a la fin :

{ "success": true, "data": null, "error": null, "meta": {} }

Lecture / ecriture d'enveloppe

- Lecture:
  - legacy: lit `context.memory` + `input.steps` puis reconstruit un state d'execution.
  - execution: lit `header`, `payload.steps`, `payload.memory`, `payload.registryFiles`, `payload.options`.
- Ecriture:
  - renvoie `{ header, output, error }` ou `error` est nul en cas de succes.
  - `output` contient `results` et `memory` (plus `trace`/`debug` si `options.debug`).
  - Pour un strict execution envelope, prevoir un adaptateur qui copie `output` dans `payload.result`.

Invariants

- Respect des schemas JSON
- Ordre d'execution respecte
- Determinisme
- Stateless hors envelope

Notes d'implementation (n8n)

- Implementé en un workflow n8n unique
- Orchestration via nodes de type Code / Function
- Appel des tools via Execute Workflow
- Catalogue tools : registries/tools.json (actions et params attendus)

Detail des nodes

- Executor Trigger — Webhook (`n8n-nodes-base.webhook`) : recoit une enveloppe (legacy ou execution) en HTTP; propage le body vers la suite.
- Normalize Envelope — Code (`n8n-nodes-base.code`) : attend `header`, `payload` ou `input` selon le format; construit un state interne avec `steps`, `memory`, `options`, `registryFiles` et curseur normalisé.
- Parse JSON Safe — Code (`n8n-nodes-base.code`) : parse en JSON les champs stringifies (`steps`, `memory`, `options`, `params` des steps) et remonte `error` si un parse echoue.
- Validate Contracts — Code (`n8n-nodes-base.code`) : verifie que `steps` est un tableau non vide et que chaque step a `type`, `ref` et `params` valides; remplit `error` sinon.
- Has Error? (Init) — If (`n8n-nodes-base.if`) : route vers la fin erreur si `error` est non null apres l'init.
- Load Registry — Code (`n8n-nodes-base.code`) : attend `registryFiles` ou `options.fallbackRegistry`; construit `registry` (tools, capabilities, usecases) et `registryHash`, ou positionne `error` si vide.
- Has Error? (Registry) — If (`n8n-nodes-base.if`) : interrompt le flux si le chargement registry a echoue.
- Has Next Step? — If (`n8n-nodes-base.if`) : verifie l'existence d'un step a l'index courant; si non, construit l'output final.
- Execution Guards — Code (`n8n-nodes-base.code`) : incremente `options.stepCount`, controle `maxSteps`/`maxDepth`, dectecte la repetition de step et ecrit `error` en cas de depassement.
- Has Error? (Guards) — If (`n8n-nodes-base.if`) : deroute vers sortie erreur si un guard a echoue.
- Resolve Step — Code (`n8n-nodes-base.code`) : attend le step courant; selon `type`, resolve tool/provider/operation, ou injecte les steps d'une capability/usecase depuis le registry, ou positionne `error`.
- Has Error? (Resolve) — If (`n8n-nodes-base.if`) : stoppe si la resolution a echoue.
- Dispatch Step Type — Code (`n8n-nodes-base.code`) : oriente vers le run tool ou les branches capability/usecase (deja expansees) selon `currentStep.type`.
- Dispatch Tool Provider — Code (`n8n-nodes-base.code`) : oriente vers l'execution tool selon `currentStep.tool.provider` (mock dans l'implementation actuelle).
- Execute Tool — Code (`n8n-nodes-base.code`) : construit `toolInput` (runId, stepId, tool, params, context.memory), renvoie `toolResult` (mock ou erreur TOOL_NOT_IMPLEMENTED), stocke `toolInput`/`toolResult`.
- Append Step Result — Code (`n8n-nodes-base.code`) : ajoute une entree dans `results`, sauvegarde `memory[saveAs]` si demande et `ok`, et avance le curseur; positionne `error` si le tool a echoue.
- Has Error? (Append) — If (`n8n-nodes-base.if`) : deroute vers Build Error Envelope en cas d'echec d'etape.
- Build Output Envelope — Code (`n8n-nodes-base.code`) : produit `{ header, output, error:null }` avec `results`, `memory`, `trace`/`debug` si `options.debug`.
- Build Error Envelope — Code (`n8n-nodes-base.code`) : produit `{ header, output, error }` en reprenant l'etat et les traces.

Regle de nommage

- Convention : `so.<layer>.<name>`

Hors scope

- Policies complexes
- Permissions
- Learning
- Optimisation
- Parallelisation
- Observabilite


- workflows/tools/README.md

README — Workflows Tools (Smart Office)

But

Les tools implementent des actions atomiques liees a des APIs.
Chaque tool execute une operation unique et renvoie un resultat structure.

Spec de reference : docs/tools-runtime.md
Schemas :
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json
Catalogue :
- config/tools/*.tool.json
- registries/tools.json
- registries/n8n-official-ops.json

Workflows

- 1 workflow par provider (workflows/tools/<provider>.workflow.json)
- Nommage n8n recommande : `so.tool.<provider>`
- Routage par node Code couvrant toutes les actions declarees
- Chaque branche renvoie un "tool-result" minimal
- Les operations doivent exister dans n8n-official-ops

I/O contract

- Input attendu (cote tool) : `toolInput` conforme a `contracts/tool-input.schema.json`.
- Normalisation recommande :
  - `tool.operation` -> `operation`
  - `tool.provider` -> `provider`
  - `params` -> `params`
- Output obligatoire : `toolResult` conforme a `contracts/tool-result.schema.json`.
- L'Executor consomme `toolResult` et alimente `output.results[]` + `memory.state` si `save` est defini.

Nodes (par workflow)

- axonaut.workflow.json (`n8n-nodes-base.axonaut`)
  - Manual Trigger — Manual Trigger : point d'entree de test.
  - Normalize Input — Code : reduit l'item a `provider`, `operation`, `params` venant de l'input.
  - Dispatch Operation — Code : route sur `operation` (company.update, contact.create, sampleFetch).
  - company.update — Axonaut : attend `params.companyId` et champs de mise a jour; renvoie la reponse API Axonaut.
  - contact.create — Axonaut : attend `params.companyId` et donnees de contact; renvoie l'objet contact cree.
  - sampleFetch — Set : renvoie un exemple statique (outil de test) avec `ok`, `data`.

- brevo.workflow.json (`n8n-nodes-base.brevo`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques a ci-dessus.
  - campaign.createCampaign — Brevo : attend `params.name`, `type`, `subject`, `sender`... selon node Brevo; produit les metadonnees de campagne.
  - email.sendEmail — Brevo : attend `params.sender`, `params.to`, `params.subject`, `params.htmlContent` ; renvoie la reponse d'envoi.
  - sampleFetch — Set : payload de demonstration.

- gmail.workflow.json (`n8n-nodes-base.gmail`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - message.get — Gmail : attend `params.messageId`; renvoie le message.
  - message.getMany — Gmail : attend filtres dans `params` (userId, query...); renvoie une liste.
  - message.send — Gmail : attend `params.to`, `params.subject`, `params.body`/`params.raw` ; renvoie l'id d'envoi.
  - sampleFetch — Gmail : utilise `operation: sampleFetch` pour lire un message d'exemple.

- google-calendar.workflow.json (`n8n-nodes-base.googleCalendar`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - event.create — Google Calendar : attend `params.title`, `params.start`, `params.end`, `params.calendar` et optionnellement `params.attendees`/`params.description`; renvoie l'event cree.
  - event.getMany — Google Calendar : attend `params.calendar` et les filtres `params.timeMin`, `params.timeMax`, `params.limit`; renvoie les events du calendrier cible.
  - sampleFetch — Google Calendar : recupere un event exemple.

- google-docs.workflow.json (`n8n-nodes-base.googleDocs`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - document.create — Google Docs : attend `params.title`; renvoie le doc cree.
  - document.get — Google Docs : attend `params.documentId`; renvoie le contenu.
  - document.update — Google Docs : attend `params.documentId` et optionnellement `params.requests`/`params.html`/`params.text`; renvoie la reponse update.
  - sampleFetch — Google Docs : recupere un doc exemple.

- google-drive.workflow.json (`n8n-nodes-base.googleDrive`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - file.download — Google Drive : attend `params.fileId` et optionnellement `params.binaryPropertyName` (defaut `data`); renvoie le fichier en binaire ou metadata.
  - file.get — Google Drive : attend `params.fileId`; renvoie les metadonnees.
  - file.upload — Google Drive : attend `params.folderId`, `params.name`, `params.binary` (defaut `data`) et `params.mimeType`; renvoie le fichier cree.
  - fileFolder.search — Google Drive : attend `params.query` avec `params.returnAll`/`params.limit` optionnels; renvoie la liste.
  - folder.create — Google Drive : attend `params.parentFolderId` et `params.name`; renvoie le dossier.
  - sampleFetch — Google Drive : exemple de resultat.

- google-sheets.workflow.json (`n8n-nodes-base.googleSheets`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - sheet.append — Google Sheets : attend `params.spreadsheetId`, `params.range`, `params.values` et optionnellement `params.valueInputMode` ; renvoie la plage ecrite.
  - sheet.read — Google Sheets : attend `params.spreadsheetId`, `params.range` ; renvoie les lignes.
  - sheet.update — Google Sheets : attend `params.spreadsheetId`, `params.range`, `params.values` et eventuellement `params.valueInputMode`; renvoie la plage mise a jour.
  - spreadsheet.create — Google Sheets : attend `params.title` et eventuellement feuilles; renvoie l'id du classeur.
  - sampleFetch — Google Sheets : lecture de test.

- monday.workflow.json (`n8n-nodes-base.mondayCom`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - boardItem.addUpdate — Monday.com : attend `params.boardId`, `params.itemId`, `params.body`; renvoie la mise a jour.
  - boardItem.create — Monday.com : attend `params.boardId`, `params.groupId`, `params.itemName`, `params.columnValues`; renvoie l'item cree.
  - boardItem.get — Monday.com : attend `params.boardId`, `params.itemId`; renvoie l'item.
  - boardItem.getMany — Monday.com : attend `params.boardId` et filtres; renvoie la liste.
  - boardItem.updateColumnValues — Monday.com : attend `params.boardId`, `params.itemId`, `params.columnValues`; renvoie l'item.
  - sampleFetch — Monday.com : jeu de donnees exemple.

- openai.workflow.json (`n8n-nodes-langchain.lmchatopenai` + Code)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - assistant.classify — LangChain ChatOpenAI : attend `params.prompt`/`params.messages`, `params.model`, `params.temperature`; renvoie `data.response` avec la classification.
  - assistant.extract — LangChain ChatOpenAI : attend `params.prompt`/`params.schema`; renvoie les champs extraits.
  - assistant.summarize — LangChain ChatOpenAI : attend `params.prompt`/`params.context`; renvoie un resume texte.
  - sampleFetch — Set : resultat de demonstration.

- slack.workflow.json (`n8n-nodes-base.slack`)
  - Manual Trigger / Normalize Input / Dispatch Operation identiques.
  - conversation.getMany — Slack : attend `params.types` et filtres de pagination; renvoie les conversations.
  - file.get — Slack : attend `params.fileId`; renvoie le fichier.
  - file.getMany — Slack : attend filtres (channel, user...); renvoie les fichiers.
  - file.upload — Slack : attend `params.channel`, `params.binaryProperty`, `params.filename`; renvoie le fichier uploade.
  - message.delete — Slack : attend `params.channel`, `params.ts`; renvoie l'etat de suppression.
  - message.getPermalink — Slack : attend `params.channel`, `params.ts`; renvoie le permalink.
  - message.search — Slack : attend `params.query`; renvoie les messages trouves.
  - message.send — Slack : attend `params.channel`, `params.text`, `params.blocks`/`params.attachments`/`params.threadTs`; renvoie le message envoye.
  - sampleFetch — Slack : lecture d'un message exemple.

Utilisation des utils

- Normalisation des params d'entree
- Validation du tool-input et du tool-result
- Mapping uniforme des erreurs

Regle de nommage

- Convention : `so.<layer>.<name>`

Gaps vs doc officielle / plan d'actions

- Google Calendar : workflows acceptent `params.calendar` pour cibler explicitement un calendrier dans `event.create`, `event.getMany` et `sampleFetch`.
- Google Drive : les appels doivent utiliser `folderId`/`name`/`binary` et `mimeType`, avec `binaryPropertyName` par defaut `data` pour les downloads; les workflows sont alignes.
- Google Sheets : les workflows attendent `values` + `valueInputMode` et non `data`. Adapter les steps agents/executor pour envoyer `values` (tableau) et optionnellement `valueInputMode`.


- workflows/triggers/README.md
- workflows/golden/README.md

### Checklist rapide lors d'une mise a jour d'un README

- Verifier que la liste des workflows mentionnes correspond aux fichiers presents dans le dossier.
- Pointer vers la spec runtime associee (docs/*.md) pour garder un lien clair entre theorie et implementation.
- Rappeler les schemas contracts/ pertinents pour eviter les divergences d'I/O.
- Reconfirmer les regles de scope (ce que le dossier fait et ne fait pas) pour limiter la derive fonctionnelle.

## Architecture du repertoire

- contracts/ : schemas JSON de reference
- docs/ : specifications runtime et regles non negociables
- formats/ : exemples de donnees valides pour les schemas
- workflows/
  - agent/ : planification et supervision
  - executor/ : moteur d'execution
  - tools/ : actions atomiques
  - triggers/ : entrees systeme
  - utils/ : utilitaires sans effets de bord
  - golden/ : implementations de reference
- registries/ : definitions de tools, capabilities, use cases
- scripts/ : utilitaires d'automatisation (validation, etc.)

## Validation des schemas

Pour valider les schemas JSON localement, certains outils (ex: ajv-cli)
ont besoin du plugin ajv-formats pour reconnaitre les formats standards
(date, date-time, etc.). Si vous obtenez un avertissement unknown format,
installez et utilisez ajv-formats ou validez via un petit script Node.

- Installer (globalement) :

```bash
npm install -g ajv-cli ajv-formats
```

- Exemple rapide (Node) :

```bash
node -e "const Ajv=require('ajv'); const addFormats=require('ajv-formats'); const ajv=new Ajv({allErrors:true}); addFormats(ajv); const s=require('./contracts/envelope.schema.json'); const d=require('./formats/envelope.json'); console.log(ajv.validate(s,d)?'valid':JSON.stringify(ajv.errors,null,2));"
```

## Prechargement et resolution des $ref

Les schemas dans contracts/ utilisent des $id (parfois des URI) pour permettre
les references croisees robustes. Lors de la validation avec Ajv :

- Ajv doit connaitre les formats (installer ajv-formats)
- Si un $ref pointe vers une URI, Ajv la resolvra seulement si le schema
  correspondant est precharge (ajv.addSchema)

Un script utilitaire existe : scripts/validate_contracts_preload.js.
Il precharge tous les schemas contracts/*.schema.json puis valide
les fichiers formats/*.json non vides.

Execution rapide :

```bash
# installer localement les dependances (si necessaire)
npm install --prefix . ajv@8 ajv-formats --save-dev

# lancer le validateur qui precharge les schemas
NODE_PATH=./node_modules node scripts/validate_contracts_preload.js
```

## Procedure de revalidation complete

Script tout-en-un :

```bash
bash scripts/validate_all.sh
```

Ce script :
- fait un audit (fichiers non references, doublons, utils non appeles, JSON invalides)
- propose un clean avec confirmation
- met a jour le repo
- regenere la doc n8n locale
- valide les schemas/formats
- valide les configs et cross-refs
- valide les workflows (structure + nodes)

## Procedure de mise a jour de la doc

```bash
bash scripts/update_docs.sh
```

Ce script :
- lance la revalidation complete (sans clean interactif)
- regenere l'index des docs dans `docs/docs-index.md`

## Scripts principaux

- `scripts/validate_all.sh` : revalidation complete + audit + verification des liens markdown.
- `scripts/update_docs.sh` : revalidation + regeneration de l'index docs (option `--majdoc` pour fetch n8n).
- `scripts/fetch_n8n_docs.sh` : telecharge la doc n8n (connecteurs + workflows + core nodes).
- `scripts/validate_n8n_official_ops_fragments.js` : valide les fragments et overrides n8n avant build.
- `scripts/linkify_md_refs.js` : rend cliquables les references `.md` dans la doc.
