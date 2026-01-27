import React from 'react';
import { Box, FormControlLabel, Switch, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function BulkTogglePanel({ bulkEnabled, onToggle }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 1,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={<Switch checked={bulkEnabled} onChange={onToggle} />}
          label={bulkEnabled ? 'Bulk read' : 'Single read'}
        />
        <Tooltip
          title="Toggle to send either a bulk read request (single payload covering all blocks) or a traditional single-range read. This flag is included in Test payloads."
          arrow
        >
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
    </Box>
  );
}
