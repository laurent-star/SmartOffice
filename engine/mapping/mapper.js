const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  formatDateIso,
  enumMap,
  normalizeArray,
  concat,
  coalesce,
} = require('./converters');

const builtins = {
  enum_map: (value, params) => enumMap(value, params?.map),
  date_iso: (value, params) => formatDateIso(value, params),
  normalize_array: (value) => normalizeArray(value),
  concat: (value, params = {}) => concat(params.bindings || value || {}, params.template || '{{value}}'),
  coalesce: (value, params = {}) => coalesce(params.order || value),
};

const loadYaml = (filePath) => yaml.load(fs.readFileSync(path.resolve(filePath), 'utf8'));

const buildConverterRegistry = (mapping) => {
  const registry = {};
  for (const entry of mapping.converters || []) {
    if (entry.id) registry[entry.id] = entry;
  }
  return registry;
};

const resolveSourceValue = (payload, sourcePath) => {
  const expectArray = sourcePath.endsWith('[]');
  const cleanedPath = expectArray ? sourcePath.slice(0, -2) : sourcePath;
  const segments = cleanedPath.split('.');
  let current = payload;
  for (const segment of segments) {
    if (segment.includes('[')) {
      const [key, indexPart] = segment.split('[');
      const index = Number(indexPart.replace(']', ''));
      current = current?.[key];
      if (!Array.isArray(current) || Number.isNaN(index)) return undefined;
      current = current[index];
    } else {
      current = current?.[segment];
    }
    if (current === undefined || current === null) break;
  }
  if (expectArray) {
    if (current === undefined || current === null) return [];
    return Array.isArray(current) ? current : [current];
  }
  return current;
};

const applyConverter = (rawValue, converter, registry, payload) => {
  if (!converter) return rawValue;
  const converterName = converter.name || registry?.[converter.use]?.name || converter.use;
  const resolvedParams = converter.params || registry?.[converter.use]?.params || converter;
  const handler = builtins[converterName];
  if (!handler) return rawValue;
  if (converterName === 'concat') {
    const bindings = {};
    const bindingDefs = converter.bindings || registry?.[converter.use]?.bindings || {};
    for (const [key, src] of Object.entries(bindingDefs)) {
      bindings[key] = resolveSourceValue(payload, src);
    }
    return handler(null, { bindings, template: converter.template || registry?.[converter.use]?.template });
  }
  if (converterName === 'coalesce') {
    const ordered = Array.isArray(rawValue) ? rawValue : [rawValue];
    return handler(ordered, resolvedParams);
  }
  if (converterName === 'enum_map') {
    const params = converter.map ? { map: converter.map } : resolvedParams;
    return handler(Array.isArray(rawValue) ? rawValue[0] : rawValue, params);
  }
  return handler(rawValue, resolvedParams);
};

const mapField = (field, payload, registry) => {
  const sources = Array.isArray(field.source) ? field.source : [field.source];
  let value;
  for (const src of sources) {
    const resolved = resolveSourceValue(payload, src);
    if (resolved !== undefined && resolved !== null && resolved !== '') {
      value = resolved;
      break;
    }
  }
  if (value === undefined || value === null) {
    value = field.fallback !== undefined ? field.fallback : undefined;
  }
  if (field.converter) {
    value = applyConverter(value, field.converter, registry, payload);
  }
  return value;
};

const mapPayloadToDomain = (mapping, payload) => {
  const registry = buildConverterRegistry(mapping);
  const entity = {};
  for (const field of mapping.fields || []) {
    const mappedValue = mapField(field, payload, registry);
    if (mappedValue !== undefined) {
      entity[field.target] = mappedValue;
    }
  }
  return entity;
};

module.exports = {
  builtins,
  loadYaml,
  mapPayloadToDomain,
  resolveSourceValue,
  buildConverterRegistry,
};
