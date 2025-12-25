const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const expectedWorkflows = [
  'slack',
  'gmail',
  'google-drive',
  'google-docs',
  'google-sheets',
  'google-calendar',
  'monday',
  'openai',
  'brevo',
  'axonaut'
];

function ensureExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing expected file: ${filePath}`);
  }
}

function main() {
  execSync('npm run build:tools', { stdio: 'inherit' });

  ensureExists(path.join(__dirname, '..', 'registries', 'n8n-official-ops.json'));
  ensureExists(path.join(__dirname, '..', 'registries', 'tool-categories.json'));
  ensureExists(path.join(__dirname, '..', 'registries', 'capabilities.json'));

  const workflowsDir = path.join(__dirname, '..', 'workflows', 'tools');
  expectedWorkflows.forEach((id) => {
    ensureExists(path.join(workflowsDir, `${id}.workflow.json`));
  });

  console.log('smoke_build_tools: OK');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
