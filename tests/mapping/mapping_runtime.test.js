const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadYaml, mapPayloadToDomain } = require('../../engine/mapping/mapper');
const { loadDomain, validateEntity } = require('../../engine/mapping/validators');
const { detectUnknownTargets } = require('../../engine/mapping/detectors');

const readSample = (source) => {
  const samplePath = path.join(__dirname, '../../samples', source, 'payload.example.json');
  return JSON.parse(fs.readFileSync(samplePath, 'utf8'));
};

const buildPaths = (source, domain) => ({
  mappingPath: path.join(__dirname, `../../registries/mappings/${source}/${domain}.yaml`),
  domainPath: path.join(__dirname, `../../registries/domain/${domain}.yaml`),
});

test('monday mapping produces normalized project entity', () => {
  const { mappingPath, domainPath } = buildPaths('monday', 'project');
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const payload = readSample('monday');

  const entity = mapPayloadToDomain(mapping, payload);
  const validationErrors = validateEntity(entity, domain);

  assert.deepStrictEqual(entity, {
    id: 'itm-1234',
    name: 'Website redesign',
    client_id: 'client-42',
    status: 'in_progress',
    start_date: '2024-11-01T00:00:00.000Z',
    due_date: '2024-12-15T00:00:00.000Z',
    owner: 'pm@example.com',
    tags: ['priority', 'q4'],
  });
  assert.deepStrictEqual(validationErrors, []);
});

test('hubspot mapping applies converters and validates required fields', () => {
  const { mappingPath, domainPath } = buildPaths('hubspot', 'prospect');
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const payload = readSample('hubspot');

  const entity = mapPayloadToDomain(mapping, payload);
  const validationErrors = validateEntity(entity, domain);

  assert.strictEqual(entity.lifecycle_stage, 'marketing_qualified');
  assert.strictEqual(entity.name, 'Alex Martin');
  assert.deepStrictEqual(entity.emails, ['alex.martin@example.com']);
  assert.deepStrictEqual(validationErrors, []);
});

test('drive mapping supports enum conversion and arrays', () => {
  const { mappingPath, domainPath } = buildPaths('drive', 'document');
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const payload = readSample('drive');

  const entity = mapPayloadToDomain(mapping, payload);
  const validationErrors = validateEntity(entity, domain);

  assert.strictEqual(entity.mime_type, 'doc');
  assert.deepStrictEqual(entity.tags, ['proposal', 'draft']);
  assert.deepStrictEqual(validationErrors, []);
});

test('validateEntity reports missing required field when payload lacks data', () => {
  const { mappingPath, domainPath } = buildPaths('monday', 'project');
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const payload = { ...readSample('monday'), item: { name: 'Untitled' } };

  const entity = mapPayloadToDomain(mapping, payload);
  const validationErrors = validateEntity(entity, domain);

  assert(validationErrors.some((err) => err.field === 'id' && err.message === 'required field missing'));
});

test('detectUnknownTargets flags mapping targets not present in the domain', () => {
  const { mappingPath, domainPath } = buildPaths('drive', 'document');
  const mapping = loadYaml(mappingPath);
  const domain = loadDomain(domainPath);
  const mutated = JSON.parse(JSON.stringify(mapping));
  mutated.fields.push({ target: 'ghost_field', source: 'file.ghost' });

  const unknownTargets = detectUnknownTargets(mutated, domain);

  assert.deepStrictEqual(unknownTargets, ['ghost_field']);
});
