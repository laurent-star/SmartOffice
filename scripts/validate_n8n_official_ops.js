const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "contracts", "n8n-official-ops.schema.json");
const registryPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");

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
  const issues = [];

  if (!valid) {
    issues.push({ type: "schema", details: validate.errors });
  }

  const providers = registry.providers || {};
  for (const [provider, providerDef] of Object.entries(providers)) {
    if (!providerDef.nodeType || typeof providerDef.nodeType !== "string") {
      issues.push({ type: "provider", provider, message: "Missing nodeType" });
    }
    const resources = providerDef.resources || {};
    if (!Object.keys(resources).length) {
      issues.push({ type: "provider", provider, message: "No resources declared" });
      continue;
    }

    for (const [resourceName, resourceDef] of Object.entries(resources)) {
      const operations = resourceDef.operations || {};
      if (!Object.keys(operations).length) {
        issues.push({ type: "resource", provider, resource: resourceName, message: "No operations declared" });
        continue;
      }

      for (const [operationName, operationDef] of Object.entries(operations)) {
        const params = operationDef.params || {};
        const requiredParams = params.required || [];
        const optionalParams = params.optional || [];
        const dupRequired = new Set(requiredParams);
        const dupOptional = new Set(optionalParams);
        if (dupRequired.size !== requiredParams.length) {
          issues.push({
            type: "operation",
            provider,
            resource: resourceName,
            operation: operationName,
            message: "Duplicate required params"
          });
        }
        if (dupOptional.size !== optionalParams.length) {
          issues.push({
            type: "operation",
            provider,
            resource: resourceName,
            operation: operationName,
            message: "Duplicate optional params"
          });
        }
        const intersection = requiredParams.filter((p) => optionalParams.includes(p));
        if (intersection.length) {
          issues.push({
            type: "operation",
            provider,
            resource: resourceName,
            operation: operationName,
            message: `Params listed as both required and optional: ${intersection.join(",")}`
          });
        }
      }
    }
  }

  if (issues.length) {
    console.error("Validation failed for n8n-official-ops");
    for (const issue of issues) {
      console.error(JSON.stringify(issue, null, 2));
    }
    process.exit(1);
  }

  console.log("n8n-official-ops registry is valid ✅");
}

main();
