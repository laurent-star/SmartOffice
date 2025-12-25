const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "contracts", "tool-categories.schema.json");
const registryPath = path.join(__dirname, "..", "registries", "tool-categories.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function main() {
  const schema = loadJson(schemaPath);
  const registry = loadJson(registryPath);

  const validate = ajv.compile(schema);
  const valid = validate(registry);

  if (!valid) {
    console.error("Validation failed for tool-categories.json");
    console.error(JSON.stringify(validate.errors, null, 2));
    process.exit(1);
  }

  for (const [category, payload] of Object.entries(registry)) {
    if (!payload.providers.length) {
      console.error(`Category ${category} must list at least one provider`);
      process.exit(1);
    }
    if (!payload.operations.length) {
      console.error(`Category ${category} must list at least one operation`);
      process.exit(1);
    }
  }

  console.log("tool-categories registry is valid ✅");
}

main();
