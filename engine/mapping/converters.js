const formatDateIso = (value, params = {}) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (params.timezone && params.timezone.toUpperCase() === 'UTC') {
    return date.toISOString();
  }
  return date.toISOString();
};

const enumMap = (value, map = {}) => {
  if (value === undefined || value === null) return undefined;
  return map[value] ?? value;
};

const normalizeArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.filter((v) => v !== undefined && v !== null);
  return [value];
};

const concat = (bindings = {}, template = '{{value}}') => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const val = bindings[key];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(' ');
    return String(val);
  }).trim();
};

const coalesce = (values = []) => {
  for (const val of values) {
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return undefined;
};

module.exports = {
  formatDateIso,
  enumMap,
  normalizeArray,
  concat,
  coalesce,
};
