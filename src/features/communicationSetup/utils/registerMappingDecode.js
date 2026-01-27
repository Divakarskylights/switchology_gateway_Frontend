import { decodeRegistersForDisplay } from './registerDecode';

export const decodeWithMappings = (registers, mappings = []) => {
  const regMap = new Map((registers || []).map((r) => [Number(r.address), Number(r.value)]));

  const mappedRows = (mappings || []).map((m, idx) => {
    const address = Number(m.address);
    const length = Math.max(1, Number(m.length || 1));
    const chunk = Array.from({ length }, (_, i) => ({
      address: address + i,
      value: regMap.get(address + i),
    }));

    if (chunk.some((c) => c.value === undefined)) {
      return {
        index: idx,
        ...m,
        ok: false,
        error: 'Missing register(s) in response',
        value: null,
        raw: chunk.map((c) => (c.value === undefined ? null : c.value)),
      };
    }

    if (m.type === 'none') {
      return {
        index: idx,
        ...m,
        ok: true,
        error: null,
        value: null,
        raw: chunk.map((c) => c.value),
      };
    }

    const decoded = decodeRegistersForDisplay(chunk.map((c) => ({ address: c.address, value: c.value })), m.type);
    const baseValue = decoded.rows?.[0]?.value;

    const scale = Number(m.scale);
    const hasScale = !Number.isNaN(scale) && scale !== 0;

    let finalValue = baseValue;
    if (typeof baseValue === 'number' && hasScale) {
      finalValue = baseValue * scale;
    }

    return {
      index: idx,
      ...m,
      ok: true,
      error: null,
      value: finalValue,
      raw: chunk.map((c) => c.value),
    };
  });

  return mappedRows;
};
