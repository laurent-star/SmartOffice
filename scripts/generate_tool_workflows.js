const fs = require("fs");
const path = require("path");
const { buildN8nOfficialOps } = require("./build_n8n_official_ops");

const toolsDir = path.join(__dirname, "..", "config", "tools");
const workflowsDir = path.join(__dirname, "..", "workflows", "tools");
const opsPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureOfficialOps() {
  try {
    buildN8nOfficialOps({ quiet: true });
  } catch (err) {
    console.error("Unable to build n8n-official-ops registry:");
    console.error(err.message);
    process.exit(1);
  }
}

function buildAllowedOperations(ops) {
  const map = {};
  for (const [provider, def] of Object.entries(ops.providers || {})) {
    const allowed = new Set();
    for (const [resource, resourceDef] of Object.entries(def.resources || {})) {
      for (const opName of Object.keys(resourceDef.operations || {})) {
        allowed.add(`${resource}.${opName}`);
      }
    }
    map[provider] = { nodeType: def.nodeType, operations: allowed };
  }
  return map;
}

function buildWorkflow(tool, nodeType) {
  const actions = (tool.actions || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const rules = actions.map((action) => ({ operation: "equal", value: action.name }));
  const nodes = [
    {
      id: "node-trigger",
      name: "Manual Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [200, 300]
    },
    {
      id: "node-normalize",
      name: "Normalize Input",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [420, 300],
      parameters: {
        functionCode: `const input = items[0].json || {};\nconst params = input.params || {};\nconst tool = input.tool || {};\nconst normalized = {\n  runId: input.runId || 'run-id',\n  stepId: input.stepId || 'step',\n  tool: {\n    ref: tool.ref || '${tool.id}',\n    provider: '${tool.id}',\n    operation: tool.operation || params.operation || ''\n  },\n  params,\n  context: input.context || {}\n};\nreturn [{ json: normalized }];`
      }
    },
    {
      id: "node-switch",
      name: "Dispatch Operation",
      type: "n8n-nodes-base.switch",
      typeVersion: 1,
      position: [660, 300],
      parameters: {
        propertyName: "={{$json.tool.operation}}",
        dataType: "string",
        rules,
        outputData: "inputData"
      }
    }
  ];

  const connections = {
    "Manual Trigger": { main: [[{ node: "Normalize Input", type: "main", index: 0 }]] },
    "Normalize Input": { main: [[{ node: "Dispatch Operation", type: "main", index: 0 }]] },
    "Dispatch Operation": { main: [] }
  };

  actions.forEach((action, idx) => {
    const actionName = action.name;
    const [resource, operation] = actionName.split(".");
    const parameters = { resource, operation };

    for (const param of action.input || []) {
      parameters[param] = `={{$json.params.${param}}}`;
    }

    const nodeId = `node-action-${idx + 1}`;
    nodes.push({
      id: nodeId,
      name: `Action ${actionName}`,
      type: nodeType,
      typeVersion: 1,
      position: [900, 200 + idx * 120],
      parameters
    });
    if (!connections["Dispatch Operation"].main[idx]) {
      connections["Dispatch Operation"].main[idx] = [];
    }
    connections["Dispatch Operation"].main[idx].push({ node: `Action ${actionName}`, type: "main", index: 0 });
  });

  return {
    name: `tool-${tool.id}`,
    nodes,
    connections,
    active: false,
    settings: { executionOrder: "v1" }
  };
}

function main() {
  ensureOfficialOps();

  const ops = loadJson(opsPath);
  const allowed = buildAllowedOperations(ops);
  const toolFiles = fs
    .readdirSync(toolsDir)
    .filter((f) => f.endsWith(".tool.json"))
    .sort();

  const errors = [];
  const workflows = [];

  for (const file of toolFiles) {
    const tool = loadJson(path.join(toolsDir, file));
    const provider = tool.id;
    const providerInfo = allowed[provider];
    if (!providerInfo) {
      errors.push(`Provider ${provider} missing from n8n-official-ops`);
      continue;
    }
    if (!providerInfo.nodeType) {
      errors.push(`Provider ${provider} missing nodeType in n8n-official-ops`);
    }

    for (const action of tool.actions || []) {
      if (!providerInfo.operations.has(action.name)) {
        errors.push(`Action ${provider}:${action.name} not declared in n8n-official-ops`);
      }
    }

    workflows.push({ tool, nodeType: providerInfo.nodeType });
  }

  if (errors.length) {
    console.error("Cannot generate workflows:");
    for (const err of errors) {
      console.error("-", err);
    }
    process.exit(1);
  }

  workflows.forEach(({ tool, nodeType }) => {
    const workflow = buildWorkflow(tool, nodeType);
    const dest = path.join(workflowsDir, `${tool.id}.workflow.json`);
    fs.writeFileSync(dest, JSON.stringify(workflow, null, 2) + "\n");
  });

  console.log("Tool workflows generated.");
}

main();
