const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '..', 'workflows', 'tools');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildNormalizeCode(provider) {
  return {
    language: 'JavaScript',
    mode: 'runOnceForAllItems',
    jsCode:
      "return items.map((item) => {\n" +
      "  const input = item.json || {};\n" +
      "  const tool = input.tool || {};\n" +
      "  const params = input.params ?? tool.params ?? {};\n" +
      "  const operation = input.operation ?? tool.operation ?? params.action ?? input.action;\n" +
      "  return {\n" +
      "    json: {\n" +
      `      provider: '${provider}',\n` +
      "      operation,\n" +
      "      params\n" +
      "    }\n" +
      "  };\n" +
      "});\n"
  };
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
      "  const op = item.json?.operation;\n" +
      "  const index = routes[op];\n" +
      "  if (index !== undefined) {\n" +
      "    outputs[index].push(item);\n" +
      "  }\n" +
      "}\n" +
      "return outputs;\n"
  };
}

function buildSampleFetchCode(provider) {
  return {
    language: 'JavaScript',
    mode: 'runOnceForAllItems',
    jsCode:
      "return items.map((item) => {\n" +
      "  const input = item.json || {};\n" +
      "  return {\n" +
      "    json: {\n" +
      "      ok: true,\n" +
      `      data: { sample: true, provider: '${provider}', operation: 'sampleFetch', params: input.params || {} },\n` +
      "      error: null\n" +
      "    }\n" +
      "  };\n" +
      "});\n"
  };
}

function migrateWorkflow(filePath) {
  const workflow = loadJson(filePath);
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const fileProvider = path.basename(filePath, '.workflow.json');

  let changed = false;

  const normalizeNode = nodes.find(
    (node) => node.name === 'Normalize Input' || node.id === 'normalize'
  );
  if (normalizeNode && normalizeNode.type === 'n8n-nodes-base.set') {
    const providerValue =
      normalizeNode.parameters?.values?.string?.find((entry) => entry.name === 'provider')?.value ||
      fileProvider;
    normalizeNode.type = 'n8n-nodes-base.code';
    normalizeNode.typeVersion = 2;
    normalizeNode.parameters = buildNormalizeCode(providerValue);
    changed = true;
  }

  const dispatchNode = nodes.find(
    (node) => node.name === 'Dispatch Operation' || node.id === 'dispatch'
  );
  if (dispatchNode && dispatchNode.type === 'n8n-nodes-base.switch') {
    const rules =
      dispatchNode.parameters?.rules?.map((rule) => rule.value).filter(Boolean) || [];
    dispatchNode.type = 'n8n-nodes-base.code';
    dispatchNode.typeVersion = 2;
    dispatchNode.parameters = buildDispatchCode(rules);
    changed = true;
  }

  const sampleFetchNode = nodes.find(
    (node) => node.name === 'sampleFetch' || node.id === 'sampleFetch'
  );
  if (sampleFetchNode && sampleFetchNode.type === 'n8n-nodes-base.set') {
    sampleFetchNode.type = 'n8n-nodes-base.code';
    sampleFetchNode.typeVersion = 2;
    sampleFetchNode.parameters = buildSampleFetchCode(fileProvider);
    changed = true;
  }

  if (changed) {
    saveJson(filePath, workflow);
  }

  return changed;
}

function main() {
  if (!fs.existsSync(workflowsDir)) {
    console.error('Missing workflows/tools directory');
    process.exit(1);
  }

  const files = fs.readdirSync(workflowsDir).filter((f) => f.endsWith('.workflow.json'));
  let updated = 0;
  files.forEach((file) => {
    const abs = path.join(workflowsDir, file);
    if (migrateWorkflow(abs)) updated += 1;
  });

  console.log(`Migrated ${updated} tool workflows`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
