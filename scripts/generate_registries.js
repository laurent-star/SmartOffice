const fs = require("fs");
const path = require("path");
const { buildN8nOfficialOps } = require("./build_n8n_official_ops");

const toolsDir = path.join(__dirname, "..", "config", "tools");
const registryPath = path.join(__dirname, "..", "registries", "n8n-official-ops.json");
const categoriesPath = path.join(__dirname, "..", "registries", "tool-categories.json");
const toolsRegistryPath = path.join(__dirname, "..", "registries", "tools.json");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureOfficialOps() {
  try {
    buildN8nOfficialOps({ quiet: true });
  } catch (err) {
    console.error("Unable to build n8n-official-ops registry:");
    console.error(err.message);
    process.exit(1);
  }
}

function buildAllowedOperations(officialOps) {
  const map = {};
  for (const [provider, providerDef] of Object.entries(officialOps.providers || {})) {
    const allowed = new Set();
    for (const [resourceName, resourceDef] of Object.entries(providerDef.resources || {})) {
      for (const operationName of Object.keys(resourceDef.operations || {})) {
        allowed.add(`${resourceName}.${operationName}`);
      }
    }
    map[provider] = allowed;
  }
  return map;
}

function generate() {
  ensureOfficialOps();

  const officialOps = loadJson(registryPath);
  const allowedOpsByProvider = buildAllowedOperations(officialOps);

  const toolFiles = fs
    .readdirSync(toolsDir)
    .filter((f) => f.endsWith(".tool.json"))
    .sort();

  const categories = {};
  const tools = [];
  const errors = [];

  for (const file of toolFiles) {
    const fullPath = path.join(toolsDir, file);
    const tool = loadJson(fullPath);

    if (!Array.isArray(tool.categories) || !tool.categories.length) {
      errors.push({ file, message: "Missing categories" });
    }

    if (!Array.isArray(tool.actions) || !tool.actions.length) {
      errors.push({ file, message: "Aucun action definie" });
      continue;
    }

    const provider = tool.id;
    if (!allowedOpsByProvider[provider]) {
      errors.push({ file, message: `Provider ${provider} absent de n8n-official-ops` });
      continue;
    }

    for (const action of tool.actions) {
      if (!action.name) {
        errors.push({ file, message: "Action sans nom" });
        continue;
      }
      const isSampleFetch = action.name === "sampleFetch";
      if (!isSampleFetch && !allowedOpsByProvider[provider].has(action.name)) {
        errors.push({
          file,
          message: `Action ${action.name} non referencee pour ${provider}`
        });
      }
      if (Array.isArray(tool.categories)) {
        for (const category of tool.categories) {
          if (!category) continue;
          if (!categories[category]) {
            categories[category] = { providers: new Set(), operations: new Set() };
          }
          categories[category].providers.add(provider);
          categories[category].operations.add(`${category}.${action.name}`);
        }
      }
    }

    tools.push({
      id: tool.id,
      version: tool.version,
      description: tool.description,
      categories: tool.categories,
      path: `config/tools/${file}`,
      actions: tool.actions.map((a) => ({ name: a.name, input: a.input, output: a.output }))
    });
  }

  if (errors.length) {
    console.error("Incoherences detectees lors de la generation des registries:");
    for (const err of errors) {
      console.error(JSON.stringify(err, null, 2));
    }
    process.exit(1);
  }

  const categoriesPayload = Object.keys(categories)
    .sort()
    .reduce((acc, category) => {
      acc[category] = {
        providers: Array.from(categories[category].providers).sort(),
        operations: Array.from(categories[category].operations).sort()
      };
      return acc;
    }, {});

  fs.writeFileSync(categoriesPath, `${JSON.stringify(categoriesPayload, null, 2)}\n`, "utf8");

  const toolsPayload = tools.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(toolsRegistryPath, `${JSON.stringify(toolsPayload, null, 2)}\n`, "utf8");

  console.log("Registries generated successfully ✅");
}

generate();
