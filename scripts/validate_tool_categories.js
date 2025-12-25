const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const schemaPath = path.join(__dirname, "..", "contracts", "tool-categories.schema.json");
const dataPath = path.join(__dirname, "..", "registries", "tool-categories.json");

const ajv = new Ajv({ allErrors: true, strict: false });
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const valid = validate(data);

if (!valid) {
  console.error("tool-categories.json does not match schema");
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

const errors = [];
for (const [category, info] of Object.entries(data.categories || {})) {
  if (!info.providers.length) {
    errors.push(`Category ${category} has no providers`);
  }
  if (!info.operations.length) {
    errors.push(`Category ${category} has no operations`);
  }
  const providersSorted = [...info.providers].sort();
  const operationsSorted = [...info.operations].sort();
  if (providersSorted.join("|") !== info.providers.join("|")) {
    errors.push(`Category ${category} providers must be sorted and unique`);
  }
  if (operationsSorted.join("|") !== info.operations.join("|")) {
    errors.push(`Category ${category} operations must be sorted and unique`);
  }
}

if (errors.length) {
  console.error("Validation errors:");
  for (const err of errors) {
    console.error("-", err);
  }
  process.exit(1);
}

console.log("tool-categories.json is valid and consistent");
