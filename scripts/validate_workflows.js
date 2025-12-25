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

  (schema.required_nodes || []).forEach((req) => {
    const node = nodes.find((n) => n.name === req.name);
    if (!node) {
      errors.push(`missing node: ${req.name}`);
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

let invalid = 0;
for (const group of checks) {
  const schema = loadJson(schemaMap[group.type]);
  for (const file of group.files) {
    if (!fs.existsSync(file)) continue;
    const errors = validateWorkflow(file, schema);
    if (errors.length) {
      invalid += 1;
      console.log("INVALID", file);
      errors.forEach((err) => console.log("-", err));
    }
  }
}

console.log(`\nSUMMARY: invalid=${invalid}`);
process.exit(invalid ? 1 : 0);
