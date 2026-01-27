import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

export default function PresetSummaryPanel({ summaryModbus, loading, error }) {
  if (!summaryModbus) return null;
  const modeIsBulk = Boolean(summaryModbus?.bulk) ||
    String(summaryModbus?.call_register || summaryModbus?.mode || '')
      .toLowerCase() === 'bulk';
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Meter preset (from summary)
      </Typography>
      <Typography variant="body2">
        Function: <strong>{summaryModbus.functionCode ?? '–'}</strong> · Type:{' '}
        <strong>
          {(() => {
            if (Object.prototype.hasOwnProperty.call(summaryModbus, 'type') && summaryModbus.type === null) {
              return 'null';
            }
            return summaryModbus.displayType ?? summaryModbus.valueType ?? 'float_custom';
          })()}
        </strong> · Address:{' '}
        <strong>{summaryModbus.address ?? '–'}</strong> · Quantity:{' '}
        <strong>{summaryModbus.quantity ?? '–'}</strong> · Mode:{' '}
        <strong>{modeIsBulk ? 'Bulk' : 'Single'}</strong>
      </Typography>
      {summaryModbus?.blocks?.length ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Additional blocks:
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {summaryModbus.blocks.map((block, idx) => (
              <Grid item key={`summary-block-${block.address}-${idx}`}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.85rem',
                  }}
                >
                  Addr {block.address} · Qty {block.quantity}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
      {loading ? (
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Loading presets…
        </Typography>
      ) : error ? (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
