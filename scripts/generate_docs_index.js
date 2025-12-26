const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "docs", "docs-index.md");

function listFiles(dir, filterFn) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(listFiles(abs, filterFn));
    } else if (entry.isFile()) {
      if (!filterFn || filterFn(abs)) files.push(abs);
    }
  }
  return files;
}

function toRel(abs) {
  return path.relative(repoRoot, abs).replace(/\\/g, "/");
}

const docsDir = path.join(repoRoot, "docs");
const docsFiles = listFiles(docsDir, (file) => {
  if (!file.endsWith(".md")) return false;
  if (file.includes(path.join("docs", "n8n", "raw"))) return false;
  return true;
});

const readmeRoots = [
  "contracts",
  "config",
  "registries",
  "formats",
  "scripts",
  "workflows"
].map((p) => path.join(repoRoot, p));

let readmeFiles = [];
for (const root of readmeRoots) {
  if (!fs.existsSync(root)) continue;
  readmeFiles = readmeFiles.concat(listFiles(root, (file) => path.basename(file) === "README.md"));
}

const lines = [];
lines.push("# Docs Index");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Docs");
docsFiles
  .map(toRel)
  .sort((a, b) => a.localeCompare(b))
  .forEach((rel) => lines.push(`- ${rel}`));

lines.push("");
lines.push("## Readmes");
readmeFiles
  .map(toRel)
  .sort((a, b) => a.localeCompare(b))
  .forEach((rel) => lines.push(`- ${rel}`));

fs.writeFileSync(outputPath, lines.join("\n") + "\n");
console.log(`Docs index written to ${toRel(outputPath)}`);
