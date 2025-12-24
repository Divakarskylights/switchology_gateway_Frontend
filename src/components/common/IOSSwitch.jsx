import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import React from 'react';

// Compact iOS style switch
export const IOSSwitch = styled(React.forwardRef((props, ref) => (
  <Switch ref={ref} focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
)))(({ theme }) => ({
  width: 32,   // smaller width
  height: 18,  // smaller height
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 1.5, // tighter margin
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(14px)', // adjusted for smaller size
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#65C466' : '#65C466',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,   // smaller knob
    height: 14,
  },
  '& .MuiSwitch-track': {
    borderRadius: 18 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));
