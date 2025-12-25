const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const categoriesPath = path.join(__dirname, '..', 'registries', 'tool-categories.json');
const overridePath = path.join(__dirname, '..', 'config', 'capability-mapping.overrides.json');
const schemaPath = path.join(__dirname, '..', 'contracts', 'capabilities.schema.json');
const outputPath = path.join(__dirname, '..', 'registries', 'capabilities.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const verbMap = {
  create: 'create',
  update: 'update',
  upsert: 'upsert',
  get: 'read',
  read: 'read',
  getAll: 'list',
  getMany: 'list',
  list: 'list',
  search: 'search',
  send: 'send',
  reply: 'reply',
  upload: 'upload',
  download: 'download',
  delete: 'delete',
  append: 'append',
  clear: 'clear',
  transcribe: 'transcribe',
  translate: 'translate',
  generate: 'generate',
  classify: 'classify',
  summarize: 'summarize',
  extract: 'extract'
};

const resourceMap = {
  message: 'message',
  event: 'event',
  file: 'file',
  folder: 'folder',
  document: 'document',
  spreadsheet: 'spreadsheet',
  sheet: 'sheet',
  board_item: 'board_item',
  boardItem: 'board_item',
  contact: 'contact',
  company: 'company',
  campaign: 'campaign',
  email: 'email',
  image: 'image',
  audio: 'audio',
  video: 'video',
  assistant: 'assistant'
};

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeResource(resource) {
  return (
    resourceMap[resource] ||
    resource
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/__+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
  );
}

function normalizeVerb(operation) {
  const normalized = operation.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_');
  const lower = normalized.toLowerCase();
  if (verbMap[operation]) return verbMap[operation];
  if (verbMap[lower]) return verbMap[lower];
  const token = lower.split('_')[0];
  return verbMap[token] || null;
}

function main() {
  const ops = buildN8nOfficialOps({ quiet: true });
  const categories = loadJson(categoriesPath);
  const overrides = loadJson(overridePath);
  const categoryByProvider = {};
  for (const [cat, def] of Object.entries(categories)) {
    for (const provider of def.providers) {
      categoryByProvider[provider] = categoryByProvider[provider] || new Set();
      categoryByProvider[provider].add(cat);
    }
  }

  const capabilities = {};
  const actionKeys = new Set();

  for (const [provider, providerDef] of Object.entries(ops.providers)) {
    const providerCategories = categoryByProvider[provider];
    if (!providerCategories || providerCategories.size === 0) {
      throw new Error(`Provider ${provider} missing category mapping`);
    }
    for (const [resource, resourceDef] of Object.entries(providerDef.resources || {})) {
      for (const operation of Object.keys(resourceDef.operations || {})) {
        const actionKey = `${provider}.${resource}.${operation}`;
        actionKeys.add(actionKey);
        const overrideKey = overrides[actionKey];
        let capabilityKey = overrideKey;
        if (!capabilityKey) {
          const verb = normalizeVerb(operation);
          if (!verb) {
            throw new Error(`No capability verb mapping for ${actionKey}`);
          }
          const objectName = normalizeResource(resource);
          capabilityKey = `${verb}_${objectName}`;
        }
        capabilities[capabilityKey] = capabilities[capabilityKey] || {
          key: capabilityKey,
          description: capabilityKey.replace(/_/g, ' '),
          categories: new Set(),
          operations: new Set()
        };
        providerCategories.forEach((cat) => capabilities[capabilityKey].categories.add(cat));
        capabilities[capabilityKey].operations.add(actionKey);
      }
    }
  }

  const payload = Object.values(capabilities)
    .map((cap) => ({
      key: cap.key,
      description: cap.description,
      categories: Array.from(cap.categories).sort(),
      operations: Array.from(cap.operations).sort()
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const covered = new Set(payload.flatMap((cap) => cap.operations));
  for (const actionKey of actionKeys) {
    if (!covered.has(actionKey)) {
      throw new Error(`Uncovered actionKey ${actionKey}`);
    }
  }

  const schema = loadJson(schemaPath);
  const validate = ajv.compile(schema);
  if (!validate(payload)) {
    throw new Error(`Invalid capabilities payload: ${ajv.errorsText(validate.errors)}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('capabilities generated');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
