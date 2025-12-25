const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");
const toolsDir = path.join(__dirname, "..", "config", "tools");
const workflowsDir = path.join(__dirname, "..", "workflows", "tools");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function allowedOperationsByProvider(officialOps) {
  const map = {};
  for (const [provider, providerDef] of Object.entries(officialOps.providers || {})) {
    const allowed = new Set();
    for (const [resourceName, resourceDef] of Object.entries(providerDef.resources || {})) {
      for (const operationName of Object.keys(resourceDef.operations || {})) {
        allowed.add(`${resourceName}.${operationName}`);
      }
    }
    map[provider] = { nodeType: providerDef.nodeType, operations: allowed };
  }
  return map;
}

function buildWorkflow(provider, nodeType, actions) {
  const baseY = 300;
  const manualTrigger = {
    id: "manual-trigger",
    name: "Tool Trigger",
    type: "n8n-nodes-base.manualTrigger",
    typeVersion: 1,
    position: [200, baseY]
  };

  const dispatch = {
    id: "dispatch-operation",
    name: "Dispatch Operation",
    type: "n8n-nodes-base.function",
    typeVersion: 1,
    position: [420, baseY],
    parameters: {
      functionCode: [
        "const input = items[0]?.json || {};",
        "const tool = input.tool || {};",
        "const normalized = {",
        "  runId: input.runId || 'run-unknown',",
        "  stepId: input.stepId || ((tool.ref || tool.provider || 'tool') + '-step'),",
        "  tool: {",
        "    ref: tool.ref || '" + provider + "',",
        "    provider: tool.provider || '" + provider + "',",
        "    operation: tool.operation || ''",
        "  },",
        "  params: input.params || {},",
        "  context: input.context || {}",
        "};",
        "return [{ json: { toolInput: normalized } }];"
      ].join("\n")
    }
  };

  const switchNode = {
    id: "route-operation",
    name: "Route Operation",
    type: "n8n-nodes-base.switch",
    typeVersion: 1,
    position: [650, baseY],
    parameters: {
      dataType: "string",
      value1: "={{$json.toolInput.tool.operation}}",
      rules: actions.map((action) => ({ operation: "equal", type: "string", value: action.name }))
    }
  };

  const actionNodes = actions.map((action, index) => ({
    id: `action-${index + 1}`,
    name: `tool-result ${action.name}`,
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [900, baseY + index * 200],
    parameters: {
      language: "javascript",
      code: [
        "const toolInput = items[0].json.toolInput;",
        "return [{",
        "  json: {",
        "    ok: true,",
        "    data: {",
        "      operation: toolInput.tool.operation || '" + action.name + "' ,",
        "      params: toolInput.params",
        "    },",
        "    error: null,",
        "    meta: {",
        "      tool: {",
        "        ref: toolInput.tool.ref,",
        "        provider: toolInput.tool.provider,",
        "        operation: toolInput.tool.operation || '" + action.name + "'",
        "      },",
        "      runId: toolInput.runId,",
        "      stepId: toolInput.stepId",
        "    }",
        "  }",
        "}];"
      ].join("\n")
    }
  }));

  const connections = {
    [manualTrigger.name]: { main: [[{ node: dispatch.name, type: "main", index: 0 }]] },
    [dispatch.name]: { main: [[{ node: switchNode.name, type: "main", index: 0 }]] },
    [switchNode.name]: {
      main: actionNodes.map((actionNode) => [{ node: actionNode.name, type: "main", index: 0 }])
    }
  };

  return {
    name: `tool-${provider}`,
    nodes: [manualTrigger, dispatch, switchNode, ...actionNodes],
    connections,
    active: false,
    settings: { executionOrder: "v1" },
    versionId: "auto-generated"
  };
}

function generateWorkflows() {
  const officialOps = loadJson(registryPath);
  const allowedByProvider = allowedOperationsByProvider(officialOps);

  const toolFiles = fs
    .readdirSync(toolsDir)
    .filter((f) => f.endsWith(".tool.json"))
    .sort();

  const errors = [];

  for (const file of toolFiles) {
    const fullPath = path.join(toolsDir, file);
    const tool = loadJson(fullPath);
    const provider = tool.id;
    const providerOps = allowedByProvider[provider];

    if (!providerOps) {
      errors.push({ file, message: `Provider ${provider} non reference dans n8n-official-ops` });
      continue;
    }

    if (!providerOps.nodeType) {
      errors.push({ file, message: `nodeType manquant pour ${provider}` });
    }

    const invalidAction = (tool.actions || []).find((action) => !providerOps.operations.has(action.name));
    if (invalidAction) {
      errors.push({ file, message: `Action ${invalidAction.name} non supportee pour ${provider}` });
      continue;
    }

    const workflow = buildWorkflow(provider, providerOps.nodeType, tool.actions || []);
    const outputPath = path.join(workflowsDir, `${provider}.workflow.json`);
    fs.writeFileSync(outputPath, `${JSON.stringify(workflow, null, 2)}\n`, "utf8");
  }

  if (errors.length) {
    console.error("Generation des workflows tools echouee:");
    for (const err of errors) {
      console.error(JSON.stringify(err, null, 2));
    }
    process.exit(1);
  }

  console.log("Tool workflows generated successfully ✅");
}

generateWorkflows();
