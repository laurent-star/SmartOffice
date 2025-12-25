const fs = require('fs');
const path = require('path');
const { DOCS_DIR, EXPECTED_FILES } = require('./validate_n8n_docs');

const NODETYPE_MAP_PATH = path.join(__dirname, '..', 'config', 'n8n-nodeType-map.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'build', 'tmp', 'n8n-docs-parsed.json');

function extractJsonBlock(content) {
  const match = content.match(/```json\n([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`Failed to parse JSON block: ${err.message}`);
  }
}

function loadNodeTypeMap() {
  if (!fs.existsSync(NODETYPE_MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(NODETYPE_MAP_PATH, 'utf8'));
}

function main() {
  const parsed = {};
  const nodeTypeMap = loadNodeTypeMap();

  if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  }

  for (const file of EXPECTED_FILES) {
    const fullPath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const json = extractJsonBlock(content);
    if (!json) {
      throw new Error(`No JSON block found in ${fullPath}`);
    }

    const provider = json.provider || path.basename(file, '.md');
    const nodeType = json.nodeType || nodeTypeMap[provider] || null;
    const resources = json.resources || {};
    parsed[provider] = {
      provider,
      nodeType,
      resources,
      sourceDocs: [path.relative(path.join(__dirname, '..'), fullPath)],
      needsManualSpec: !!(!json.resources || !Object.keys(json.resources).length)
    };
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
  console.log(`Parsed docs written to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { OUTPUT_PATH };
