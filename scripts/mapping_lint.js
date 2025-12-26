const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yaml = require('js-yaml');
const { loadYaml, mapPayloadToDomain } = require('../engine/mapping/mapper');
const { loadDomain, validateEntity } = require('../engine/mapping/validators');
const { detectRequiredCoverage, detectUnknownTargets } = require('../engine/mapping/detectors');

const DEFAULT_MAPPINGS_DIR = path.resolve(__dirname, '..', 'registries', 'mappings');
const DEFAULT_DOMAINS_DIR = path.resolve(__dirname, '..', 'registries', 'domain');

const parseArguments = (argv) => {
  const options = { ci: false, interactive: false, positional: [] };
  for (const arg of argv) {
    if (arg === '--ci') options.ci = true;
    else if (arg === '--interactive' || arg === '-i') options.interactive = true;
    else options.positional.push(arg);
  }
  return options;
};

const usage = () => {
  console.error('Usage:');
  console.error('  node scripts/mapping_lint.js <mapping.yaml> <domain.yaml> [sample.json]');
  console.error('  node scripts/mapping_lint.js --ci');
  console.error('  node scripts/mapping_lint.js --interactive <mapping.yaml> <domain.yaml> [sample.json]');
};

const loadSample = (samplePath) => {
  if (!samplePath) return null;
  const resolved = path.resolve(samplePath);
  if (!fs.existsSync(resolved)) return null;
  try {
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (err) {
    console.error(`Unable to parse sample at ${samplePath}: ${err.message}`);
    return null;
  }
};

const lintMapping = (mappingPath, domainPath, samplePath) => {
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const missingRequired = detectRequiredCoverage(mapping, domain);
  const unknownTargets = detectUnknownTargets(mapping, domain);
  const sample = loadSample(samplePath);
  const sampleResult = sample
    ? (() => {
        const entity = mapPayloadToDomain(mapping, sample);
        const validationErrors = validateEntity(entity, domain);
        return { entity, validationErrors };
      })()
    : null;

  return { mapping, domain, missingRequired, unknownTargets, sampleResult };
};

const formatReport = (title, result) => {
  const lines = [];
  lines.push(`=== ${title} ===`);
  lines.push(`Mapping: ${result.mapping.source || 'unknown'} → ${result.mapping.domain || 'unknown'}`);
  lines.push(`Domain file: ${result.domainPathRelative}`);
  if (result.missingRequired.length) {
    lines.push(`- Missing required targets: ${result.missingRequired.join(', ')}`);
  } else {
    lines.push('- All required domain fields are mapped');
  }
  if (result.unknownTargets.length) {
    lines.push(`- Unknown targets (not in domain): ${result.unknownTargets.join(', ')}`);
  }
  if (result.sampleResult) {
    lines.push('\n=== Sample mapping preview ===');
    lines.push(JSON.stringify(result.sampleResult.entity, null, 2));
    if (result.sampleResult.validationErrors.length) {
      lines.push('\nValidation errors:');
      for (const err of result.sampleResult.validationErrors) {
        lines.push(`- ${err.field}: ${err.message}`);
      }
    } else {
      lines.push('\nValidation: OK');
    }
  }
  return lines.join('\n');
};

const listMappingFiles = (rootDir) => {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === '_templates') continue;
      files.push(...listMappingFiles(path.join(rootDir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
      files.push(path.join(rootDir, entry.name));
    }
  }
  return files;
};

const resolveDomainPath = (mappingFile, mapping) => {
  const domainName = mapping.domain || path.basename(mappingFile, '.yaml');
  return path.join(DEFAULT_DOMAINS_DIR, `${domainName}.yaml`);
};

const resolveSamplePath = (mapping) => {
  if (!mapping.source) return null;
  const sampleCandidate = path.resolve(__dirname, '..', 'samples', mapping.source, 'payload.example.json');
  return fs.existsSync(sampleCandidate) ? sampleCandidate : null;
};

const writeMappingFile = (mappingPath, mapping) => {
  const sortedFields = (mapping.fields || []).slice().sort((a, b) => a.target.localeCompare(b.target));
  const next = { ...mapping, fields: sortedFields };
  const serialized = yaml.dump(next, { noRefs: true, lineWidth: 120 });
  fs.writeFileSync(mappingPath, serialized, 'utf8');
};

const promptForValue = async (rl, message) => new Promise((resolve) => rl.question(message, (answer) => resolve(answer.trim())));

const applyInteractiveCompletion = async (mappingPath, initialMissing) => {
  if (!process.stdin.isTTY) {
    throw new Error('Interactive mode requires a TTY.');
  }

  const mapping = loadYaml(mappingPath);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let updated = false;

  for (const target of initialMissing) {
    console.log(`- Target "${target}" is required but not mapped.`);
    const sourcePath = await promptForValue(rl, `  Source path to map to "${target}" (leave empty to skip): `);
    const fallbackInput = await promptForValue(rl, `  Fallback value for "${target}" (JSON or text, leave empty to skip): `);
    const converterInput = await promptForValue(rl, `  Converter id/name for "${target}" (optional): `);

    if (!sourcePath && !fallbackInput) {
      console.log(`  Skipping ${target}, no mapping provided.`);
      continue;
    }

    const fieldEntry = { target, required: true };
    if (sourcePath) fieldEntry.source = sourcePath;
    if (fallbackInput) {
      try {
        fieldEntry.fallback = JSON.parse(fallbackInput);
      } catch (err) {
        fieldEntry.fallback = fallbackInput;
      }
    }
    if (converterInput) {
      fieldEntry.converter = { use: converterInput };
    }

    mapping.fields = mapping.fields || [];
    const existingIndex = mapping.fields.findIndex((f) => f.target === target);
    if (existingIndex >= 0) {
      mapping.fields[existingIndex] = { ...mapping.fields[existingIndex], ...fieldEntry };
    } else {
      mapping.fields.push(fieldEntry);
    }
    updated = true;
  }

  rl.close();

  if (updated) {
    writeMappingFile(mappingPath, mapping);
    console.log(`Updated mapping file written to ${path.relative(process.cwd(), mappingPath)}`);
  } else {
    console.log('No changes applied.');
  }
};

const runCi = () => {
  const mappingsDir = process.env.MAPPINGS_DIR ? path.resolve(process.env.MAPPINGS_DIR) : DEFAULT_MAPPINGS_DIR;
  const mappingFiles = listMappingFiles(mappingsDir);
  if (!mappingFiles.length) {
    console.error('No mapping files found.');
    process.exit(1);
  }

  let hasFailures = false;
  for (const mappingFile of mappingFiles) {
    const mapping = loadYaml(mappingFile);
    const domainPath = resolveDomainPath(mappingFile, mapping);
    if (!fs.existsSync(domainPath)) {
      console.error(`Domain file not found for ${mappingFile}: ${domainPath}`);
      hasFailures = true;
      continue;
    }
    const samplePath = resolveSamplePath(mapping);
    const result = lintMapping(mappingFile, domainPath, samplePath);
    const report = formatReport(path.relative(process.cwd(), mappingFile), {
      ...result,
      domainPathRelative: path.relative(process.cwd(), domainPath),
    });
    console.log(report);
    console.log('');
    if (result.missingRequired.length || result.unknownTargets.length || (result.sampleResult && result.sampleResult.validationErrors.length)) {
      hasFailures = true;
    }
  }

  if (hasFailures) {
    console.error('Mapping lint failed. See reports above.');
    process.exit(1);
  }
};

const runSingle = async (options) => {
  const [mappingPath, domainPath, samplePath] = options.positional;
  if (!mappingPath || !domainPath) {
    usage();
    process.exit(1);
  }

  const absoluteMappingPath = path.resolve(mappingPath);
  const absoluteDomainPath = path.resolve(domainPath);
  const result = lintMapping(absoluteMappingPath, absoluteDomainPath, samplePath ? path.resolve(samplePath) : null);
  const report = formatReport('Mapping lint report', {
    ...result,
    domainPathRelative: path.relative(process.cwd(), absoluteDomainPath),
  });
  console.log(report);

  if (options.interactive && result.missingRequired.length) {
    await applyInteractiveCompletion(absoluteMappingPath, result.missingRequired);
    const refreshed = lintMapping(absoluteMappingPath, absoluteDomainPath, samplePath ? path.resolve(samplePath) : null);
    const refreshedReport = formatReport('Updated lint report', {
      ...refreshed,
      domainPathRelative: path.relative(process.cwd(), absoluteDomainPath),
    });
    console.log('\n' + refreshedReport);
  }
};

const main = async () => {
  const options = parseArguments(process.argv.slice(2));
  if (options.ci) {
    runCi();
    return;
  }

  await runSingle(options);
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
