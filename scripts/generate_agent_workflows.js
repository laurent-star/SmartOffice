const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '..', 'workflows', 'agent');

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildPlannerWorkflow() {
  return {
    name: 'so.agent.planner',
    nodes: [
      {
        id: 'node-trigger',
        name: 'Agent Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [200, 300]
      },
      {
        id: 'node-build-plan',
        name: 'Build Execution Envelope',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [420, 300],
        parameters: {
          language: 'JavaScript',
          mode: 'runOnceForAllItems',
          jsCode:
            "const input = items[0].json ?? {};\n" +
            "const now = new Date().toISOString();\n\n" +
            "const payload = input.payload ?? {};\n" +
            "const memory = {\n" +
            "  session_id: payload.memory?.session_id ?? `sess_${Date.now()}`,\n" +
            "  state: { ...(payload.memory?.state ?? {}) },\n" +
            "  stack: Array.isArray(payload.memory?.stack) ? payload.memory.stack : []\n" +
            "};\n\n" +
            "const normalizeStep = (step) => ({\n" +
            "  type: step.type ?? 'capability',\n" +
            "  ref: step.ref ?? 'human.validation.request',\n" +
            "  params: typeof step.params === 'object' && step.params !== null ? step.params : {}\n" +
            "});\n\n" +
            "let steps = Array.isArray(payload.steps) ? payload.steps.map(normalizeStep) : [];\n" +
            "const contextComplete = Boolean(memory.state?.context_complete);\n\n" +
            "if (!contextComplete) {\n" +
            "  steps.unshift({\n" +
            "    type: 'capability',\n" +
            "    ref: 'human.validation.request',\n" +
            "    params: {\n" +
            "      message: 'Compléter les informations manquantes avant planification.',\n" +
            "      destination: 'agent',\n" +
            "      reason: 'missing_context'\n" +
            "    }\n" +
            "  });\n" +
            "}\n\n" +
            "if (steps.length === 0) {\n" +
            "  steps.push({\n" +
            "    type: 'capability',\n" +
            "    ref: 'human.validation.request',\n" +
            "    params: {\n" +
            "      message: 'Plan vide : merci de préciser les actions attendues.',\n" +
            "      destination: 'agent',\n" +
            "      reason: 'missing_plan'\n" +
            "    }\n" +
            "  });\n" +
            "}\n\n" +
            "const header = {\n" +
            "  id: input.header?.id ?? `env-${Date.now()}`,\n" +
            "  version: input.header?.version ?? '1.0',\n" +
            "  timestamp: input.header?.timestamp ?? now,\n" +
            "  source: input.header?.source ?? 'agent.planner',\n" +
            "  destination: steps[0]?.params?.destination === 'agent' ? 'agent' : (input.header?.destination ?? 'executor'),\n" +
            "  type: input.header?.type ?? 'execution'\n" +
            "};\n\n" +
            "const envelope = {\n" +
            "  header,\n" +
            "  payload: { ...payload, steps, memory }\n" +
            "};\n\n" +
            "return [{ json: envelope }];"
        }
      }
    ],
    connections: {
      'Agent Trigger': {
        main: [[{ node: 'Build Execution Envelope', type: 'main', index: 0 }]]
      }
    },
    active: false,
    settings: {
      executionOrder: 'v1'
    }
  };
}

function buildSupervisorWorkflow() {
  return {
    name: 'so.agent.supervisor',
    nodes: [
      {
        id: 'node-trigger',
        name: 'Agent Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [200, 300]
      },
      {
        id: 'node-supervise',
        name: 'Build Execution Envelope',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [420, 300],
        parameters: {
          language: 'JavaScript',
          mode: 'runOnceForAllItems',
          jsCode:
            "const input = items[0].json ?? {};\n" +
            "const now = new Date().toISOString();\n\n" +
            "const payload = input.payload ?? {};\n" +
            "const memory = {\n" +
            "  session_id: payload.memory?.session_id ?? `sess_${Date.now()}`,\n" +
            "  state: { ...(payload.memory?.state ?? {}) },\n" +
            "  stack: Array.isArray(payload.memory?.stack) ? payload.memory.stack : []\n" +
            "};\n\n" +
            "const normalizeStep = (step) => ({\n" +
            "  type: step.type ?? 'capability',\n" +
            "  ref: step.ref ?? 'human.validation.request',\n" +
            "  params: typeof step.params === 'object' && step.params !== null ? step.params : {}\n" +
            "});\n\n" +
            "let steps = Array.isArray(payload.steps) ? payload.steps.map(normalizeStep) : [];\n" +
            "const needsClarification = !memory.state?.context_complete;\n\n" +
            "if (needsClarification) {\n" +
            "  steps.unshift({\n" +
            "    type: 'capability',\n" +
            "    ref: 'human.validation.request',\n" +
            "    params: {\n" +
            "      message: 'Plan incomplet : collecter les informations manquantes.',\n" +
            "      destination: 'agent',\n" +
            "      reason: 'missing_context'\n" +
            "    }\n" +
            "  });\n" +
            "}\n\n" +
            "if (steps.length === 0) {\n" +
            "  steps.push({\n" +
            "    type: 'capability',\n" +
            "    ref: 'human.validation.request',\n" +
            "    params: {\n" +
            "      message: 'Aucun step défini : demander les instructions manquantes.',\n" +
            "      destination: 'agent',\n" +
            "      reason: 'no_plan'\n" +
            "    }\n" +
            "  });\n" +
            "}\n\n" +
            "const header = {\n" +
            "  id: input.header?.id ?? `env-${Date.now()}`,\n" +
            "  version: input.header?.version ?? '1.0',\n" +
            "  timestamp: input.header?.timestamp ?? now,\n" +
            "  source: input.header?.source ?? 'agent.supervisor',\n" +
            "  destination: steps[0]?.params?.destination === 'agent' ? 'agent' : (input.header?.destination ?? 'executor'),\n" +
            "  type: input.header?.type ?? 'execution'\n" +
            "};\n\n" +
            "const envelope = {\n" +
            "  header,\n" +
            "  payload: { ...payload, steps, memory }\n" +
            "};\n\n" +
            "return [{ json: envelope }];"
        }
      }
    ],
    connections: {
      'Agent Trigger': {
        main: [[{ node: 'Build Execution Envelope', type: 'main', index: 0 }]]
      }
    },
    active: false,
    settings: {
      executionOrder: 'v1'
    }
  };
}

function main() {
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  saveJson(path.join(workflowsDir, 'planner.workflow.json'), buildPlannerWorkflow());
  saveJson(path.join(workflowsDir, 'supervisor.workflow.json'), buildSupervisorWorkflow());

  console.log('Generated agent workflows (planner + supervisor)');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
