const fs = require('fs');
const path = require('path');
const { buildN8nOfficialOps } = require('./build_n8n_official_ops');

const categoriesMapPath = path.join(__dirname, '..', 'config', 'provider-category.map.json');
const capabilitiesPath = path.join(__dirname, '..', 'registries', 'capabilities.json');
const outputPath = path.join(__dirname, '..', 'registries', 'tools.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const ops = buildN8nOfficialOps({ quiet: true });
  const categoryMap = loadJson(categoriesMapPath);
  const capabilities = loadJson(capabilitiesPath);

  const tools = Object.keys(ops.providers)
    .sort()
    .map((provider) => {
      const category = categoryMap[provider];
      if (!category) {
        throw new Error(`Category missing for provider ${provider}`);
      }
      const providerDef = ops.providers[provider];
      const actions = [];
      for (const [resource, resourceDef] of Object.entries(providerDef.resources)) {
        for (const operation of Object.keys(resourceDef.operations)) {
          actions.push(`${resource}.${operation}`);
        }
      }
      actions.sort();
      const providerCapabilities = capabilities
        .filter((cap) => cap.operations.some((op) => op.startsWith(`${provider}.`)))
        .map((cap) => cap.key)
        .sort();

      return {
        id: provider,
        nodeType: providerDef.nodeType,
        category,
        actions,
        capabilities: Array.from(new Set(providerCapabilities))
      };
    });

  fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2) + '\n', 'utf8');
  console.log('tools registry generated');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
