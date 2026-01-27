export const buildDecodedSignature = (rows) =>
  rows
    .map((row) => {
      const raw = Array.isArray(row.raw) ? row.raw.join(',') : '';
      return `${row.address}-${row.length ?? ''}-${raw}-${row.value ?? ''}`;
    })
    .join('|');

export const buildMappedSignature = (rows) =>
  rows
    .map((row) => {
      const raw = Array.isArray(row.raw) ? row.raw.join(',') : '';
      return `${row.address}-${row.length ?? ''}-${row.type ?? ''}-${raw}-${row.value ?? ''}`;
    })
    .join('|');

export const buildNamedSignature = (rows) =>
  rows
    .map((row, idx) => {
      const name = row?.name ?? '';
      const value = row?.value ?? '';
      const startRegister = row?.start_register ?? '';
      const size = row?.size ?? '';
      const type = row?.target_data_type ?? '';
      const scale = row?.scale ?? '';
      const op = row?.op ?? '';
      return `${idx}-${name}-${value}-${startRegister}-${size}-${type}-${scale}-${op}`;
    })
    .join('|');
