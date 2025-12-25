const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const registryPath = path.join(__dirname, '..', 'registries', 'n8n-official-ops.json');
const registrySchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops.schema.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateOperationsConsistency(registry) {
  const issues = [];
  const seenOperations = new Set();

  for (const [provider, providerDef] of Object.entries(registry.providers || {})) {
    if (!providerDef.nodeType) {
      issues.push({ type: 'provider', provider, message: 'Missing nodeType' });
    }
    for (const [resource, resourceDef] of Object.entries(providerDef.resources || {})) {
      for (const [operation, opDef] of Object.entries(resourceDef.operations || {})) {
        const params = (opDef && opDef.params) || {};
        const required = params.required || [];
        const optional = params.optional || [];
        const intersection = required.filter((p) => optional.includes(p));
        if (intersection.length) {
          issues.push({ type: 'operation', provider, resource, operation, message: `Params overlap: ${intersection.join(',')}` });
        }
        if (!opDef.returns || !opDef.returns.data || !opDef.returns.data.length) {
          issues.push({ type: 'operation', provider, resource, operation, message: 'Missing returns.data' });
        }
        const key = `${provider}.${resource}.${operation}`;
        if (seenOperations.has(key)) {
          issues.push({ type: 'operation', provider, resource, operation, message: 'Duplicate operation key' });
        }
        seenOperations.add(key);
      }
    }
  }
  return issues;
}

function main() {
  try {
    buildN8nOfficialOps({ quiet: true });
  } catch (err) {
    console.error('Failed to build n8n-official-ops registry from fragments:');
    console.error(err.message);
    process.exit(1);
  }

  const schema = loadJson(registrySchemaPath);
  const registry = loadJson(registryPath);
  const validate = ajv.compile(schema);
  const valid = validate(registry);
  const issues = [];

  if (!valid) {
    issues.push({ type: 'schema', details: validate.errors });
  }

  issues.push(...validateOperationsConsistency(registry));

  if (issues.length) {
    console.error('Validation failed for n8n-official-ops');
    for (const issue of issues) {
      console.error(JSON.stringify(issue, null, 2));
    }
    process.exit(1);
  }

  console.log('n8n-official-ops registry is valid ✅');
}

if (require.main === module) {
  main();
}
