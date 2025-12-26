const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '..', 'workflows', 'agent');
const schemaPath = path.join(__dirname, '..', 'contracts', 'workflow-agent.schema.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateWorkflow(file, schema) {
  const data = loadJson(file);
  const errors = [];

  (schema.required_fields || []).forEach((field) => {
    if (data[field] === undefined) errors.push(`missing field: ${field}`);
  });

  const nodes = Array.isArray(data.nodes) ? data.nodes : [];

  (schema.required_nodes || []).forEach((req) => {
    const names = Array.isArray(req.name) ? req.name : [req.name];
    const node = nodes.find((n) => names.includes(n.name));
    if (!node) {
      errors.push(`missing node: ${names.join(' or ')}`);
      return;
    }
    if (req.type && node.type !== req.type) {
      errors.push(`node ${req.name} has type ${node.type}, expected ${req.type}`);
    }
  });

  return errors;
}

function main() {
  if (!fs.existsSync(workflowsDir)) {
    console.error('Missing workflows/agent directory');
    process.exit(1);
  }

  const schema = loadJson(schemaPath);
  const files = fs.readdirSync(workflowsDir).filter((f) => f.endsWith('.workflow.json'));
  let invalid = 0;

  for (const file of files) {
    const full = path.join(workflowsDir, file);
    const errors = validateWorkflow(full, schema);
    if (errors.length) {
      invalid += 1;
      console.log('INVALID', full);
      errors.forEach((err) => console.log('-', err));
    }
  }

  console.log(`SUMMARY: invalid=${invalid}`);
  process.exit(invalid ? 1 : 0);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
