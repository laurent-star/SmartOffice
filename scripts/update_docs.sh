#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Validate and refresh docs"
SKIP_CLEAN=1 bash scripts/validate_all.sh

echo "==> Generate docs index"
node scripts/generate_docs_index.js

echo "OK: docs updated"
