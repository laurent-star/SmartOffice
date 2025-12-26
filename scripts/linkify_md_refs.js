const fs = require("fs");
const path = require("path");

const root = process.cwd();
const includeRoots = [
  path.join(root, "README.md"),
  path.join(root, "docs"),
  path.join(root, "config"),
  path.join(root, "workflows")
];
const excludeDirs = [
  path.join(root, "docs", "n8n", "human"),
  path.join(root, "docs", "n8n", "raw"),
  path.join(root, "workflows", "utils"),
  path.join(root, "bundle-chatgpt"),
  path.join(root, "node_modules")
];

function isExcluded(p) {
  return excludeDirs.some((dir) => p.startsWith(dir));
}

function listMd(target) {
  const out = [];
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    if (target.endsWith(".md")) out.push(target);
    return out;
  }
  if (!fs.existsSync(target)) return out;
  for (const ent of fs.readdirSync(target, { withFileTypes: true })) {
    const p = path.join(target, ent.name);
    if (isExcluded(p)) continue;
    if (ent.isDirectory()) out.push(...listMd(p));
    else if (ent.isFile() && p.endsWith(".md")) out.push(p);
  }
  return out;
}

function linkify(line) {
  let sanitized = line;
  let prev;
  do {
    prev = sanitized;
    sanitized = sanitized.replace(/\[(\[[^\]]+\]\([^)]+\))\]\([^)]+\)/g, "$1");
  } while (sanitized !== prev);
  line = sanitized;

  let out = "";
  let i = 0;
  const re = /[A-Za-z0-9_./-]+\.md/g;
  const linkSpans = [];
  const linkRe = /\[[^\]]*\]\([^)]+\)/g;
  let linkMatch;
  while ((linkMatch = linkRe.exec(line))) {
    const linkStart = linkMatch.index;
    const linkEnd = linkStart + linkMatch[0].length;
    const labelStart = line.indexOf("[", linkStart) + 1;
    const labelEnd = line.indexOf("]", labelStart);
    const urlStart = line.indexOf("(", labelEnd) + 1;
    const urlEnd = line.indexOf(")", urlStart);
    if (labelStart > 0 && labelEnd > labelStart) {
      linkSpans.push([labelStart, labelEnd]);
    }
    if (urlStart > 0 && urlEnd > urlStart) {
      linkSpans.push([urlStart, urlEnd]);
    }
    if (linkEnd <= linkRe.lastIndex) continue;
  }
  let m;
  while ((m = re.exec(line))) {
    const start = m.index;
    const end = start + m[0].length;
    const before = line.slice(0, start);
    const inCode = (before.split("`").length - 1) % 2 === 1;
    const prevTwo = line.slice(start - 2, start);
    const inLink = linkSpans.some(([s, e]) => start >= s && end <= e);
    if (inCode || prevTwo === "](" || inLink) continue;
    out += line.slice(i, start) + `[${m[0]}](${m[0]})`;
    i = end;
  }
  out += line.slice(i);
  return out;
}

const files = includeRoots.flatMap(listMd);
let updated = 0;
for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");
  let inFence = false;
  let changed = false;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const newLine = linkify(line);
    if (newLine !== line) {
      lines[idx] = newLine;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join("\n"));
    console.log("updated", rel);
    updated += 1;
  }
}

console.log(`Markdown linkify updated ${updated} file(s).`);
