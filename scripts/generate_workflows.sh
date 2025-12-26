#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Generate tool workflows"
node scripts/generate_tool_workflows.js

echo "==> Validate workflows"
node scripts/validate_workflows.js
node scripts/validate_workflow_nodes.js

echo "OK: workflows generated and validated"
