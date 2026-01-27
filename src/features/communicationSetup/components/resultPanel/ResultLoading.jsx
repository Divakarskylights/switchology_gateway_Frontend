import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import UsbIcon from '@mui/icons-material/Usb';
import RouterIcon from '@mui/icons-material/Router';
import InsightsIcon from '@mui/icons-material/Insights';

export default function ModbusResultLoading() {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 3,
        minHeight: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,

          '@keyframes pulse': {
            '0%,100%': { transform: 'scale(1)', opacity: 0.6 },
            '50%': { transform: 'scale(1.15)', opacity: 1 },
          },

          '@keyframes packetMove': {
            '0%': { left: '8%', opacity: 0 },
            '10%': { opacity: 1 },
            '90%': { opacity: 1 },
            '100%': { left: '84%', opacity: 0 },
          },
        }}
      >
        {/* Devices Row */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
          }}
        >
          <Device icon={<UsbIcon />} label="Meter" />
          <Device icon={<RouterIcon />} label="Gateway" />
          <Device icon={<InsightsIcon />} label="App" />
        </Box>

        {/* Communication Line */}
        <Box sx={{ position: 'relative', width: '100%', height: 36 }}>
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              right: 24,
              top: '50%',
              height: 2,
              bgcolor: 'divider',
              transform: 'translateY(-50%)',
              borderRadius: 999,
            }}
          />

          {/* Signal pulses */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '50%',
                left: `${20 + i * 15}%`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                transform: 'translateY(-50%)',
                animation: 'pulse 1.2s infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}

          {/* Data packet */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              borderRadius: 1,
              bgcolor: 'primary.main',
              boxShadow: 3,
              animation: 'packetMove 1.4s linear infinite',
            }}
          />
        </Box>

        {/* Status */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" fontWeight={600}>
            Reading Modbus Registers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Polling device • Waiting for response
          </Typography>
        </Box>

        {/* Spinner */}
        <CircularProgress size={28} thickness={4} />
      </Box>
    </Paper>
  );
}

function Device({ icon, label }) {
  return (
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
      }}
    >
      {icon}
      <Typography variant="caption" fontWeight={500}>
        {label}
      </Typography>
    </Box>
  );
}
