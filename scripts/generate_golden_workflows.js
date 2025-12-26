const fs = require('fs');
const path = require('path');

const goldenDir = path.join(__dirname, '..', 'workflows', 'golden');

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function main() {
  if (!fs.existsSync(goldenDir)) {
    fs.mkdirSync(goldenDir, { recursive: true });
  }

  const files = fs.readdirSync(goldenDir).filter((file) => file.endsWith('.json'));

  for (const file of files) {
    const fullPath = path.join(goldenDir, file);
    const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    saveJson(fullPath, payload);
  }

  console.log(`Normalized ${files.length} golden workflow(s).`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
