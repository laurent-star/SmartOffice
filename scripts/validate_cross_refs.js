const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listJson(dir, suffix) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(suffix))
    .map((f) => path.join(dir, f));
}

function collectSteps(entityId, steps, refs, errors, scope) {
  (steps || []).forEach((step, idx) => {
    const label = `${scope}:${entityId}:step[${idx}]`;
    if (step.type === 'tool') {
      refs.tools.add(step.ref);
    } else if (step.type === 'capability') {
      refs.capabilities.add(step.ref);
    } else if (step.type === 'usecase') {
      refs.usecases.add(step.ref);
    } else {
      errors.push(`${label} has unknown type ${step.type}`);
    }

    if (step.on_error && step.on_error.fallback) {
      const fb = step.on_error.fallback;
      const fbLabel = `${label}:fallback`;
      if (fb.type === 'tool') refs.tools.add(fb.ref);
      else if (fb.type === 'capability') refs.capabilities.add(fb.ref);
      else if (fb.type === 'usecase') refs.usecases.add(fb.ref);
      else errors.push(`${fbLabel} has unknown type ${fb.type}`);
    }
  });
}

function main() {
  const errors = [];

  const toolsDir = path.join(__dirname, '..', 'config', 'tools');
  const capabilitiesDir = path.join(__dirname, '..', 'config', 'capabilities');
  const usecasesDir = path.join(__dirname, '..', 'config', 'use-cases');

  const tools = new Map();
  listJson(toolsDir, '.tool.json').forEach((file) => {
    const data = loadJson(file);
    tools.set(data.id, { file, data });
  });

  const capabilities = new Map();
  listJson(capabilitiesDir, '.capability.json').forEach((file) => {
    const data = loadJson(file);
    capabilities.set(data.id, { file, data });
  });

  const usecases = new Map();
  listJson(usecasesDir, '.usecase.json').forEach((file) => {
    const data = loadJson(file);
    usecases.set(data.id, { file, data });
  });

  const ops = loadJson(path.join(__dirname, '..', 'registries', 'n8n-official-ops.json'));
  const providerCategoryMap = loadJson(path.join(__dirname, '..', 'config', 'provider-category.map.json'));
  const overridesPath = path.join(__dirname, '..', 'config', 'capability-mapping.overrides.json');
  const overrides = fs.existsSync(overridesPath) ? loadJson(overridesPath) : {};

  for (const [toolId, tool] of tools.entries()) {
    const providerDef = ops.providers[toolId];
    if (!providerDef) {
      errors.push(`Tool ${toolId} not found in n8n official ops`);
      continue;
    }
    if (!providerCategoryMap[toolId]) {
      errors.push(`Provider-category mapping missing for tool ${toolId}`);
    }
    (tool.data.actions || []).forEach((action) => {
      const [resource, operation] = (action.name || '').split('.');
      const resourceDef = providerDef.resources && providerDef.resources[resource];
      const opDef = resourceDef && resourceDef.operations && resourceDef.operations[operation];
      if (!resource || !operation || !opDef) {
        errors.push(`Tool ${toolId} action ${action.name} not found in n8n official ops`);
      }
    });
  }

  const actionKeys = new Set();
  for (const [provider, providerDef] of Object.entries(ops.providers)) {
    for (const [resource, resourceDef] of Object.entries(providerDef.resources || {})) {
      for (const operation of Object.keys(resourceDef.operations || {})) {
        actionKeys.add(`${provider}.${resource}.${operation}`);
      }
    }
  }

  for (const [actionKey] of Object.entries(overrides)) {
    if (!actionKeys.has(actionKey)) {
      errors.push(`Override actionKey not found in n8n official ops: ${actionKey}`);
    }
  }

  const refs = { tools: new Set(), capabilities: new Set(), usecases: new Set() };

  for (const [capId, cap] of capabilities.entries()) {
    collectSteps(capId, cap.data.steps, refs, errors, 'capability');
  }
  for (const [ucId, uc] of usecases.entries()) {
    collectSteps(ucId, uc.data.steps, refs, errors, 'usecase');
  }

  refs.tools.forEach((toolId) => {
    if (!tools.has(toolId)) {
      errors.push(`Step references missing tool: ${toolId}`);
    }
  });
  refs.capabilities.forEach((capId) => {
    if (!capabilities.has(capId)) {
      errors.push(`Step references missing capability: ${capId}`);
    }
  });
  refs.usecases.forEach((ucId) => {
    if (!usecases.has(ucId)) {
      errors.push(`Step references missing usecase: ${ucId}`);
    }
  });

  if (errors.length) {
    errors.forEach((msg) => console.error(`ERROR ${msg}`));
    process.exit(1);
  }

  console.log('Cross-reference checks passed');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
