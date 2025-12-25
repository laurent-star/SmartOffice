const fs = require('fs');
const path = require('path');

const EXPECTED_FILES = [
  'slack.md',
  'gmail.md',
  'google-drive.md',
  'google-docs.md',
  'google-sheets.md',
  'google-calendar.md',
  'monday.md',
  'openai.md',
  'brevo.md',
  'axonaut.md'
];

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'n8n', 'raw');
const marker = process.env.N8N_DOC_MARKER || /Operations?/i;

function main() {
  const issues = [];

  for (const file of EXPECTED_FILES) {
    const fullPath = path.join(DOCS_DIR, file);
    if (!fs.existsSync(fullPath)) {
      issues.push(`Missing doc file: ${fullPath}`);
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (!stat.size) {
      issues.push(`Doc file is empty: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    if (!marker.test(content)) {
      issues.push(`Doc file missing operation marker: ${fullPath}`);
    }
  }

  if (issues.length) {
    issues.forEach((issue) => console.error(issue));
    process.exit(1);
  }

  console.log('n8n raw docs look OK');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { EXPECTED_FILES, DOCS_DIR };
