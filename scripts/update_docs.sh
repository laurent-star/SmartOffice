#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

majdoc="false"
for arg in "$@"; do
  case "$arg" in
    --majdoc)
      majdoc="true"
      ;;
    *)
      ;;
  esac
done

echo "==> Validate and refresh docs"
if [[ "$majdoc" == "true" ]]; then
  SKIP_CLEAN=1 bash scripts/validate_all.sh
else
  SKIP_CLEAN=1 SKIP_FETCH=1 bash scripts/validate_all.sh
fi

echo "==> Generate docs index"
node scripts/generate_docs_index.js

echo "OK: docs updated"
