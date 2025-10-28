
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField, Typography, Grow, InputAdornment, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SetupPasswordDialog = ({ open, onClose, onConfirm, dialogType, actionDescription }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [effectiveDialogType, setEffectiveDialogType] = useState(dialogType);
  const [effectiveActionDescription, setEffectiveActionDescription] = useState(actionDescription);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setEffectiveDialogType(dialogType); 
      setEffectiveActionDescription(actionDescription);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); 
    } else {
      setPassword('');
      setShowPassword(false);
    }
  }, [open, dialogType, actionDescription]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(password);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  let title = 'Confirm Action';
  let description = effectiveActionDescription || 'Please enter your admin password to proceed.';

  if (effectiveDialogType === 'delete') {
    title = 'Confirm Deletion';
    description = 'Please enter your admin password to delete this meter.';
  } else if (effectiveDialogType === 'add') {
    title = 'Device Action';
    description = 'Please enter your admin password to add a new meter.';
  } else if (effectiveDialogType === 'toggleDevice') {
    title = 'Confirm Device Toggle';
    description = effectiveActionDescription || 'Please enter your admin password to toggle this device.';
  }


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Grow}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 5,
        }
      }}
    >
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <TextField
          inputRef={inputRef}
          type={showPassword ? 'text' : 'password'}
          label="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={handleClose} size="small">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm} 
          size="small"
          color="primary"
          disabled={!password}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetupPasswordDialog;
