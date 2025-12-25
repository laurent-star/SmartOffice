const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "..", "config", "tools");
const registriesDir = path.join(__dirname, "..", "registries");
const opsPath = path.join(registriesDir, "n8n-official-ops.json");

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function buildAllowedOperations(ops) {
  const map = {};
  for (const [provider, def] of Object.entries(ops.providers || {})) {
    const allowed = new Set();
    for (const [resource, resourceDef] of Object.entries(def.resources || {})) {
      for (const opName of Object.keys(resourceDef.operations || {})) {
        allowed.add(`${resource}.${opName}`);
      }
    }
    map[provider] = allowed;
  }
  return map;
}

function main() {
  const ops = loadJson(opsPath);
  const allowedOps = buildAllowedOperations(ops);

  const toolsFiles = fs
    .readdirSync(toolsDir)
    .filter((f) => f.endsWith(".tool.json"))
    .sort();

  const errors = [];
  const categories = {};
  const toolsRegistry = [];

  for (const file of toolsFiles) {
    const toolPath = path.join(toolsDir, file);
    const tool = loadJson(toolPath);

    if (!tool.category) {
      errors.push(`Tool ${tool.id} missing category`);
    }
    if (!Array.isArray(tool.actions) || tool.actions.length === 0) {
      errors.push(`Tool ${tool.id} must declare at least one action`);
      continue;
    }
    if (!allowedOps[tool.id]) {
      errors.push(`Provider ${tool.id} not found in n8n-official-ops`);
      continue;
    }

    const allowed = allowedOps[tool.id];
    for (const action of tool.actions) {
      const opName = action.name;
      if (!allowed.has(opName)) {
        errors.push(`Action ${tool.id}:${opName} not declared in n8n-official-ops`);
      }
      if (!categories[tool.category]) {
        categories[tool.category] = { providers: new Set(), operations: new Set() };
      }
      categories[tool.category].providers.add(tool.id);
      categories[tool.category].operations.add(`${tool.category}.${opName}`);
    }

    toolsRegistry.push({
      id: tool.id,
      version: tool.version,
      description: tool.description,
      category: tool.category,
      path: `config/tools/${file}`,
      actions: tool.actions
    });
  }

  if (errors.length) {
    console.error("Inconsistencies detected:");
    for (const err of errors) {
      console.error("-", err);
    }
    process.exit(1);
  }

  const categoriesPayload = { version: ops.version || "1.0.0", categories: {} };
  for (const [category, info] of Object.entries(categories)) {
    const providers = Array.from(info.providers).sort();
    const operations = Array.from(info.operations).sort();
    categoriesPayload.categories[category] = { providers, operations };
  }

  fs.writeFileSync(
    path.join(registriesDir, "tool-categories.json"),
    JSON.stringify(categoriesPayload, null, 2) + "\n"
  );

  fs.writeFileSync(
    path.join(registriesDir, "tools.json"),
    JSON.stringify(toolsRegistry, null, 2) + "\n"
  );

  console.log("Registries generated successfully.");
}

main();
