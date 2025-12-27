const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REGISTRY_VERSION = process.env.N8N_OFFICIAL_OPS_VERSION || '2.0.0';
const registryPath = path.join(__dirname, '..', 'registries', 'n8n-official-ops.json');
const fragmentsDir = path.join(__dirname, '..', 'registries', 'n8n-official-ops');
const overridesDir = path.join(fragmentsDir, '_overrides');
const registrySchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops.schema.json');
const fragmentSchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops-fragment.schema.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatAjvErrors(errors) {
  return (errors || [])
    .map((err) => `${err.instancePath || err.schemaPath} ${err.message}`.trim())
    .join('; ');
}

function checkOperation(provider, resource, operation, opDef) {
  const params = (opDef && opDef.params) || {};
  const required = params.required || [];
  const optional = params.optional || [];
  const intersection = required.filter((p) => optional.includes(p));
  if (intersection.length) {
    throw new Error(`Params overlap for ${provider}/${resource}/${operation}: ${intersection.join(',')}`);
  }
  if (!opDef.returns || !opDef.returns.data || !opDef.returns.data.length) {
    throw new Error(`returns.data missing for ${provider}/${resource}/${operation}`);
  }
}

function buildN8nOfficialOps({ quiet = false } = {}) {
  if (!fs.existsSync(fragmentsDir)) {
    throw new Error(`Fragments directory missing: ${fragmentsDir}`);
  }

  const fragmentSchema = loadJson(fragmentSchemaPath);
  const fragmentValidator = ajv.compile(fragmentSchema);

  const providers = {};
  const docs = new Set();

  const files = fs
    .readdirSync(fragmentsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (!files.length) {
    throw new Error(`No fragments found in ${fragmentsDir}`);
  }

  for (const file of files) {
    const fullPath = path.join(fragmentsDir, file);
    const fragment = loadJson(fullPath);

    if (!fragmentValidator(fragment)) {
      const details = formatAjvErrors(fragmentValidator.errors);
      throw new Error(`Fragment ${file} is invalid: ${details}`);
    }

    const providerId = fragment.provider;
    if (providers[providerId]) {
      throw new Error(`Duplicate provider detected: ${providerId}`);
    }

    (fragment.sourceDocs || []).forEach((doc) => docs.add(doc));

    const resources = {};
    for (const resourceName of Object.keys(fragment.resources).sort()) {
      const resourceDef = fragment.resources[resourceName];
      const operations = {};
      for (const operationName of Object.keys(resourceDef.operations).sort()) {
        const opDef = resourceDef.operations[operationName];
        checkOperation(providerId, resourceName, operationName, opDef);
        operations[operationName] = opDef;
      }
      resources[resourceName] = { operations };
    }

    providers[providerId] = { nodeType: fragment.nodeType, resources };
  }

  if (fs.existsSync(overridesDir)) {
    const overrideFiles = fs
      .readdirSync(overridesDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    for (const file of overrideFiles) {
      const override = loadJson(path.join(overridesDir, file));
      if (!override || !override.provider) continue;
      if (!providers[override.provider]) continue;
      if (override.nodeType) {
        providers[override.provider].nodeType = override.nodeType;
      }
    }
  }

  const payload = {
    version: REGISTRY_VERSION,
    source: { vendor: 'n8n', docs: Array.from(docs).sort() },
    providers
  };

  const registrySchema = loadJson(registrySchemaPath);
  const validateRegistry = ajv.compile(registrySchema);
  if (!validateRegistry(payload)) {
    const details = formatAjvErrors(validateRegistry.errors);
    throw new Error(`Assembled registry is invalid: ${details}`);
  }

  fs.writeFileSync(registryPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  if (!quiet) {
    console.log(`n8n-official-ops registry built from ${files.length} fragments.`);
  }

  return payload;
}

if (require.main === module) {
  try {
    buildN8nOfficialOps();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { buildN8nOfficialOps };
