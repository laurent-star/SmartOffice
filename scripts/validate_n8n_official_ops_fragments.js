const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const fragmentsDir = path.join(__dirname, '..', 'registries', 'n8n-official-ops');
const fragmentSchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops-fragment.schema.json');
const overrideSchemaPath = path.join(__dirname, '..', 'contracts', 'n8n-official-ops-override.schema.json');
const overridesDir = path.join(fragmentsDir, '_overrides');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const issues = [];
  const fragmentSchema = loadJson(fragmentSchemaPath);
  const overrideSchema = loadJson(overrideSchemaPath);
  const validateFragment = ajv.compile(fragmentSchema);
  const validateOverride = ajv.compile(overrideSchema);

  for (const file of fs.readdirSync(fragmentsDir)) {
    if (!file.endsWith('.json')) continue;
    const fragment = loadJson(path.join(fragmentsDir, file));
    if (!validateFragment(fragment)) {
      issues.push(`Fragment ${file} invalid: ${ajv.errorsText(validateFragment.errors)}`);
    }
  }

  if (fs.existsSync(overridesDir)) {
    for (const file of fs.readdirSync(overridesDir)) {
      if (!file.endsWith('.json')) continue;
      const override = loadJson(path.join(overridesDir, file));
      if (!validateOverride(override)) {
        issues.push(`Override ${file} invalid: ${ajv.errorsText(validateOverride.errors)}`);
      }
    }
  }

  if (issues.length) {
    issues.forEach((i) => console.error(i));
    process.exit(1);
  }

  console.log('Fragments and overrides valid');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { };
