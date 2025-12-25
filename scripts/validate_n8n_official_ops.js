const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { buildN8nOfficialOps } = require("./build_n8n_official_ops");

const registryPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");
const registrySchemaPath = path.join(__dirname, "..", "contracts", "n8n-official-ops.schema.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateOperationsConsistency(registry) {
  const issues = [];

  for (const [provider, providerDef] of Object.entries(registry.providers || {})) {
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

  return issues;
}

function main() {
  try {
    buildN8nOfficialOps({ quiet: true });
  } catch (err) {
    console.error("Failed to build n8n-official-ops registry from fragments:");
    console.error(err.message);
    process.exit(1);
  }

  const schema = loadJson(registrySchemaPath);
  const registry = loadJson(registryPath);

  const validate = ajv.compile(schema);
  const valid = validate(registry);
  const issues = [];

  if (!valid) {
    issues.push({ type: "schema", details: validate.errors });
  }

  issues.push(...validateOperationsConsistency(registry));

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
