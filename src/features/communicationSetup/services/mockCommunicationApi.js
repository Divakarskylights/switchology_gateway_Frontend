export const mockTestConnection = async (payload) => {
  await new Promise((r) => setTimeout(r, 700));
  const ok = Boolean(payload?.connection?.type);
  if (!ok) {
    return {
      ok: false,
      timeTakenMs: 0,
      message: 'Invalid connection configuration',
    };
  }
  return {
    ok: true,
    timeTakenMs: Math.floor(80 + Math.random() * 220),
    message: 'Connection successful',
  };
};

export const mockReadWriteOnce = async (payload) => {
  await new Promise((r) => setTimeout(r, 900));

  const functionCode = Number(payload?.definition?.functionCode);
  const quantity = Math.max(1, Number(payload?.definition?.quantity || 1));
  const address = Math.max(0, Number(payload?.definition?.address || 0));

  if (!functionCode || Number.isNaN(functionCode)) {
    return {
      ok: false,
      timeTakenMs: 0,
      message: 'Select a function',
      data: null,
    };
  }

  const timeTakenMs = Math.floor(120 + Math.random() * 380);

  if (functionCode === 3) {
    const registers = Array.from({ length: quantity }, (_, i) => ({
      address: address + i,
      value: Math.floor(Math.random() * 65535),
    }));
    return {
      ok: true,
      timeTakenMs,
      message: 'Read successful',
      data: { registers },
    };
  }

  if (functionCode === 16) {
    return {
      ok: true,
      timeTakenMs,
      message: 'Write successful',
      data: { written: quantity },
    };
  }

  return {
    ok: true,
    timeTakenMs,
    message: 'Operation successful',
    data: { info: `Function ${functionCode} executed` },
  };
};
