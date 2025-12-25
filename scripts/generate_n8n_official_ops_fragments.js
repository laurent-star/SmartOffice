const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { OUTPUT_PATH } = require('./parse_n8n_docs');

const fragmentSchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops-fragment.schema.json');
const overrideSchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops-override.schema.json');
const overridesDir = path.join(__dirname, '..', 'registries', 'n8n-official-ops', '_overrides');
const fragmentsDir = path.join(__dirname, '..', 'registries', 'n8n-official-ops');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mergeFragments(base, override) {
  if (!override) return base;
  const merged = { ...base };
  if (override.nodeType) merged.nodeType = override.nodeType;
  if (override.sourceDocs) {
    merged.sourceDocs = Array.from(new Set([...(base.sourceDocs || []), ...override.sourceDocs])).sort();
  }
  merged.resources = merged.resources || {};
  for (const [resource, resDef] of Object.entries(override.resources || {})) {
    merged.resources[resource] = merged.resources[resource] || { operations: {} };
    merged.resources[resource].operations = merged.resources[resource].operations || {};
    for (const [op, opDef] of Object.entries(resDef.operations || {})) {
      merged.resources[resource].operations[op] = {
        ...(merged.resources[resource].operations[op] || {}),
        ...opDef
      };
    }
  }
  return merged;
}

function ensureOperationComplete(provider, resource, operation, opDef, sourceDocs) {
  if (!opDef.params || !opDef.params.required || !opDef.params.optional) {
    throw new Error(`Missing params for ${provider}/${resource}/${operation} from ${sourceDocs.join(', ')}`);
  }
  if (!opDef.returns || (!opDef.returns.data || !opDef.returns.data.length)) {
    throw new Error(`Missing returns.data for ${provider}/${resource}/${operation} from ${sourceDocs.join(', ')}`);
  }
}

function sortFragment(fragment) {
  const sorted = {
    provider: fragment.provider,
    nodeType: fragment.nodeType,
    resources: {},
    sourceDocs: (fragment.sourceDocs || []).slice().sort()
  };
  const resources = Object.keys(fragment.resources || {}).sort();
  resources.forEach((res) => {
    const resDef = fragment.resources[res];
    const operations = Object.keys(resDef.operations || {}).sort();
    sorted.resources[res] = { operations: {} };
    operations.forEach((op) => {
      const opDef = resDef.operations[op];
      sorted.resources[res].operations[op] = {
        ...opDef,
        params: {
          required: (opDef.params?.required || []).slice().sort(),
          optional: (opDef.params?.optional || []).slice().sort()
        },
        returns: {
          ...opDef.returns,
          data: (opDef.returns?.data || []).slice().sort(),
          binary: (opDef.returns?.binary || []).slice().sort()
        }
      };
    });
  });
  return sorted;
}

function main() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    throw new Error('Parsed docs missing, run parse_n8n_docs first');
  }
  const parsed = loadJson(OUTPUT_PATH);
  const fragmentSchema = loadJson(fragmentSchemaPath);
  const overrideSchema = loadJson(overrideSchemaPath);
  const validateFragment = ajv.compile(fragmentSchema);
  const validateOverride = ajv.compile(overrideSchema);

  if (!fs.existsSync(overridesDir)) {
    fs.mkdirSync(overridesDir, { recursive: true });
  }

  for (const overrideFile of fs.readdirSync(overridesDir)) {
    if (!overrideFile.endsWith('.json')) continue;
    const override = loadJson(path.join(overridesDir, overrideFile));
    if (!validateOverride(override)) {
      throw new Error(`Invalid override ${overrideFile}: ${ajv.errorsText(validateOverride.errors)}`);
    }
    const provider = override.provider || path.basename(overrideFile, '.json');
    if (!parsed[provider]) parsed[provider] = { provider, resources: {}, sourceDocs: [], needsManualSpec: true };
    parsed[provider] = mergeFragments(parsed[provider], override);
  }

  for (const [provider, fragment] of Object.entries(parsed)) {
    if (!fragment.nodeType) {
      throw new Error(`Missing nodeType for provider ${provider}`);
    }
    for (const [resource, resDef] of Object.entries(fragment.resources || {})) {
      for (const [op, opDef] of Object.entries(resDef.operations || {})) {
        ensureOperationComplete(provider, resource, op, opDef, fragment.sourceDocs || []);
      }
    }
    const sorted = sortFragment(fragment);
    if (!validateFragment(sorted)) {
      throw new Error(`Fragment for ${provider} invalid: ${ajv.errorsText(validateFragment.errors)}`);
    }
    const targetPath = path.join(fragmentsDir, `${provider}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  }

  console.log('Fragments regenerated from docs and overrides');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { mergeFragments };
