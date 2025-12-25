#!/usr/bin/env bash
set -euo pipefail

BUILD_AFTER_FETCH=""
OVERWRITE_RAW="false"
REBUILD_RAW="false"

for arg in "$@"; do
  case "$arg" in
    --build)
      BUILD_AFTER_FETCH="--build"
      ;;
    --overwrite-raw)
      OVERWRITE_RAW="true"
      ;;
    --rebuild-raw)
      REBUILD_RAW="true"
      ;;
    *)
      ;;
  esac
done

HTML_DIR="docs/n8n/html"
HUMAN_DIR="docs/n8n/human"
RAW_DIR="docs/n8n/raw"
SOURCES_FILE="docs/n8n/sources.md"
mkdir -p "$HTML_DIR"
mkdir -p "$HUMAN_DIR"

CORE_WORKFLOW_DOCS=(
  "workflows|https://docs.n8n.io/workflows/"
  "workflows-export-import|https://docs.n8n.io/workflows/export-import/"
)

CORE_EXEC_DOCS=(
  "flow-error-handling|https://docs.n8n.io/flow-logic/error-handling/"
  "node-error-trigger|https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/"
  "node-webhook|https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
  "node-webhook-common-issues|https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/"
  "node-respond-to-webhook|https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/"
)

CORE_EXPR_DOCS=(
  "expressions|https://docs.n8n.io/code/expressions/"
  "expressions-data-mapping|https://docs.n8n.io/data/data-mapping/data-mapping-expressions/"
  "expressions-common-issues|https://docs.n8n.io/code/cookbook/expressions/common-issues/"
  "code-node|https://docs.n8n.io/code/code-node/"
)

CONNECTOR_DOCS=(
  "slack|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/"
  "gmail|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/"
  "google-drive|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/"
  "google-docs|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledocs/"
  "google-sheets|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/"
  "google-calendar|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/"
  "monday|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom/"
  "openai|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/"
  "brevo|https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.brevo/"
  "axonaut|https://docs.n8n.io/integrations/third-party/axonaut/"
)

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required but not installed." >&2
  exit 1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc is required but not installed." >&2
  exit 1
fi

if [[ "$OVERWRITE_RAW" == "true" || "$REBUILD_RAW" == "true" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "node is required but not installed." >&2
    exit 1
  fi
fi

cat > "$SOURCES_FILE" <<EOF
# Sources n8n

Mise a jour: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Core workflows & structure

EOF

for entry in "${CORE_WORKFLOW_DOCS[@]}"; do
  name="${entry%%|*}"
  url="${entry#*|}"
  echo "- $name: $url" >> "$SOURCES_FILE"
done

cat >> "$SOURCES_FILE" <<EOF

## Execution / run data / error handling

EOF

for entry in "${CORE_EXEC_DOCS[@]}"; do
  name="${entry%%|*}"
  url="${entry#*|}"
  echo "- $name: $url" >> "$SOURCES_FILE"
done

cat >> "$SOURCES_FILE" <<EOF

## Expressions & data mapping

EOF

for entry in "${CORE_EXPR_DOCS[@]}"; do
  name="${entry%%|*}"
  url="${entry#*|}"
  echo "- $name: $url" >> "$SOURCES_FILE"
done

cat >> "$SOURCES_FILE" <<EOF

## Connecteurs

EOF

for entry in "${CONNECTOR_DOCS[@]}"; do
  name="${entry%%|*}"
  url="${entry#*|}"
  echo "Fetching $name…"

  curl -L "$url" -o "$HTML_DIR/$name.html"

  pandoc -f html -t markdown \
    --strip-comments \
    --wrap=none \
    "$HTML_DIR/$name.html" \
    -o "$HUMAN_DIR/$name.md"

  if [[ "$OVERWRITE_RAW" == "true" || "$REBUILD_RAW" == "true" ]]; then
    mkdir -p "$RAW_DIR"
    PROVIDER="$name" SOURCE_URL="$url" RAW_DIR="$RAW_DIR" node <<'NODE'
const fs = require('fs');
const path = require('path');

const provider = process.env.PROVIDER;
const sourceUrl = process.env.SOURCE_URL;
const rawDir = process.env.RAW_DIR;
const fragmentPath = path.join('registries', 'n8n-official-ops', provider + '.json');

if (!fs.existsSync(fragmentPath)) {
  console.error('Missing fragment:', fragmentPath);
  process.exit(1);
}

const fragment = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'));
const payload = {
  provider: fragment.provider,
  nodeType: fragment.nodeType,
  resources: fragment.resources
};

const md = [
  `# n8n ${provider} (structured)`,
  '',
  '```json',
  JSON.stringify(payload, null, 2),
  '```',
  '',
  `Source: ${sourceUrl}`
].join('\n');

fs.writeFileSync(path.join(rawDir, `${provider}.md`), `${md}\n`);
NODE
  fi

  echo "- $name: $url" >> "$SOURCES_FILE"
done

echo "n8n docs downloaded successfully."
echo "Sources updated: $SOURCES_FILE"

if [[ "$BUILD_AFTER_FETCH" == "--build" ]]; then
  echo "Running pipeline to refactor registries and workflows..."
  npm run docs:validate:n8n
  npm run ops:parse
  npm run ops:fragments
  npm run ops:build
  npm run ops:validate
fi
