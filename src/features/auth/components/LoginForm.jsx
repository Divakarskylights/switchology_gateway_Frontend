import React from 'react';
import { Box, Button, Dialog, DialogContent, TextField, Typography } from '@mui/material';
import PasswordField from '../../../features/profile/components/PasswordField'; // Adjusted path

const LoginForm = ({
  password,
  setPassword,
  onSubmit,
  showForgotDialog,
  setShowForgotDialog,
  forgotAuthKey,
  setForgotAuthKey,
  resetTarget,
  setResetTarget,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleResetPassword,
  role,
}) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <PasswordField
        label={`${role} Password`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!password && password.length < 4}
        helperText={password && password.length < 4 ? 'Minimum 4 characters' : ''}
      />

      {role === 'Admin' && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => setShowForgotDialog(true)}
          >
            Forgot Password?
          </Typography>
        </Box>
      )}
      <Button
        type="submit"
        variant="contained"
        size="small"
        disabled={password.length !== 4}
        // sx={{ marginTop: 1 }}
      >
        Login
      </Button>
      <ForgotPasswordDialog
        open={showForgotDialog}
        onClose={() => setShowForgotDialog(false)}
        authKey={forgotAuthKey}
        onAuthKeyChange={setForgotAuthKey}
        resetTarget={resetTarget}
        onResetTargetChange={setResetTarget}
        newPassword={newPassword}
        onNewPasswordChange={setNewPassword}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onReset={handleResetPassword}
      />
    </form>
  );
};

export default LoginForm;

// Reusable Forgot Password Dialog
export const ForgotPasswordDialog = ({ open, onClose, authKey, onAuthKeyChange, resetTarget, onResetTargetChange, newPassword, onNewPasswordChange, confirmPassword, onConfirmPasswordChange, onReset }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" textAlign='center'>Forgot Password</Typography>
      <TextField
        label="Auth Key"
        type="password"
        value={authKey}
        onChange={(e) => onAuthKeyChange(e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="Change For"
        select
        value={resetTarget}
        onChange={(e) => onResetTargetChange(e.target.value)}
        SelectProps={{ native: true }}
        fullWidth
        size="small"
      >
        <option value="ADMIN">Admin</option>
        <option value="VIEWER">Viewer</option>
      </TextField>
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => onNewPasswordChange(e.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        fullWidth
        size="small"
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onReset}
          disabled={!authKey || !newPassword || newPassword !== confirmPassword}
          fullWidth
        >
          Reset
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
);
