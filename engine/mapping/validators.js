const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const loadDomain = (domainPath) => yaml.load(fs.readFileSync(path.resolve(domainPath), 'utf8'));

const buildFieldMap = (domain) => {
  const map = {};
  for (const field of domain.fields || []) {
    map[field.name] = field;
  }
  return map;
};

const validateEntity = (entity, domain) => {
  const fieldMap = buildFieldMap(domain);
  const errors = [];
  for (const field of domain.fields || []) {
    const value = entity[field.name];
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: field.name, message: 'required field missing' });
      continue;
    }
    if (value === undefined || value === null) continue;
    if (field.type === 'enum' && field.values && !field.values.includes(value)) {
      errors.push({ field: field.name, message: `value not in enum: ${field.values.join(', ')}` });
    }
    if (field.type === 'array' && !Array.isArray(value)) {
      errors.push({ field: field.name, message: 'expected array' });
    }
  }
  const unknownFields = Object.keys(entity).filter((key) => !fieldMap[key]);
  for (const extra of unknownFields) {
    errors.push({ field: extra, message: 'field not declared in domain' });
  }
  return errors;
};

module.exports = {
  loadDomain,
  validateEntity,
  buildFieldMap,
};
