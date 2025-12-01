import React from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

export default function PlcLoadingOverlay({ loading }) {
  if (!loading) return null;
  return (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1500 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Loading configuration…</Typography>
      </Stack>
    </Box>
  );
}
