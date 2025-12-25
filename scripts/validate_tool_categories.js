const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '..', 'contracts', 'tool-categories.schema.json');
const targetPath = path.join(__dirname, '..', 'registries', 'tool-categories.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const schema = loadJson(schemaPath);
  const payload = loadJson(targetPath);
  const validate = ajv.compile(schema);
  if (!validate(payload)) {
    console.error(`Invalid tool-categories.json: ${ajv.errorsText(validate.errors)}`);
    process.exit(1);
  }
  console.log('tool-categories.json valid');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
