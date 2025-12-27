const fs = require('fs');
const path = require('path');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const workflowsDir = path.join(__dirname, '..', 'workflows', 'tools');
const toolsRegistryPath = path.join(__dirname, '..', 'registries', 'tools.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function createBaseNodes(toolId) {
  const openAiTextFallback =
    toolId === 'openai'
      ? "  if (!params.text) {\n" +
        "    const messages = params.messages?.values ?? params.messages;\n" +
        "    if (Array.isArray(messages)) {\n" +
        "      params.text = messages.map((m) => m.content ?? '').join('\\n');\n" +
        "    }\n" +
        "  }\n" +
        "  if (!params.text && params.prompt) params.text = params.prompt;\n" +
        "  if (!params.text && params.input) params.text = params.input;\n"
      : "";

  return [
    {
      id: 'manual',
      name: 'Manual Trigger',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [200, 300]
    },
    {
      id: 'normalize',
      name: 'Normalize Input',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [420, 300],
      parameters: {
        language: 'JavaScript',
        mode: 'runOnceForAllItems',
        jsCode:
          "return items.map((item) => {\n" +
          "  const input = item.json || {};\n" +
          "  const tool = input.tool || {};\n" +
          "  const params = input.params ?? tool.params ?? {};\n" +
          "  const operation = input.operation ?? tool.operation ?? params.action ?? input.action;\n" +
          openAiTextFallback +
          "  return {\n" +
          "    json: {\n" +
          `      provider: '${toolId}',\n` +
          "      operation,\n" +
          "      params\n" +
          "    }\n" +
          "  };\n" +
          "});\n"
      }
    }
  ];
}

function buildWorkflow(tool, ops) {
  const nodes = createBaseNodes(tool.id);
  const connections = {
    'Manual Trigger': { main: [[{ node: 'Normalize Input', type: 'main', index: 0 }]] },
    'Normalize Input': { main: [[{ node: 'Dispatch Operation', type: 'main', index: 0 }]] },
    'Dispatch Operation': { main: [] }
  };

  const actions = (tool.actions || []).map((action) =>
    typeof action === 'string' ? action : action.name
  );
  const rules = [];
  const outputs = [];
  actions.forEach((action, index) => {
    if (!action) return;
    if (action === 'sampleFetch') {
      const sampleNode = {
        id: 'sample-fetch',
        name: 'sampleFetch',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [920, 150 + index * 150],
        parameters: {
          language: 'JavaScript',
          mode: 'runOnceForAllItems',
          jsCode:
            "return items.map((item) => {\n" +
            "  const input = item.json || {};\n" +
            "  return {\n" +
            "    json: {\n" +
            "      ok: true,\n" +
            `      data: { sample: true, provider: '${tool.id}', operation: 'sampleFetch', params: input.params || {} },\n` +
            "      error: null\n" +
            "    }\n" +
            "  };\n" +
            "});\n"
        }
      };
      nodes.push(sampleNode);
      outputs.push([{ node: sampleNode.name, type: 'main', index: 0 }]);
      connections[sampleNode.name] = { main: [] };
      rules.push(action);
      return;
    }

    const [resource, operation] = action.split('.');
    if (!resource || !operation) return;
    const opDef =
      ops.providers[tool.id].resources &&
      ops.providers[tool.id].resources[resource] &&
      ops.providers[tool.id].resources[resource].operations &&
      ops.providers[tool.id].resources[resource].operations[operation];
    const requiredParams = (opDef && opDef.params && opDef.params.required) || [];
    const requiredMap = requiredParams.reduce((acc, param) => {
      acc[param] = `={{$json.params.${param}}}`;
      return acc;
    }, {});

    const actionNode = {
      id: `${resource}-${operation}`,
      name: `${resource}.${operation}`,
      type: ops.providers[tool.id].nodeType,
      typeVersion: 1,
      position: [920, 150 + index * 150],
      parameters: {
        resource,
        operation,
        ...requiredMap,
        additionalFields: {}
      }
    };
    nodes.push(actionNode);
    outputs.push([{ node: actionNode.name, type: 'main', index: 0 }]);
    connections[actionNode.name] = { main: [] };
    rules.push(action);
  });

  const routeMap = rules.reduce((acc, action, idx) => {
    acc[action] = idx;
    return acc;
  }, {});

  nodes.push({
    id: 'dispatch',
    name: 'Dispatch Operation',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [660, 300],
    parameters: {
      language: 'JavaScript',
      mode: 'runOnceForAllItems',
      numberOutputs: outputs.length,
      jsCode:
        `const routes = ${JSON.stringify(routeMap, null, 2)};\n` +
        `const outputs = Array.from({ length: ${outputs.length} }, () => []);\n` +
        "for (const item of items) {\n" +
        "  const op = item.json?.operation;\n" +
        "  const index = routes[op];\n" +
        "  if (index !== undefined) {\n" +
        "    outputs[index].push(item);\n" +
        "  }\n" +
        "}\n" +
        "return outputs;\n"
    }
  });

  connections['Dispatch Operation'].main = outputs;

  return {
    name: `${tool.id} tool workflow`,
    nodes,
    connections,
    settings: {},
    pinData: {}
  };
}

function main() {
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }
  const tools = loadJson(toolsRegistryPath);
  const ops = buildN8nOfficialOps({ quiet: true });

  tools.forEach((tool) => {
    const workflow = buildWorkflow(tool, ops);
    const target = path.join(workflowsDir, `${tool.id}.workflow.json`);
    fs.writeFileSync(target, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
  });

  console.log(`Generated ${tools.length} tool workflows`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
