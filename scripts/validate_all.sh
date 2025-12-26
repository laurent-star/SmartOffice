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

echo "OK: validation complete"
