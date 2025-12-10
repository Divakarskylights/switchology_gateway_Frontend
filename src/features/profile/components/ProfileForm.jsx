import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material';
import PasswordField from './PasswordField'; // Adjusted path
import useRole from '../../../redux/store/useRole';

export const ProfileForm = ({ profileData, onChange, onSubmit, isNewProfile, onCheckboxChange }) => {
  const [resetAdmin, setResetAdmin] = useState(false);
  const [resetViewer, setResetViewer] = useState(false);
  const { role } = useRole();

  // Notify parent component when checkboxes change
  useEffect(() => {
    if (onCheckboxChange) {
      onCheckboxChange({ resetAdmin, resetViewer });
    }
  }, [resetAdmin, resetViewer, onCheckboxChange]);

  console.log("profileDatvvdvdva=>", profileData, "role=>", role);
  return (
    <form onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Gateway Name"
            value={profileData.gatewayname}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Name"
            name="name"
            value={profileData.name}
            onChange={onChange}
            required
            disabled={!isNewProfile && role !== 'ADMIN'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Building Name"
            name="buildingName"
            value={profileData.buildingName}
            onChange={onChange}
            required
            disabled={!isNewProfile && role !== 'ADMIN'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Address"
            name="address"
            value={profileData.address}
            onChange={onChange}
            required
            disabled={!isNewProfile && role !== 'ADMIN'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Email"
            name="email"
            type="email"
            value={profileData.email}
            onChange={onChange}
            required
            disabled={!isNewProfile && role !== 'ADMIN'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Organization"
            name="organization"
            value={profileData.organization}
            onChange={onChange}
            required
            disabled={!isNewProfile && role !== 'ADMIN'}
          />
        </Grid>

        {!isNewProfile && role === 'ADMIN' && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Password Management
              </Typography>
              <Box sx={{
                p: 1.5,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#f8f9fa'
              }}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={resetAdmin}
                          onChange={(e) => {
                            setResetAdmin(e.target.checked);
                            if (onCheckboxChange) {
                              onCheckboxChange({ resetAdmin: e.target.checked, resetViewer });
                            }
                          }}
                          color="primary"
                          size="small"
                          sx={{
                            '&.Mui-checked': {
                              color: '#1976d2',
                            },
                            padding: '4px',
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.2rem',
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          Reset Admin Password
                        </Typography>
                      }
                      sx={{ margin: 0, '& .MuiFormControlLabel-label': { py: 0.5 } }}
                    />
                  </Grid>

                  {resetAdmin && (
                    <Grid item xs={12}>
                      <Box sx={{ pl: 3 }}>
                        <PasswordField
                          label="New Admin Password"
                          name="newpassword"
                          value={profileData.newpassword}
                          onChange={onChange}
                          error={!!profileData.newpassword && profileData.newpassword.length < 4}
                          helperText={profileData.newpassword && profileData.newpassword.length < 4 ? 'Minimum 4 characters' : ''}
                        />
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={resetViewer}
                          onChange={(e) => {
                            setResetViewer(e.target.checked);
                            if (onCheckboxChange) {
                              onCheckboxChange({ resetAdmin, resetViewer: e.target.checked });
                            }
                          }}
                          color="primary"
                          size="small"
                          sx={{
                            '&.Mui-checked': {
                              color: '#1976d2',
                            },
                            padding: '4px',
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.2rem',
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          Reset Viewer Password
                        </Typography>
                      }
                      sx={{ margin: 0, '& .MuiFormControlLabel-label': { py: 0.5 } }}
                    />
                  </Grid>

                  {resetViewer && (
                    <Grid item xs={12}>
                      <Box sx={{ pl: 3 }}>
                        <PasswordField
                          label="New Viewer Password"
                          name="conformpassword"
                          value={profileData.conformpassword}
                          onChange={onChange}
                          error={!!profileData.conformpassword && profileData.conformpassword.length < 4}
                          helperText={profileData.conformpassword && profileData.conformpassword.length < 4 ? 'Minimum 4 characters' : ''}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

          </>
        )}

        {isNewProfile && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>Admin Password</Typography>
              <PasswordField
                label="Admin Password"
                name="adminPassword"
                value={profileData.adminPassword}
                onChange={onChange}
                required
                error={!!profileData.adminPassword && profileData.adminPassword.length < 4}
                helperText={profileData.adminPassword && profileData.adminPassword.length < 4 ? 'Minimum 4 characters' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordField
                label="Confirm Admin Password"
                name="adminConfirmPassword"
                value={profileData.adminConfirmPassword}
                onChange={onChange}
                required
                error={!!profileData.adminConfirmPassword && profileData.adminConfirmPassword !== profileData.adminPassword}
                helperText={profileData.adminConfirmPassword && profileData.adminConfirmPassword !== profileData.adminPassword ? 'Passwords do not match' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>Viewer Password</Typography>
              <PasswordField
                label="Viewer Password"
                name="viewerPassword"
                value={profileData.viewerPassword}
                onChange={onChange}
                required
                error={!!profileData.viewerPassword && profileData.viewerPassword.length < 4}
                helperText={profileData.viewerPassword && profileData.viewerPassword.length < 4 ? 'Minimum 4 characters' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordField
                label="Confirm Viewer Password"
                name="viewerConfirmPassword"
                value={profileData.viewerConfirmPassword}
                onChange={onChange}
                required
                error={!!profileData.viewerConfirmPassword && profileData.viewerConfirmPassword !== profileData.viewerPassword}
                helperText={profileData.viewerConfirmPassword && profileData.viewerConfirmPassword !== profileData.viewerPassword ? 'Passwords do not match' : ''}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={
            isNewProfile
              ? !profileData.adminPassword || !profileData.adminConfirmPassword ||
              !profileData.viewerPassword || !profileData.viewerConfirmPassword ||
              profileData.adminPassword !== profileData.adminConfirmPassword ||
              profileData.viewerPassword !== profileData.viewerConfirmPassword ||
              profileData.adminPassword.length < 4 || profileData.viewerPassword.length < 4
              : role === 'ADMIN'
                ? (resetAdmin && (!profileData.newpassword || profileData.newpassword.length < 4)) ||
                (resetViewer && (!profileData.conformpassword || profileData.conformpassword.length < 4))
                : true
          }
        >
          {isNewProfile ? 'Create Profile' : 'Update Profile'}
        </Button>
      </Box>
    </form>
  );
};
