const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");
const contractsDir = "contracts";
const formatsDir = "formats";
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
// Preload schemas
const contractFiles = fs
  .readdirSync(contractsDir)
  .filter((f) => f.endsWith(".schema.json"));
for (const cf of contractFiles) {
  const p = path.join(contractsDir, cf);
  try {
    const s = JSON.parse(fs.readFileSync(p, "utf8"));
    const id = s.$id || cf.replace(".schema.json", "");
    if (!ajv.getSchema(id)) {
      ajv.addSchema(s, id);
      console.log("PRELOADED", id);
    } else {
      console.log("SKIP PRELOAD (already):", id);
    }
  } catch (e) {
    console.log("BAD SCHEMA", p, e.message);
  }
}

let summary = { valid: [], invalid: [], skipped: [], errors: [] };
for (const cf of contractFiles) {
  const base = cf.replace(".schema.json", "");
  const dataPath = path.join(formatsDir, base + ".json");
  if (!fs.existsSync(dataPath)) {
    summary.skipped.push({ file: dataPath, reason: "missing" });
    continue;
  }
  const raw = fs.readFileSync(dataPath, "utf8");
  const trimmed = raw.trim();
  if (trimmed.length < 10 || trimmed === "{}" || trimmed === "[]") {
    summary.skipped.push({ file: dataPath, reason: "empty_or_small" });
    continue;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    summary.errors.push({ file: dataPath, error: e.message });
    continue;
  }
  try {
    const schema = JSON.parse(
      fs.readFileSync(path.join(contractsDir, cf), "utf8")
    );
    let validate;
    if (schema.$id && ajv.getSchema(schema.$id)) {
      validate = ajv.getSchema(schema.$id);
    } else {
      validate = ajv.compile(schema);
    }
    const ok = validate(data);
    if (ok) {
      console.log("VALID", dataPath, "against", cf);
      summary.valid.push(dataPath);
    } else {
      console.log("INVALID", dataPath, "against", cf);
      console.log(JSON.stringify(validate.errors, null, 2));
      summary.invalid.push({ file: dataPath, errors: validate.errors });
    }
  } catch (e) {
    console.log("ERROR", dataPath, e.message);
    summary.errors.push({ file: dataPath, error: e.message });
  }
}
console.log(
  "\nSUMMARY:",
  "valid=",
  summary.valid.length,
  "invalid=",
  summary.invalid.length,
  "skipped=",
  summary.skipped.length,
  "errors=",
  summary.errors.length
);
