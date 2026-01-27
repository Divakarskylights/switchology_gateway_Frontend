import { configInit } from '../../../components/layout/globalvariable';


const getBaseUrl = () => {
  // Prefer global configInit.appBaseUrl so all APIs share the same backend base
  if (configInit?.appBaseUrl) {
    return configInit.appBaseUrl.replace(/\/+$/, '');
  }
};

const getJson = async (path, { signal } = {}) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  // Try to parse JSON, fall back to text
  let parsed = null;
  let rawText = '';
  try {
    parsed = await res.json();
  } catch {
    try {
      rawText = await res.text();
    } catch {
      rawText = '';
    }
  }

  if (!res.ok) {
    const message = (parsed && parsed.message) || rawText || `Request failed (${res.status})`;
    const data = parsed && parsed.data ? parsed.data : null;
    return { ok: false, timeTakenMs: 0, message, data };
  }

  return parsed !== null ? parsed : rawText;
};

const postJson = async (path, body, { signal } = {}) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  // Try to parse JSON, fall back to text
  let parsed = null;
  let rawText = '';
  try {
    parsed = await res.json();
  } catch {
    try {
      rawText = await res.text();
    } catch {
      rawText = '';
    }
  }

  if (!res.ok) {
    const message = (parsed && parsed.message) || rawText || `Request failed (${res.status})`;
    const data = parsed && parsed.data ? parsed.data : null;
    return { ok: false, timeTakenMs: 0, message, data };
  }

  return parsed !== null ? parsed : rawText;
};

export const testCommunicationConnection = async (payload, opts) => {
  return postJson('/api/communication/test', { connection: payload.connection }, opts);
};

export const readWriteOnce = async (payload, opts) => {
  return postJson('/api/communication/read-write-once', payload, opts);
};

export const readMeterRegisters = async (payload, opts) => {
  return postJson('/api/communication/read-meter-registers', payload, opts);
};

export const getSerialPorts = async (opts) => {
  return getJson('/api/communication/serial-ports', opts);
};

export const createMeterRegister = async (payload, opts) => {
  return postJson('/api/meter-registers', payload, opts);
};

export const createMeterRegistersBulk = async (payloads, { signal } = {}) => {
  const url = `${getBaseUrl()}/api/meter-registers/bulk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloads),
    signal,
  });

  // Parse body (json or text)
  let parsed = null;
  let rawText = '';
  try {
    parsed = await res.json();
  } catch {
    try {
      rawText = await res.text();
    } catch {
      rawText = '';
    }
  }

  if (!res.ok) {
    const message = (parsed && parsed.message) || rawText || `Request failed (${res.status})`;
    const data = parsed && parsed.data ? parsed.data : null;
    return { ok: false, timeTakenMs: 0, message, data };
  }

  const skippedIds = res.headers.get('X-Skipped-Ids') || '';
  const alreadyAll = (res.headers.get('X-Already-Exists') || '').toLowerCase() === 'true';

  return { ok: true, data: parsed ?? [], skippedIds, alreadyAll };
};

export const getMeterRegisters = async (params = {}, opts) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  const path = query ? `/api/meter-registers?${query}` : '/api/meter-registers';

  return getJson(path, opts);
};

export const getCommunicationApiBaseUrl = () => getBaseUrl();

const normalizeListResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const getMeterMakes = async (opts) => {
  const data = await getJson('/api/meters/makes', opts);
  return normalizeListResponse(data, 'makes');
};

export const getMeterModels = async (make, opts) => {
  if (!make) return [];
  const query = new URLSearchParams({ make }).toString();
  const data = await getJson(`/api/meters/models?${query}`, opts);
  return normalizeListResponse(data, 'models');
};

export const getMeterDetails = async (make, model, opts) => {
  if (!make || !model) return null;
  const query = new URLSearchParams({ make, model }).toString();
  return getJson(`/api/meters/details?${query}`, opts);
};

export const getMeterSummary = async (opts) => {
  const data = await getJson('/api/meters/summary', opts);
  return data || {};
};