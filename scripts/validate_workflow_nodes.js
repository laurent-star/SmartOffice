const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIRS = [
  path.join(__dirname, '..', 'workflows', 'tools'),
  path.join(__dirname, '..', 'workflows', 'triggers'),
  path.join(__dirname, '..', 'workflows', 'agent'),
  path.join(__dirname, '..', 'workflows', 'executor'),
  path.join(__dirname, '..', 'workflows', 'utils'),
  path.join(__dirname, '..', 'workflows', 'golden')
];
const OPS_PATH = path.join(__dirname, '..', 'registries', 'n8n-official-ops.json');
const NODETYPE_MAP_PATH = path.join(__dirname, '..', 'config', 'n8n-nodeType-map.json');
const CORE_NODES_PATH = path.join(__dirname, '..', 'docs', 'n8n', 'core-nodes.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listWorkflowFiles() {
  const files = [];
  WORKFLOWS_DIRS.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => files.push(path.join(dir, f)));
  });
  return files;
}

function main() {
  const ops = loadJson(OPS_PATH);
  const nodeTypeMap = fs.existsSync(NODETYPE_MAP_PATH) ? loadJson(NODETYPE_MAP_PATH) : {};
  const coreNodes = fs.existsSync(CORE_NODES_PATH) ? loadJson(CORE_NODES_PATH) : { nodes: [] };
  const allowedCoreNodes = new Set(coreNodes.nodes || []);
  const providerNodeTypes = new Set();
  Object.values(ops.providers || {}).forEach((def) => {
    if (def.nodeType) providerNodeTypes.add(def.nodeType);
  });
  Object.values(nodeTypeMap).forEach((type) => providerNodeTypes.add(type));

  const errors = [];
  const files = listWorkflowFiles();

  files.forEach((file) => {
    const workflow = loadJson(file);
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    const isToolWorkflow = file.includes(path.join('workflows', 'tools'));

    nodes.forEach((node) => {
      if (!node.type) return;
      if (providerNodeTypes.has(node.type)) return;
      if (allowedCoreNodes.has(node.type)) return;
      errors.push(`Unknown node type ${node.type} in ${file}`);
    });

    if (isToolWorkflow) {
      const provider = path.basename(file, '.workflow.json');
      const providerDef = ops.providers && ops.providers[provider];
      if (!providerDef) {
        errors.push(`Missing provider in n8n-official-ops: ${provider} (${file})`);
        return;
      }

      const nodeType = providerDef.nodeType || nodeTypeMap[provider];
      if (!nodeType) {
        errors.push(`Missing nodeType for provider ${provider} (${file})`);
        return;
      }

      const actionNodes = nodes.filter((node) => node.type === nodeType);
      if (!actionNodes.length) {
        errors.push(`No action nodes found for provider ${provider} (${file})`);
        return;
      }

      actionNodes.forEach((node) => {
        const params = node.parameters || {};
        const resource = params.resource;
        const operation = params.operation;
        if (!resource || !operation) {
          errors.push(`Missing resource/operation in node ${node.name} (${file})`);
          return;
        }
        const resourceDef = providerDef.resources && providerDef.resources[resource];
        const opDef = resourceDef && resourceDef.operations && resourceDef.operations[operation];
        if (!opDef) {
          errors.push(`Unknown operation ${resource}.${operation} in ${node.name} (${file})`);
        }
      });
    }
  });

  if (errors.length) {
    errors.forEach((err) => console.error(`ERROR ${err}`));
    process.exit(1);
  }

  console.log('Workflow nodes are consistent with n8n official ops');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
