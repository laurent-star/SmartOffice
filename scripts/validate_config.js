const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const contractsDir = "contracts";
const configs = [
  { dir: "config/tools", ext: ".tool.json", schemaId: "https://smart-office.local/schemas/tool-definition.schema.json" },
  { dir: "config/capabilities", ext: ".capability.json", schemaId: "https://smart-office.local/schemas/capability.schema.json" },
  { dir: "config/use-cases", ext: ".usecase.json", schemaId: "https://smart-office.local/schemas/usecase.schema.json" },
  { dir: "config/agent", ext: "planning_rules.json", schemaId: "https://smart-office.local/schemas/agent-planning.schema.json" },
  { dir: "config/agent", ext: "tool_selection.json", schemaId: "https://smart-office.local/schemas/agent-tool-selection.schema.json" }
];

const contractFiles = fs
  .readdirSync(contractsDir)
  .filter((f) => f.endsWith(".schema.json"));

for (const cf of contractFiles) {
  const p = path.join(contractsDir, cf);
  const s = JSON.parse(fs.readFileSync(p, "utf8"));
  const id = s.$id || cf.replace(".schema.json", "");
  if (!ajv.getSchema(id)) {
    ajv.addSchema(s, id);
  }
}

const summary = { valid: [], invalid: [], errors: [] };

for (const cfg of configs) {
  const files = fs
    .readdirSync(cfg.dir)
    .filter((f) => f.endsWith(cfg.ext));
  const validate = ajv.getSchema(cfg.schemaId);
  if (!validate) {
    summary.errors.push({ file: cfg.dir, error: `Missing schema ${cfg.schemaId}` });
    continue;
  }
  for (const file of files) {
    const dataPath = path.join(cfg.dir, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (e) {
      summary.errors.push({ file: dataPath, error: e.message });
      continue;
    }
    const ok = validate(data);
    if (ok) {
      summary.valid.push(dataPath);
    } else {
      summary.invalid.push({ file: dataPath, errors: validate.errors });
    }
  }
}

if (summary.invalid.length) {
  for (const item of summary.invalid) {
    console.log("INVALID", item.file);
    console.log(JSON.stringify(item.errors, null, 2));
  }
}
if (summary.errors.length) {
  for (const item of summary.errors) {
    console.log("ERROR", item.file, item.error);
  }
}

console.log(
  "\nSUMMARY:",
  "valid=",
  summary.valid.length,
  "invalid=",
  summary.invalid.length,
  "errors=",
  summary.errors.length
);

process.exit(summary.invalid.length || summary.errors.length ? 1 : 0);
