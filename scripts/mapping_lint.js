const fs = require('fs');
const path = require('path');
const { loadYaml, mapPayloadToDomain } = require('../engine/mapping/mapper');
const { loadDomain, validateEntity } = require('../engine/mapping/validators');
const { detectRequiredCoverage, detectUnknownTargets } = require('../engine/mapping/detectors');

const [,, mappingPath, domainPath, samplePath] = process.argv;

if (!mappingPath || !domainPath) {
  console.error('Usage: node scripts/mapping_lint.js <mapping.yaml> <domain.yaml> [sample.json]');
  process.exit(1);
}

const mapping = loadYaml(mappingPath);
const domain = loadDomain(domainPath);

const missingRequired = detectRequiredCoverage(mapping, domain);
const unknownTargets = detectUnknownTargets(mapping, domain);

console.log('=== Mapping lint report ===');
console.log(`Mapping: ${mapping.source || 'unknown'} → ${mapping.domain || 'unknown'}`);
console.log(`Domain file: ${path.relative(process.cwd(), domainPath)}`);
if (missingRequired.length) {
  console.log(`- Missing required targets: ${missingRequired.join(', ')}`);
} else {
  console.log('- All required domain fields are mapped');
}
if (unknownTargets.length) {
  console.log(`- Unknown targets (not in domain): ${unknownTargets.join(', ')}`);
}

if (samplePath) {
  const sample = JSON.parse(fs.readFileSync(path.resolve(samplePath), 'utf8'));
  const entity = mapPayloadToDomain(mapping, sample);
  const validationErrors = validateEntity(entity, domain);
  console.log('\n=== Sample mapping preview ===');
  console.log(JSON.stringify(entity, null, 2));
  if (validationErrors.length) {
    console.log('\nValidation errors:');
    for (const err of validationErrors) {
      console.log(`- ${err.field}: ${err.message}`);
    }
  } else {
    console.log('\nValidation: OK');
  }
}
