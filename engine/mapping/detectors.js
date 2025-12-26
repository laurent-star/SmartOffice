const { buildFieldMap } = require('./validators');

const detectRequiredCoverage = (mapping, domain) => {
  const fieldMap = buildFieldMap(domain);
  const mappedTargets = new Set((mapping.fields || []).map((f) => f.target));
  const missing = [];
  for (const field of domain.fields || []) {
    if (field.required && !mappedTargets.has(field.name)) {
      missing.push(field.name);
    }
  }
  return missing;
};

const detectUnknownTargets = (mapping, domain) => {
  const fieldMap = buildFieldMap(domain);
  const unknown = [];
  for (const field of mapping.fields || []) {
    if (!fieldMap[field.target]) unknown.push(field.target);
  }
  return unknown;
};

module.exports = {
  detectRequiredCoverage,
  detectUnknownTargets,
};
