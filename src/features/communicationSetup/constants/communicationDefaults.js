export const STORAGE_KEY = 'switchology.communicationSetup.config';

export const connectionTypeOptions = [
  { value: 'serial_rtu', label: 'Serial Port (RTU)' },
  { value: 'modbus_tcp', label: 'Modbus TCP/IP' },
  { value: 'modbus_udp', label: 'Modbus UDP/IP' },
];

export const modeOptions = [
  { value: 'rtu', label: 'RTU' },
  { value: 'ascii', label: 'ASCII' },
];

export const parityOptions = [
  { value: 'none', label: 'None' },
  { value: 'even', label: 'Even' },
  { value: 'odd', label: 'Odd' },
];

export const functionOptions = [
  { value: 3, label: '03 Read Holding Registers (4x)' },
  { value: 16, label: '16 Write Multiple Registers' },
];

export const valueTypeOptions = [
  { type: 'subheader', label: '================== RAW ==================' },
  { value: 'none', label: 'None' },

  { type: 'subheader', label: '================== STRING ==================' },
  { value: 'utf8', label: 'UTF-8 String' },

  { type: 'subheader', label: '================== 16-BIT ==================' },
  { value: 'signed', label: 'Int16 (Signed)' },
  { value: 'unsigned', label: 'UInt16 (Unsigned)' },
  { value: 'hex', label: 'Hex (16-bit)' },
  { value: 'binary', label: 'Binary (16-bit)' },

  { type: 'subheader', label: '================== 32-BIT (INT / UINT) ==================' },
  { value: 'int32_le', label: 'Int32 LE (Little-endian)' },
  { value: 'int32_be', label: 'Int32 BE (Big-endian)' },
  { value: 'int32_le_bs', label: 'Int32 LE + Byte Swap' },
  { value: 'int32_be_bs', label: 'Int32 BE + Byte Swap' },
  { value: 'uint32_le', label: 'UInt32 LE (Little-endian)' },
  { value: 'uint32_be', label: 'UInt32 BE (Big-endian)' },
  { value: 'uint32_le_bs', label: 'UInt32 LE + Byte Swap' },
  { value: 'uint32_be_bs', label: 'UInt32 BE + Byte Swap' },

  { type: 'subheader', label: '================== FLOAT32 (2 Registers) ==================' },
  { value: 'float_custom', label: 'Float32 (from Uint16 buffer)' },
  { value: 'float_le', label: 'Float32 LE' },
  { value: 'float_be', label: 'Float32 BE' },
  { value: 'float_le_bs', label: 'Float32 LE + Byte Swap' },
  { value: 'float_be_bs', label: 'Float32 BE + Byte Swap' },

  { type: 'subheader', label: '================== 64-BIT (INT / UINT) ==================' },
  { value: 'int64_le', label: 'Int64 LE' },
  { value: 'int64_be', label: 'Int64 BE' },
  { value: 'int64_le_bs', label: 'Int64 LE + Byte Swap' },
  { value: 'int64_be_bs', label: 'Int64 BE + Byte Swap' },
  { value: 'uint64_le', label: 'UInt64 LE' },
  { value: 'uint64_be', label: 'UInt64 BE' },
  { value: 'uint64_le_bs', label: 'UInt64 LE + Byte Swap' },
  { value: 'uint64_be_bs', label: 'UInt64 BE + Byte Swap' },

  { type: 'subheader', label: '================== DOUBLE (Float64) ==================' },
  { value: 'double_le', label: 'Float64 LE (Double)' },
  { value: 'double_be', label: 'Float64 BE (Double)' },
  { value: 'double_le_bs', label: 'Float64 LE + Byte Swap' },
  { value: 'double_be_bs', label: 'Float64 BE + Byte Swap' },

  { type: 'subheader', label: '================== CUSTOM MAPPING ==================' },
  { value: 'custom', label: 'Custom mapping (use table below)' },
];

export const defaultComPorts = Array.from({ length: 16 }, (_, i) => ({
  value: `COM${i + 1}`,
  label: `COM${i + 1}`,
}));

export const defaultState = {
  connection: {
    type: 'serial_rtu',
    mode: 'rtu',
    serial: {
      port: 'COM1',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'even',
    },
    network: {
      host: '127.0.0.1',
      port: 502,
      timeoutMs: 3000,
    },
  },
  definition: {
    slaveId: 1,
    functionCode: 3,
    valueType: 'none',
    address: 0,
    quantity: 10,
    bulk: false,
    datatypeIfBulk: '',
    scanRateMs: 1000,
    mappings: [],
    blocks: [],
  },
  meter: {
    make: '',
    model: '',
    details: null,
  },
};
