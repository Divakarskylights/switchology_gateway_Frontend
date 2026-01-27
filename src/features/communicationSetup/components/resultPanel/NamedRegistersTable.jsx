import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

export default function NamedRegistersTable({
  namedRegisters,
  namedRowsState,
  saving,
  canSave,
  onSave,
  onRowSelectedChange,
  onRowNameChange,
  onRowScaleChange,
  onRowOpChange,
}) {
  return (
    <Box sx={{ mt: 3, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">Register Values</Typography>
        <Button size="small" variant="contained" onClick={onSave} disabled={saving || !canSave}>
          {saving ? 'Saving…' : 'Save selected'}
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Save
              </Typography>
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Scale</TableCell>
            <TableCell>Op</TableCell>
            <TableCell>Start Register</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Data Type</TableCell>
            <TableCell>Raw Registers</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {namedRegisters.map((pair, idx) => {
            const rowState = namedRowsState[idx] || { selected: true, name: pair?.name ?? '', scale: '', op: 'mul' };
            const rowEditable = rowState.selected;
            const baseValue = pair?.value;
            const scaleNumber = Number(rowState.scale);
            const hasScale = !Number.isNaN(scaleNumber) && scaleNumber !== 0;
            const op = rowState.op || 'mul';

            let finalValue = baseValue;
            if (typeof baseValue === 'number' && hasScale) {
              if (op === 'div') {
                finalValue = baseValue / scaleNumber;
              } else {
                finalValue = baseValue * scaleNumber;
              }
            }

            return (
              <TableRow key={pair?.name || idx}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={rowState.selected}
                    onChange={(event) => onRowSelectedChange(idx, event.target.checked)}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 240 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={rowState.name}
                    placeholder="Register name"
                    disabled={rowState.name !== ''}
                    onChange={(event) => onRowNameChange(idx, event.target.value)}
                  />
                </TableCell>
                <TableCell sx={{ width: 100 }}>
                  <TextField
                    size="small"
                    type="number"
                    // placeholder="Scale"
                    value={rowState.scale}
                    disabled={!rowEditable}
                    onChange={(event) => onRowScaleChange(idx, event.target.value)}
                  />
                </TableCell>
                <TableCell sx={{ width: 80 }}>
                  <TextField
                    select
                    size="small"
                    value={rowState.op || 'mul'}
                    disabled={!rowEditable}
                    onChange={(event) => onRowOpChange(idx, event.target.value)}
                  >
                    <MenuItem value="mul">×</MenuItem>
                    <MenuItem value="div">÷</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>{pair?.start_register ?? ''}</TableCell>
                <TableCell>{pair?.size ?? ''}</TableCell>
                <TableCell>{pair?.target_data_type || pair?.data_type || ''}</TableCell>
                <TableCell>{Array.isArray(pair?.raw_registers) ? pair.raw_registers.join(', ') : ''}</TableCell>
                <TableCell>{finalValue === null || finalValue === undefined ? '' : String(finalValue)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
