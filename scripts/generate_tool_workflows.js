const fs = require('fs');
const path = require('path');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const workflowsDir = path.join(__dirname, '..', 'workflows', 'tools');
const toolsRegistryPath = path.join(__dirname, '..', 'registries', 'tools.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function createBaseNodes(toolId) {
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
      type: 'n8n-nodes-base.set',
      typeVersion: 1,
      position: [420, 300],
      parameters: {
        keepOnlySet: true,
        values: {
          string: [
            { name: 'provider', value: toolId },
            { name: 'operation', value: '={{$json.operation}}' }
          ],
          json: [
            { name: 'params', value: '={{$json.params}}' }
          ]
        }
      }
    },
    {
      id: 'dispatch',
      name: 'Dispatch Operation',
      type: 'n8n-nodes-base.switch',
      typeVersion: 1,
      position: [660, 300],
      parameters: {
        propertyName: '={{$json.operation}}',
        dataType: 'string',
        outputData: 'inputData',
        rules: []
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

  const actions = tool.actions || [];
  actions.forEach((action, index) => {
    const [resource, operation] = action.split('.');
    const actionNode = {
      id: `${resource}-${operation}`,
      name: `${resource}.${operation}`,
      type: ops.providers[tool.id].nodeType,
      typeVersion: 1,
      position: [920, 150 + index * 150],
      parameters: {
        resource,
        operation,
        additionalFields: {}
      }
    };
    nodes.push(actionNode);

    connections['Dispatch Operation'].main.push({ node: actionNode.name, type: 'main', index: 0 });
    connections[actionNode.name] = { main: [] };
    nodes.find((n) => n.id === 'dispatch').parameters.rules.push({ operation: 'equal', value: action });
  });

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
