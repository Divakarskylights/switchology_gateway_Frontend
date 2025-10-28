import React from 'react';
import { Grow, Chip } from '@mui/material';

const MeterChip = ({ meter, isSelected, isLive, onClick, index }) => (
  <Grow in={true} timeout={150 * (index + 1)}>
    <Chip
      label={`${meter.label} (ID: ${meter.meter_no})`}
      onClick={onClick}
      sx={{
        cursor: 'pointer', fontWeight: 600,
        background: isLive
          ? 'green'
          : isSelected
            ? (theme) => theme.palette.primary.main
            : undefined,
        color: isLive
          ? 'white'
          : isSelected
            ? (theme) => theme.palette.primary.contrastText
            : undefined,
        '&:hover': {
          background: isLive
            ? 'darkgreen'
            : (theme) => theme.palette.primary.light,
          color: (theme) => theme.palette.primary.contrastText,
        },
        transition: 'background-color 0.3s, color 0.3s',
      }}
    />
  </Grow>
);

export default MeterChip;
