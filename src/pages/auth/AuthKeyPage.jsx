
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Box, Button, TextField, Typography, Grow } from '@mui/material'; // Added Grow
import { useSecureNavigation } from '../../hooks/useSecureNavigation';
import useAuthKey from '../../features/auth/hooks/useAuthKey';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
const AuthKeyPage = ({
  title = 'Gateway Authentication Required',
  redirectTo = '/dashboard',
  validKey = import.meta.env.VITE_AUTH_PRE || 'default-key',
}) => {
  const { navigateToDashboard } = useSecureNavigation();
  const { apiKey, error, handleInputChange } = useAuthKey({
    validKey,
    onSuccessRedirect: redirectTo,
  });
  const { updateGatewayData } = useAuth();
  const [loaded, setLoaded] = useState(false); // For animation

  useEffect(() => {
    setLoaded(true); // Trigger animation on mount
  }, []);

  const handleSecureSubmit = async () => {
    try {
      if (apiKey === validKey) {
        console.log('AuthKeyPage - Key matches, authentication successful');

              console.log('Authentication successful - gateway lock should be updated to true');

        await updateGatewayData(false)
        // Use secure navigation to dashboard
        navigateToDashboard();
      } else {
        toast.error('Invalid authentication key');
        console.log('AuthKeyPage - Key does not match');
        // Handle error in the useAuthKey hook
      }
    } catch (err) {
      console.warn('Error updating gateway lock:', err);
      // Still redirect even if update fails
      navigateToDashboard();
    }

  };

  return (
    <Grow in={loaded} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          p: 2, // Added padding for smaller screens
        }}
      >
        <Typography variant="h5" textAlign="center">{title}</Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary">
          Please enter the authentication key to continue
        </Typography>
        <TextField
          size="small"
          label="Authentication Key"
          value={apiKey}
          onChange={handleInputChange}
          sx={{ maxWidth: '400px', width: '100%' }}
          InputProps={{
            endAdornment: (
              <Button variant="contained" size="small" onClick={handleSecureSubmit}>
                Enter
              </Button>
            ),
          }}
        />
        {error && <Typography color="error">{error}</Typography>}
      </Box>
    </Grow>
  );
};

export default AuthKeyPage;
