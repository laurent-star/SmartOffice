README — Workflow Executor (Smart Office)

But

L'Executor est le moteur d'execution de Smart Office.
Il execute des plans declaratifs (steps) produits par l'agent ou un trigger.

Spec de reference : [docs/executor-runtime.md](docs/executor-runtime.md)

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
- Switch Step Type — Switch (`n8n-nodes-base.switch`) : oriente vers le run tool ou les branches capability/usecase (deja expansees) selon `currentStep.type`.
- Switch Tool Provider — Switch (`n8n-nodes-base.switch`) : oriente vers l'execution tool selon `currentStep.tool.provider` (mock dans l'implementation actuelle).
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
