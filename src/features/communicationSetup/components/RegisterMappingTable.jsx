import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfigItem from '../../setup/components/SetUpConfigItem';

const typeOptions = [
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
];

const lengthOptions = [
  { value: 1, label: '1 (16-bit)' },
  { value: 2, label: '2 (32-bit)' },
  { value: 4, label: '4 (64-bit)' },
];

const newRow = () => ({
  address: 0,
  length: 1,
  type: 'none',
  name: '',
  scale: 1,
  unit: '',
  selected: true,
});

const schemaTypeToValueType = (schemaType) => {
  const kind = String(schemaType || '').trim().toUpperCase();
  switch (kind) {
    case 'INT16':
    case 'INT16S':
      return 'signed';
    case 'INT16U':
    case 'UINT16':
    case 'UINT16U':
      return 'unsigned';
    case 'INT32':
      return 'int32_be';
    case 'UINT32':
      return 'uint32_be';
    case 'INT64':
      return 'int64_be';
    case 'UINT64':
      return 'uint64_be';
    case 'FLOAT32':
      return 'float_be';
    case 'FLOAT32_LE':
      return 'float_le';
    case 'FLOAT32_BE_BS':
      return 'float_be_bs';
    case 'FLOAT32_LE_BS':
      return 'float_le_bs';
    case 'FLOAT64':
    case 'DOUBLE':
      return 'double_be';
    case 'UTF8':
    case 'UTF-8':
    case 'ASCII':
    case 'STRING':
      return 'none';
    default:
      return 'none';
  }
};

const parseRegisterAddress = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.trim().startsWith('0x') || value.trim().startsWith('0X')) {
      const parsed = parseInt(value, 16);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const extractParamsFromSchemaJson = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.params)) return payload.params;
  return [];
};

const getSchemaParamKey = (param) => {
  if (!param) return '';
  if (param.name && String(param.name).trim()) return String(param.name).trim();
  if (param.start_register !== undefined && param.start_register !== null) return String(param.start_register);
  return '';
};

export default function RegisterMappingTable({ mappings = [], onChange, disabled = false }) {
  const fileInputRef = React.useRef(null);
  const [schemaParams, setSchemaParams] = React.useState([]);
  const [selectedSchemaKey, setSelectedSchemaKey] = React.useState('');
  const [schemaError, setSchemaError] = React.useState('');

  const isSchemaParamUsed = React.useCallback(
    (key) => {
      if (!key) return false;
      return (mappings || []).some((m) => m.schemaKey && m.schemaKey === key);
    },
    [mappings],
  );

  const handleRowChange = (index, patch) => {
    const next = mappings.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...(mappings || []), newRow()]);
  };

  const handleDelete = (index) => {
    onChange(mappings.filter((_, i) => i !== index));
  };

  const handleSchemaUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSchemaFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result?.toString() || '{}');
        const params = extractParamsFromSchemaJson(parsed);
        if (!params.length) {
          throw new Error('No register definitions found in JSON');
        }
        setSchemaParams(params);
        const defaultKey = params
          .map((param) => getSchemaParamKey(param))
          .find((key) => key && !isSchemaParamUsed(key));
        setSelectedSchemaKey(defaultKey || '');
        setSchemaError('');
      } catch (err) {
        setSchemaParams([]);
        setSelectedSchemaKey('');
        setSchemaError(err?.message || 'Failed to parse schema file');
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      setSchemaParams([]);
      setSelectedSchemaKey('');
      setSchemaError('Unable to read schema file');
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleSchemaSelectionChange = (event) => {
    setSelectedSchemaKey(event.target.value);
  };

  const schemaParamsByKey = React.useMemo(() => {
    const map = new Map();
    schemaParams.forEach((param) => {
      const key = getSchemaParamKey(param);
      if (key) map.set(key, param);
    });
    return map;
  }, [schemaParams]);

  React.useEffect(() => {
    if (selectedSchemaKey && isSchemaParamUsed(selectedSchemaKey)) {
      const fallbackKey = schemaParams
        .map((param) => getSchemaParamKey(param))
        .find((key) => key && !isSchemaParamUsed(key));
      setSelectedSchemaKey(fallbackKey || '');
    }
  }, [schemaParams, mappings, selectedSchemaKey, isSchemaParamUsed]);

  const selectedSchemaParam = selectedSchemaKey ? schemaParamsByKey.get(selectedSchemaKey) : null;

  const addParamToMappings = (param) => {
    if (!param) return;
    const address = parseRegisterAddress(param.start_register);
    const length = Math.max(1, Number(param.size) || 1);
    const type = schemaTypeToValueType(param.target_data_type);

    const schemaKey = getSchemaParamKey(param);
    const newMapping = {
      address,
      length,
      type,
      name: param.name || '',
      scale: 1,
      unit: param.unit || '',
      selected: true,
      schemaKey,
    };

    onChange([...(mappings || []), newMapping]);
  };

  const handleAddSelectedParam = () => {
    if (!selectedSchemaKey) return;
    const param = schemaParamsByKey.get(selectedSchemaKey);
    addParamToMappings(param);
    const nextKey = schemaParams
      .map((p) => getSchemaParamKey(p))
      .find((key) => key && !isSchemaParamUsed(key));
    setSelectedSchemaKey(nextKey || '');
  };

  const handleAddAllParams = () => {
    if (!schemaParams.length) return;
    const additions = schemaParams.map((param) => {
      const address = parseRegisterAddress(param.start_register);
      const length = Math.max(1, Number(param.size) || 1);
      const type = schemaTypeToValueType(param.target_data_type);
      const schemaKey = getSchemaParamKey(param);
      return {
        address,
        length,
        type,
        name: param.name || '',
        scale: 1,
        unit: param.unit || '',
        selected: true,
        schemaKey,
      };
    });
    onChange([...(mappings || []), ...additions]);
    setSelectedSchemaKey('');
  };

  const handleClearSchema = () => {
    setSchemaParams([]);
    setSelectedSchemaKey('');
    setSchemaError('');
  };

  if (disabled) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Register Mapping
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select <strong>Type → Custom mapping</strong> in the Read/Write Definition section to enable register mapping, JSON upload, and manual entries.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">Register Mapping</Typography>
        <Button variant="outlined" size="small" onClick={handleAdd}>Add Row</Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button variant="outlined" size="small" onClick={handleSchemaUploadClick}>
            Upload schema JSON
          </Button>
          <input type="file" hidden accept="application/json" ref={fileInputRef} onChange={handleSchemaFileChange} />

          {schemaParams.length ? (
            <>
              <TextField
                select
                size="small"
                label="Schema param"
                value={selectedSchemaKey}
                onChange={handleSchemaSelectionChange}
                sx={{ minWidth: 320 }}
              >
                {schemaParams.map((param) => {
                  const key = getSchemaParamKey(param);
                  const alreadyInserted = isSchemaParamUsed(key);
                  return (
                    <MenuItem key={key} value={key} disabled={alreadyInserted}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {param.name || '(unnamed)'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Start: {param.start_register ?? '-'} • Size: {param.size ?? '-'} • Register: {param.register_data_type || 'unknown'} → Target: {param.target_data_type || 'unknown'}
                        </Typography>
                        {alreadyInserted ? (
                          <Typography variant="caption" sx={{ color: 'error.main' }}>
                            Already added
                          </Typography>
                        ) : null}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
              <Button variant="contained" size="small" onClick={handleAddSelectedParam} disabled={!selectedSchemaKey}>
                Add selected
              </Button>
              <Button variant="text" size="small" onClick={handleAddAllParams}>
                Add all
              </Button>
              <Button variant="text" size="small" color="secondary" onClick={handleClearSchema}>
                Clear schema
              </Button>
            </>
          ) : null}
        </Box>

        {schemaError ? (
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {schemaError}
          </Typography>
        ) : schemaParams.length ? (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loaded {schemaParams.length} schema entries. Select one to insert into the table or add them all at once.
            </Typography>
            {selectedSchemaParam ? (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 1,
                  fontSize: '0.85rem',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Name</Typography>
                  <Typography variant="body2">{selectedSchemaParam.name || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Start register</Typography>
                  <Typography variant="body2">{selectedSchemaParam.start_register ?? '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Size</Typography>
                  <Typography variant="body2">{selectedSchemaParam.size ?? '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Register data type</Typography>
                  <Typography variant="body2">{selectedSchemaParam.register_data_type || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Target data type</Typography>
                  <Typography variant="body2">{selectedSchemaParam.target_data_type || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unit</Typography>
                  <Typography variant="body2">{selectedSchemaParam.unit || '-'}</Typography>
                </Box>
              </Box>
            ) : null}
          </>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Upload a schema JSON file to quickly populate register mappings, or add rows manually.
          </Typography>
        )}
      </Box>

      <Box sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Save</Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 120 }}>Address</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Length (target_data_type)</TableCell>
              <TableCell sx={{ minWidth: 260 }}>Type (register_data_type)</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Name</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Scale</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Unit</TableCell>
              <TableCell sx={{ width: 60 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(mappings || []).map((row, idx) => {
              const isSelected = row.selected ?? true;
              return (
                <TableRow key={idx}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={(event) => handleRowChange(idx, { selected: event.target.checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.address}
                      onChange={(name, v) => handleRowChange(idx, { address: Number(v) })}
                      name="address"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.length}
                      onChange={(name, v) => handleRowChange(idx, { length: Number(v) })}
                      name="length"
                      select
                      options={lengthOptions}
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.type}
                      onChange={(name, v) => handleRowChange(idx, { type: v })}
                      name="type"
                      select
                      options={typeOptions}
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.name}
                      onChange={(name, v) => handleRowChange(idx, { name: v })}
                      name="name"
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.scale}
                      onChange={(name, v) => handleRowChange(idx, { scale: Number(v) })}
                      name="scale"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <ConfigItem
                      label=""
                      value={row.unit}
                      onChange={(name, v) => handleRowChange(idx, { unit: v })}
                      name="unit"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
