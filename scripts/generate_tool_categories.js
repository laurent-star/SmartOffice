const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const categoriesMapPath = path.join(__dirname, '..', 'config', 'provider-category.map.json');
const categoriesSchemaPath = path.join(__dirname, '..', 'contracts', 'tool-categories.schema.json');
const outputPath = path.join(__dirname, '..', 'registries', 'tool-categories.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const ops = buildN8nOfficialOps({ quiet: true });
  const categoriesMap = loadJson(categoriesMapPath);
  const categories = {};

  for (const [provider, def] of Object.entries(ops.providers)) {
    const category = categoriesMap[provider];
    if (!category) {
      throw new Error(`Missing category for provider ${provider}`);
    }
    const resourceEntries = Object.entries(def.resources || {});
    if (!resourceEntries.length) {
      throw new Error(`Provider ${provider} has no resources`);
    }
    for (const [resourceName, resourceDef] of resourceEntries) {
      for (const operation of Object.keys(resourceDef.operations || {})) {
        const actionKey = `${resourceName}.${operation}`;
        categories[category] = categories[category] || { providers: new Set(), operations: new Set() };
        categories[category].providers.add(provider);
        categories[category].operations.add(actionKey);
      }
    }
  }

  const payload = Object.fromEntries(
    Object.keys(categories)
      .sort()
      .map((cat) => [
        cat,
        {
          providers: Array.from(categories[cat].providers).sort(),
          operations: Array.from(categories[cat].operations).sort()
        }
      ])
  );

  const schema = loadJson(categoriesSchemaPath);
  const validate = ajv.compile(schema);
  if (!validate(payload)) {
    throw new Error(`tool-categories.json invalid: ${ajv.errorsText(validate.errors)}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('tool-categories generated');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
