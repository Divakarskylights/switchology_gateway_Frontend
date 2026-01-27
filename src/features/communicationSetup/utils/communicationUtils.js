export const getOptionText = (entry) => {
  if (entry === null || entry === undefined) return '';
  if (typeof entry === 'string') return entry;
  if (entry.inputValue) return entry.inputValue;
  if (entry.value) return entry.value;
  if (entry.label) return entry.label;
  return '';
};

export const filterSelectedMappings = (mappings = []) => (mappings || []).filter((m) => m.selected ?? true);

export const sanitizeSummaryBlocks = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : [])
    .map((block) => {
      const address = Number(block?.address);
      const quantity = Number(block?.quantity);
      return {
        address: Number.isFinite(address) ? address : 0,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
      };
    })
    .filter((block) => block.quantity > 0);

export const areBlocksEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]?.address !== b[i]?.address || a[i]?.quantity !== b[i]?.quantity) return false;
  }
  return true;
};

export const extractModbusFromEntry = (entry, model) => {
  if (!entry) return null;
  const modelLower = model ? String(model).toLowerCase() : null;

  const tryResolveModel = (container) => {
    if (!container || !modelLower) return null;
    if (typeof container === 'object') {
      const directKey = Object.keys(container).find((key) => key.toLowerCase() === modelLower);
      if (directKey) {
        const item = container[directKey];
        if (item?.modbus) return item.modbus;
        if (item && (item.address !== undefined || item.quantity !== undefined || item.blocks)) return item;
      }
    }
    return null;
  };

  const modelSpecific =
    tryResolveModel(entry.models) ||
    tryResolveModel(entry) ||
    (entry.model && modelLower && entry.model.toLowerCase() === modelLower ? entry : null);

  const resolved = modelSpecific || entry.modbus || entry;
  if (!resolved) return null;
  const valueType = resolved.valueType || resolved.type || 'float_custom';
  return {
    ...resolved,
    valueType,
    displayType: resolved.displayType || resolved.type || valueType,
    bulk: typeof resolved.bulk === 'boolean' ? resolved.bulk : undefined,
    blocks: sanitizeSummaryBlocks(resolved.blocks),
  };
};

export const findSummaryModbus = (summary, make, model) => {
  if (!summary || !make) return null;
  const lowerMake = String(make).toLowerCase();
  if (Array.isArray(summary)) {
    const match = summary.find((item) => {
      const key = item?.make || item?.name || item?.label;
      return key && key.toLowerCase() === lowerMake;
    });
    if (match) return extractModbusFromEntry(match, model);
  } else if (typeof summary === 'object') {
    const matchKey = Object.keys(summary).find((key) => key.toLowerCase() === lowerMake);
    if (matchKey) return extractModbusFromEntry(summary[matchKey], model);
  }
  return null;
};

export const normalizeBlocksForPayload = (blocks = []) =>
  (blocks || [])
    .map((block) => {
      const address = Number(block?.address);
      const quantity = Number(block?.quantity);
      const normalizedAddress = Number.isFinite(address) ? address : 0;
      const normalizedQuantity = Number.isFinite(quantity) ? quantity : 0;
      return {
        address: normalizedAddress,
        quantity: Math.max(0, normalizedQuantity),
      };
    })
    .filter((block) => block.quantity > 0);

export const normalizeDefinitionForPayload = (definition) => {
  if (!definition) return definition;

  let outgoingValueType = definition.valueType;
  if (outgoingValueType === 'custom') {
    outgoingValueType = 'none';
  } else if (outgoingValueType === 'float_custom') {
    outgoingValueType = 'Float32 from Uint16 buffer';
  }

  const base = { ...definition, valueType: outgoingValueType };
  const normalizedBlocks = normalizeBlocksForPayload(definition.blocks);
  if (normalizedBlocks.length) {
    base.blocks = normalizedBlocks;
  } else {
    delete base.blocks;
  }
  return base;
};

export const withSelectedMappingsOnly = (state) => {
  if (!state?.definition) return state;
  const normalizedDefinition = normalizeDefinitionForPayload(state.definition);
  return {
    ...state,
    definition: {
      ...normalizedDefinition,
      mappings: filterSelectedMappings(state.definition.mappings),
    },
  };
};
