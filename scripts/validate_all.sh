#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Update repo"
git pull --ff-only

echo "==> Refresh n8n docs"
./scripts/fetch_n8n_docs.sh --build --rebuild-raw

echo "==> Validate contracts/formats"
NODE_PATH=./node_modules node scripts/validate_contracts_preload.js

echo "==> Validate config and cross-refs"
node scripts/validate_config.js
node scripts/validate_cross_refs.js

echo "==> Validate workflows"
node scripts/validate_workflows.js
node scripts/validate_workflow_nodes.js

echo "==> Audit: detect redundant/unused/inconsistent files"
audit_dir="$(mktemp -d)"
trap 'rm -rf "$audit_dir"' EXIT

all_files="$audit_dir/all_files.txt"
find "$repo_root/docs" \
  "$repo_root/workflows" \
  "$repo_root/config" \
  "$repo_root/registries" \
  "$repo_root/formats" \
  "$repo_root/contracts" \
  "$repo_root/scripts" \
  -type f \
  ! -path "*/.git/*" \
  ! -path "*/node_modules/*" \
  ! -path "*/bundle-chatgpt/*" \
  ! -path "*/build/*" \
  > "$all_files"

not_in_readme="$audit_dir/not_in_readme.txt"
not_in_docs="$audit_dir/not_in_docs.txt"
invalid_json="$audit_dir/invalid_json.txt"
unused_utils="$audit_dir/unused_utils.txt"
dupe_unreferenced="$audit_dir/dupe_unreferenced.txt"

is_referenced_in_readme() {
  rg -l --fixed-strings "$1" -g "README*.md" >/dev/null 2>&1
}

is_referenced_in_docs() {
  rg -l --fixed-strings "$1" docs -g "*.md" >/dev/null 2>&1
}

is_referenced_in_scripts_or_workflows() {
  rg -l --fixed-strings "$1" scripts workflows -g "*.js" -g "*.sh" -g "*.workflow.json" >/dev/null 2>&1
}

while IFS= read -r file; do
  rel="${file#$repo_root/}"
  if ! is_referenced_in_readme "$rel" && ! is_referenced_in_scripts_or_workflows "$rel"; then
    echo "$rel" >> "$not_in_readme"
  fi
  if ! is_referenced_in_docs "$rel" && ! is_referenced_in_scripts_or_workflows "$rel"; then
    echo "$rel" >> "$not_in_docs"
  fi
done < "$all_files"

while IFS= read -r file; do
  rel="${file#$repo_root/}"
  if [[ "$file" == *.json ]]; then
    if ! node -e "JSON.parse(require('fs').readFileSync('$file','utf8'))" >/dev/null 2>&1; then
      if ! is_referenced_in_scripts_or_workflows "$rel"; then
        echo "$rel" >> "$invalid_json"
      fi
    fi
  fi
done < "$all_files"

node <<'NODE' > "$unused_utils" || true
const fs = require("fs");
const path = require("path");

function listWorkflows(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(listWorkflows(abs));
    else if (entry.isFile() && abs.endsWith(".workflow.json")) files.push(abs);
  }
  return files;
}

const root = process.cwd();
const utilsDir = path.join(root, "workflows", "utils");
if (!fs.existsSync(utilsDir)) process.exit(0);

const utilFiles = listWorkflows(utilsDir);
const utilNames = new Map();
for (const file of utilFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (data && data.name) utilNames.set(data.name, file);
  } catch (err) {
    continue;
  }
}

const workflowFiles = listWorkflows(path.join(root, "workflows"))
  .filter((f) => !f.includes(path.join("workflows", "utils")));

const used = new Set();
for (const file of workflowFiles) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    continue;
  }
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  for (const node of nodes) {
    if (node.type !== "n8n-nodes-base.executeWorkflow") continue;
    const params = node.parameters || {};
    const candidate = [
      params.workflowId,
      params.workflowName,
      params.workflowId && params.workflowId.value,
      params.workflowId && params.workflowId.name,
      params.workflowId && params.workflowId.id
    ].find((value) => typeof value === "string");
    if (candidate) used.add(candidate);
  }
}

for (const [name, file] of utilNames.entries()) {
  if (!used.has(name)) {
    console.log(path.relative(root, file));
  }
}
NODE

if [[ -s "$all_files" ]]; then
  tr '\n' '\0' < "$all_files" | xargs -0 shasum -a 256 | sort > "$audit_dir/hashes.txt"
  awk '
    {
      h=$1; f=$2;
      if (!seen[h]++) { files[h]=f; next }
      files[h]=files[h] "|" f
    }
    END {
      for (h in files) {
        n=split(files[h], arr, "|");
        if (n>1) {
          for (i=2;i<=n;i++) print arr[i];
        }
      }
    }
  ' "$audit_dir/hashes.txt" | while IFS= read -r rel; do
    if ! is_referenced_in_scripts_or_workflows "$rel"; then
      echo "$rel" >> "$dupe_unreferenced"
    fi
  done
fi

report_dir="audit-reports/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$report_dir"
report_file="$report_dir/audit-report.txt"

{
  echo "==> Audit report"
  for list in "$not_in_readme" "$not_in_docs" "$invalid_json" "$unused_utils" "$dupe_unreferenced"; do
    if [[ -s "$list" ]]; then
      echo "-- ${list##*/}"
      sort -u "$list"
    fi
  done
} | tee "$report_file"

cp "$not_in_readme" "$not_in_docs" "$invalid_json" "$unused_utils" "$dupe_unreferenced" "$report_dir" 2>/dev/null || true
echo "==> Audit logs saved to $report_dir"

to_delete="$audit_dir/to_delete.txt"
cat "$not_in_readme" "$not_in_docs" "$invalid_json" "$unused_utils" "$dupe_unreferenced" 2>/dev/null | sort -u > "$to_delete"

if [[ -s "$to_delete" ]]; then
  echo "==> Clean candidates"
  cat "$to_delete"
  if [[ "${SKIP_CLEAN:-}" == "1" ]]; then
    echo "==> Clean skipped (SKIP_CLEAN=1)"
  else
    read -r -p "Proceed with clean (delete files + empty dirs)? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      while IFS= read -r rel; do
        rm -f "$repo_root/$rel"
      done < "$to_delete"
      find "$repo_root/docs" "$repo_root/workflows" "$repo_root/config" "$repo_root/registries" \
        "$repo_root/formats" "$repo_root/contracts" "$repo_root/scripts" -type d -empty -delete
    fi
  fi
fi

echo "OK: validation complete"
