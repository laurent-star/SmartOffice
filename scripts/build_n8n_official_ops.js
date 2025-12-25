const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const REGISTRY_VERSION = process.env.N8N_OFFICIAL_OPS_VERSION || "1.1.0";
const registryPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");
const fragmentsDir = path.join(__dirname, "..", "registries", "n8n-official-ops");
const registrySchemaPath = path.join(__dirname, "..", "contracts", "n8n-official-ops.schema.json");
const fragmentSchemaPath = path.join(__dirname, "..", "contracts", "n8n-official-ops.fragment.schema.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function formatAjvErrors(errors) {
  return (errors || [])
    .map((err) => `${err.instancePath || err.schemaPath} ${err.message}`.trim())
    .join("; ");
}

function validateOperationParams(provider, resource, operation, operationDef, issues) {
  const params = operationDef.params || {};
  const requiredParams = params.required || [];
  const optionalParams = params.optional || [];

  const dupRequired = new Set(requiredParams);
  const dupOptional = new Set(optionalParams);
  if (dupRequired.size !== requiredParams.length) {
    issues.push({
      type: "operation",
      provider,
      resource,
      operation,
      message: "Duplicate required params"
    });
  }
  if (dupOptional.size !== optionalParams.length) {
    issues.push({
      type: "operation",
      provider,
      resource,
      operation,
      message: "Duplicate optional params"
    });
  }
  const intersection = requiredParams.filter((p) => optionalParams.includes(p));
  if (intersection.length) {
    issues.push({
      type: "operation",
      provider,
      resource,
      operation,
      message: `Params listed as both required and optional: ${intersection.join(",")}`
    });
  }
}

function validateOperationsConsistency(providers) {
  const issues = [];

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
        validateOperationParams(provider, resourceName, operationName, operationDef, issues);
      }
    }
  }

  if (issues.length) {
    const messages = issues.map((issue) => JSON.stringify(issue)).join("\n");
    throw new Error(`Invalid operations detected:\n${messages}`);
  }
}

function buildN8nOfficialOps({ quiet = false } = {}) {
  if (!fs.existsSync(fragmentsDir)) {
    throw new Error(`Fragments directory missing: ${fragmentsDir}`);
  }

  const fragmentSchema = fs.existsSync(fragmentSchemaPath) ? loadJson(fragmentSchemaPath) : null;
  const fragmentValidator = fragmentSchema ? ajv.compile(fragmentSchema) : null;

  const providers = {};
  const docs = new Set();

  const files = fs
    .readdirSync(fragmentsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (!files.length) {
    throw new Error(`No fragments found in ${fragmentsDir}`);
  }

  for (const file of files) {
    const fullPath = path.join(fragmentsDir, file);
    const fragment = loadJson(fullPath);

    if (fragmentValidator) {
      const validFragment = fragmentValidator(fragment);
      if (!validFragment) {
        const details = formatAjvErrors(fragmentValidator.errors);
        throw new Error(`Fragment ${file} is invalid: ${details}`);
      }
    }

    const providerId = fragment.provider;
    if (!providerId) {
      throw new Error(`Fragment ${file} missing provider id`);
    }

    if (providers[providerId]) {
      throw new Error(`Duplicate provider detected: ${providerId}`);
    }

    if (!fragment.nodeType) {
      throw new Error(`Provider ${providerId} missing nodeType`);
    }

    if (!fragment.resources || !Object.keys(fragment.resources).length) {
      throw new Error(`Provider ${providerId} declares no resources`);
    }

    (fragment.sourceDocs || []).forEach((doc) => docs.add(doc));

    providers[providerId] = {
      nodeType: fragment.nodeType,
      resources: fragment.resources
    };
  }

  validateOperationsConsistency(providers);

  const payload = {
    version: REGISTRY_VERSION,
    source: { vendor: "n8n", docs: Array.from(docs).sort() },
    providers
  };

  const registrySchema = loadJson(registrySchemaPath);
  const validateRegistry = ajv.compile(registrySchema);
  const validRegistry = validateRegistry(payload);
  if (!validRegistry) {
    const details = formatAjvErrors(validateRegistry.errors);
    throw new Error(`Assembled registry is invalid: ${details}`);
  }

  fs.writeFileSync(registryPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

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
