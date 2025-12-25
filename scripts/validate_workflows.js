const fs = require("fs");
const path = require("path");

const schemaMap = {
  tools: "contracts/workflow-tool.schema.json",
  triggers: "contracts/workflow-trigger.schema.json",
  agent: "contracts/workflow-agent.schema.json",
  utils: "contracts/workflow-utils.schema.json",
  executor: "contracts/workflow-executor.schema.json",
  golden: "contracts/workflow-golden.schema.json"
};
const opsPath = path.join("registries", "n8n-official-ops.json");
const nodeTypeMapPath = path.join("config", "n8n-nodeType-map.json");
const coreNodesPath = path.join("docs", "n8n", "core-nodes.json");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listWorkflowFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(listWorkflowFiles(abs));
    } else if (entry.isFile() && entry.name.endsWith(".workflow.json")) {
      files.push(abs);
    }
  }
  return files;
}

function validateWorkflow(file, schema) {
  const data = loadJson(file);
  const errors = [];

  (schema.required_fields || []).forEach((field) => {
    if (data[field] === undefined) errors.push(`missing field: ${field}`);
  });

  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const nodeNames = new Set(nodes.map((n) => n.name));

  (schema.required_nodes || []).forEach((req) => {
    const names = Array.isArray(req.name) ? req.name : [req.name];
    const node = nodes.find((n) => names.includes(n.name));
    if (!node) {
      errors.push(`missing node: ${names.join(" or ")}`);
      return;
    }
    if (req.type && node.type !== req.type) {
      errors.push(`node ${req.name} has type ${node.type}, expected ${req.type}`);
    }
    if (req.types && !req.types.includes(node.type)) {
      errors.push(`node ${req.name} has type ${node.type}, expected one of ${req.types.join(', ')}`);
    }
  });

  (schema.required_node_types || []).forEach((type) => {
    const hasType = nodes.some((n) => n.type === type);
    if (!hasType) errors.push(`missing node type: ${type}`);
  });

  return errors;
}

function validateConnections(file, data) {
  const errors = [];
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const nodeNames = new Set(nodes.map((n) => n.name));
  const connections = data.connections || {};

  Object.keys(connections).forEach((from) => {
    if (!nodeNames.has(from)) {
      errors.push(`connection from unknown node: ${from}`);
      return;
    }
    const outgoing = connections[from] || {};
    Object.values(outgoing).forEach((groups) => {
      if (!Array.isArray(groups)) return;
      groups.forEach((group) => {
        if (!Array.isArray(group)) return;
        group.forEach((edge) => {
          if (!edge || !edge.node) return;
          if (!nodeNames.has(edge.node)) {
            errors.push(`connection to unknown node: ${edge.node} (from ${from})`);
          }
        });
      });
    });
  });

  return errors;
}

function validateNodesAgainstDocs(file, data, helpers) {
  const errors = [];
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const isToolWorkflow = file.includes(path.join("workflows", "tools"));

  nodes.forEach((node) => {
    if (!node.type) return;
    if (helpers.providerNodeTypes.has(node.type)) return;
    if (helpers.allowedCoreNodes.has(node.type)) return;
    errors.push(`unknown node type ${node.type}`);
  });

  if (!isToolWorkflow) return errors;

  const provider = path.basename(file, ".workflow.json");
  const providerDef = helpers.ops.providers && helpers.ops.providers[provider];
  if (!providerDef) {
    errors.push(`missing provider in n8n-official-ops: ${provider}`);
    return errors;
  }
  const nodeType = providerDef.nodeType || helpers.nodeTypeMap[provider];
  if (!nodeType) {
    errors.push(`missing nodeType for provider ${provider}`);
    return errors;
  }

  const actionNodes = nodes.filter((n) => n.type === nodeType);
  if (!actionNodes.length) {
    errors.push(`no action nodes found for provider ${provider}`);
    return errors;
  }

  actionNodes.forEach((node) => {
    const params = node.parameters || {};
    const resource = params.resource;
    const operation = params.operation;
    if (!resource || !operation) {
      errors.push(`missing resource/operation in node ${node.name}`);
      return;
    }
    const resourceDef = providerDef.resources && providerDef.resources[resource];
    const opDef = resourceDef && resourceDef.operations && resourceDef.operations[operation];
    if (!opDef) {
      errors.push(`unknown operation ${resource}.${operation} in ${node.name}`);
    }
  });

  return errors;
}

const checks = [
  { type: "tools", dir: "workflows/tools", files: listWorkflowFiles("workflows/tools") },
  { type: "triggers", dir: "workflows/triggers", files: listWorkflowFiles("workflows/triggers") },
  { type: "agent", dir: "workflows/agent", files: listWorkflowFiles("workflows/agent") },
  { type: "utils", dir: "workflows/utils", files: listWorkflowFiles("workflows/utils") },
  { type: "executor", dir: "workflows/golden", files: ["workflows/golden/30_executor.json"] },
  { type: "golden", dir: "workflows/golden", files: fs.readdirSync("workflows/golden")
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join("workflows/golden", f))
  }
];

const helpers = {
  ops: fs.existsSync(opsPath) ? loadJson(opsPath) : { providers: {} },
  nodeTypeMap: fs.existsSync(nodeTypeMapPath) ? loadJson(nodeTypeMapPath) : {},
  allowedCoreNodes: new Set(),
  providerNodeTypes: new Set()
};
const coreNodes = fs.existsSync(coreNodesPath) ? loadJson(coreNodesPath) : { nodes: [] };
(coreNodes.nodes || []).forEach((type) => helpers.allowedCoreNodes.add(type));
Object.values(helpers.ops.providers || {}).forEach((def) => {
  if (def.nodeType) helpers.providerNodeTypes.add(def.nodeType);
});
Object.values(helpers.nodeTypeMap || {}).forEach((type) => helpers.providerNodeTypes.add(type));

let invalid = 0;
for (const group of checks) {
  const schema = loadJson(schemaMap[group.type]);
  for (const file of group.files) {
    if (!fs.existsSync(file)) continue;
    const data = loadJson(file);
    const errors = [
      ...validateWorkflow(file, schema),
      ...validateConnections(file, data),
      ...validateNodesAgainstDocs(file, data, helpers)
    ];
    if (errors.length) {
      invalid += 1;
      console.log("INVALID", file);
      errors.forEach((err) => console.log("-", err));
    }
  }
}

console.log(`\nSUMMARY: invalid=${invalid}`);
process.exit(invalid ? 1 : 0);
