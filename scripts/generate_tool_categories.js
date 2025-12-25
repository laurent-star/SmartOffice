const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "..", "config", "tools");
const categoriesPath = path.join(__dirname, "..", "registries", "tool-categories.json");

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const toolFiles = fs
  .readdirSync(toolsDir)
  .filter((f) => f.endsWith(".tool.json"))
  .sort();

const categories = {};

for (const file of toolFiles) {
  const tool = loadJson(path.join(toolsDir, file));
  if (!tool.category) continue;
  if (!categories[tool.category]) {
    categories[tool.category] = { providers: new Set(), operations: new Set() };
  }
  categories[tool.category].providers.add(tool.id);
  (tool.actions || []).forEach((action) => {
    if (action && action.name) {
      categories[tool.category].operations.add(`${tool.category}.${action.name}`);
    }
  });
}

const payload = Object.keys(categories)
  .sort()
  .reduce((acc, category) => {
    acc[category] = {
      providers: Array.from(categories[category].providers).sort(),
      operations: Array.from(categories[category].operations).sort()
    };
    return acc;
  }, {});

fs.writeFileSync(categoriesPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log("tool-categories registry generated ✅");
