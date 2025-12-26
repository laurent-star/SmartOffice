const fs = require('fs');
const path = require('path');

const workflowPath = path.join(__dirname, '..', 'workflows', 'executor', 'executor.workflow.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildDispatchCode(rules) {
  const routeMap = rules.reduce((acc, action, idx) => {
    acc[action] = idx;
    return acc;
  }, {});
  return {
    language: 'JavaScript',
    mode: 'runOnceForAllItems',
    numberOutputs: rules.length,
    jsCode:
      `const routes = ${JSON.stringify(routeMap, null, 2)};\n` +
      `const outputs = Array.from({ length: ${rules.length} }, () => []);\n` +
      "for (const item of items) {\n" +
      "  const key = item.json?.currentStep?.type ?? item.json?.currentStep?.tool?.provider;\n" +
      "  const index = routes[key];\n" +
      "  if (index !== undefined) {\n" +
      "    outputs[index].push(item);\n" +
      "  }\n" +
      "}\n" +
      "return outputs;\n"
  };
}

function renameConnectionKey(connections, oldName, newName) {
  if (connections[oldName]) {
    connections[newName] = connections[oldName];
    delete connections[oldName];
  }
  Object.values(connections).forEach((outputs) => {
    if (!outputs || typeof outputs !== 'object') return;
    Object.values(outputs).forEach((groups) => {
      if (!Array.isArray(groups)) return;
      groups.forEach((group) => {
        if (!Array.isArray(group)) return;
        group.forEach((edge) => {
          if (edge && edge.node === oldName) {
            edge.node = newName;
          }
        });
      });
    });
  });
}

function migrate() {
  if (!fs.existsSync(workflowPath)) {
    console.error('Missing executor workflow');
    process.exit(1);
  }

  const workflow = loadJson(workflowPath);
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const connections = workflow.connections || {};

  const stepTypeNode = nodes.find((node) => node.name === 'Switch Step Type');
  if (stepTypeNode && stepTypeNode.type === 'n8n-nodes-base.switch') {
  const rules = (stepTypeNode.parameters?.rules || [])
      .map((rule) => rule.value2 || rule.value)
      .filter(Boolean);
    stepTypeNode.name = 'Dispatch Step Type';
    stepTypeNode.type = 'n8n-nodes-base.code';
    stepTypeNode.typeVersion = 2;
    stepTypeNode.parameters = buildDispatchCode(rules);
    renameConnectionKey(connections, 'Switch Step Type', 'Dispatch Step Type');
  }

  const providerNode = nodes.find((node) => node.name === 'Switch Tool Provider');
  if (providerNode && providerNode.type === 'n8n-nodes-base.switch') {
  const rules = (providerNode.parameters?.rules || [])
      .map((rule) => rule.value2 || rule.value)
      .filter(Boolean);
    providerNode.name = 'Dispatch Tool Provider';
    providerNode.type = 'n8n-nodes-base.code';
    providerNode.typeVersion = 2;
    providerNode.parameters = buildDispatchCode(rules);
    renameConnectionKey(connections, 'Switch Tool Provider', 'Dispatch Tool Provider');
  }

  workflow.connections = connections;
  saveJson(workflowPath, workflow);
}

if (require.main === module) {
  try {
    migrate();
    console.log('Executor workflow updated');
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
