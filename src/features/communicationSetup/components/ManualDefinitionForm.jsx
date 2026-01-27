import React from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import ConfigItem from '../../setup/components/SetUpConfigItem';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function ManualDefinitionForm({
  definition,
  functionOptions,
  valueTypeOptions,
  onChangeFunctionCode,
  onChangeValueType,
  onChangeAddress,
  onChangeQuantity,
  onChangeScanRateMs,
  blocks,
  onAddBlock,
  onBlockFieldChange,
  onRemoveBlock,
}) {
  return (
    <>
      <Grid item xs={12} md={6}>
        <ConfigItem
          label="Function"
          value={definition?.functionCode ?? 3}
          onChange={onChangeFunctionCode}
          name="functionCode"
          select
          options={functionOptions}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ConfigItem
          label="Type"
          value={definition?.valueType ?? 'none'}
          onChange={onChangeValueType}
          name="valueType"
          select
          options={valueTypeOptions}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <ConfigItem
          label="Address"
          value={definition?.address ?? 0}
          onChange={onChangeAddress}
          name="address"
          type="number"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <ConfigItem
          label="Quantity"
          value={definition?.quantity ?? 10}
          onChange={onChangeQuantity}
          name="quantity"
          type="number"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <ConfigItem
          label="Scan rate (ms)"
          value={definition?.scanRateMs ?? 1000}
          onChange={onChangeScanRateMs}
          name="scanRateMs"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 0.75,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (blocks?.length || 0) ? 'background.paper' : 'background.default',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Additional address blocks</Typography>
            <Button size="small" variant="outlined" onClick={onAddBlock}>
              Add block
            </Button>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
            Use blocks to request multiple non-contiguous ranges (address + quantity) within a single read operation.
            The base address/quantity above will always be included.
          </Typography>
          {blocks?.length ? (
            <Grid container spacing={0.75}>
              {blocks.map((block, idx) => (
                <Grid item xs={12} key={`block-${idx}`}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' },
                      gap: 0.75,
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      p: 0.75,
                    }}
                  >
                    <TextField
                      label="Address"
                      type="number"
                      size="small"
                      value={block?.address ?? 0}
                      onChange={onBlockFieldChange(idx, 'address', (v) => Number(v))}
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      value={block?.quantity ?? 0}
                      onChange={onBlockFieldChange(idx, 'quantity', (v) => Number(v))}
                    />
                    <Button
                      onClick={() => onRemoveBlock(idx)}
                      sx={{ justifySelf: { xs: 'flex-start', sm: 'center' } }}
                      aria-label="Remove block"
                      startIcon={<DeleteOutlineIcon />}
                    >
                      Remove
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No additional blocks configured yet.
            </Typography>
          )}
        </Box>
      </Grid>
    </>
  );
}
