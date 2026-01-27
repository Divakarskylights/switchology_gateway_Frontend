import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function ResultHeader({ ok, inspectorRowsCount, inspectorOpen, onToggleInspector }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {ok ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
        <Typography variant="h6">Results</Typography>
      </Box>
      {inspectorRowsCount ? (
        <Button size="small" variant={inspectorOpen ? 'contained' : 'outlined'} onClick={onToggleInspector}>
          {inspectorOpen ? 'Hide data inspector' : 'Show data inspector'}
        </Button>
      ) : null}
    </Box>
  );
}
