const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const schemaPath = path.join(__dirname, "..", "contracts", "n8n-official-ops.schema.json");
const dataPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const valid = validate(data);

if (!valid) {
  console.error("Schema validation failed for n8n-official-ops.json");
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

const errors = [];

if (!Array.isArray(data.source.docs) || data.source.docs.length === 0) {
  errors.push("source.docs must be a non-empty array");
}

for (const [provider, providerDef] of Object.entries(data.providers)) {
  if (!providerDef.nodeType) {
    errors.push(`Provider ${provider} missing nodeType`);
  }
  if (!providerDef.resources || !Object.keys(providerDef.resources).length) {
    errors.push(`Provider ${provider} must declare resources`);
    continue;
  }

  for (const [resource, resourceDef] of Object.entries(providerDef.resources)) {
    if (!resourceDef.operations || !Object.keys(resourceDef.operations).length) {
      errors.push(`Provider ${provider} resource ${resource} has no operations`);
      continue;
    }
    for (const [operation, opDef] of Object.entries(resourceDef.operations)) {
      const required = opDef.params?.required || [];
      const optional = opDef.params?.optional || [];
      if (!Array.isArray(required) || !Array.isArray(optional)) {
        errors.push(`Provider ${provider} resource ${resource} operation ${operation} params must have required/optional arrays`);
      }
      const duplicateParams = new Set();
      for (const p of [...required, ...optional]) {
        if (duplicateParams.has(p)) {
          errors.push(`Duplicate param ${p} in ${provider}:${resource}.${operation}`);
        }
        duplicateParams.add(p);
      }
      const returns = opDef.returns || {};
      if (!returns.data && !returns.binary) {
        errors.push(`Provider ${provider} resource ${resource} operation ${operation} must define returns.data or returns.binary`);
      }
    }
  }
}

if (errors.length) {
  console.error("Validation errors:");
  for (const err of errors) {
    console.error("-", err);
  }
  process.exit(1);
}

console.log("n8n-official-ops.json is valid and consistent");
