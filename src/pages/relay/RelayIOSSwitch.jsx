import React from "react";
import { Switch, styled } from "@mui/material";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 25,
  padding: 0,
  display: 'flex',
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 1,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#65C466' : '#65C466',
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 25,
    height: 23,
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 32 / 2,
    backgroundColor:
      theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

export default IOSSwitch;
