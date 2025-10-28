import React, { useState, useEffect } from 'react';
import { Box, Typography, Grow, Paper, Link } from '@mui/material';

const SubscriptionPage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Grow in={loaded} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          p: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Subscription Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your gateway subscription is inactive. Please contact SKYLIGHTS ENERGY to renew your subscription.
          </Typography>
          
          <Box sx={{ 
            mt: 3,
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: '#f5f5f5'
          }}>
            <Typography variant="h6" gutterBottom>
              Contact SKYLIGHTS ENERGY
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Phone: <Link href="tel:09100010019">091000 10019</Link>
            </Typography>
            <Typography variant="body1">
              Email: <Link href="mailto:switchology@skylightsenergy.in">switchology@skylightsenergy.in</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Grow>
  );
};

export default SubscriptionPage;