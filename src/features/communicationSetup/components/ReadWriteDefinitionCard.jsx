import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import ConfigItem from '../../setup/components/SetUpConfigItem';

const functionOptions = [
  { value: 3, label: '03 Read Holding Registers (4x)' },
  { value: 16, label: '16 Write Multiple Registers' },
];

const valueTypeOptions = [
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

export default function ReadWriteDefinitionCard({ value, onChange }) {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Read/Write Definition
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <ConfigItem
            label="Slave ID"
            value={value?.slaveId ?? 1}
            onChange={(name, v) => onChange({ ...value, slaveId: Number(v) })}
            name="slaveId"
            type="number"
            required
          />
        </Grid>

        <Grid item xs={12} md={9}>
          <ConfigItem
            label="Function"
            value={value?.functionCode ?? 3}
            onChange={(name, v) => onChange({ ...value, functionCode: Number(v) })}
            name="functionCode"
            select
            options={functionOptions}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ConfigItem
            label="Type"
            value={value?.valueType ?? 'none'}
            onChange={(name, v) => onChange({ ...value, valueType: v })}
            name="valueType"
            select
            options={valueTypeOptions}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <ConfigItem
            label="Address"
            value={value?.address ?? 0}
            onChange={(name, v) => onChange({ ...value, address: Number(v) })}
            name="address"
            type="number"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <ConfigItem
            label="Quantity"
            value={value?.quantity ?? 10}
            onChange={(name, v) => onChange({ ...value, quantity: Number(v) })}
            name="quantity"
            type="number"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <ConfigItem
            label="Scan rate (ms)"
            value={value?.scanRateMs ?? 1000}
            onChange={(name, v) => onChange({ ...value, scanRateMs: Number(v) })}
            name="scanRateMs"
            type="number"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
