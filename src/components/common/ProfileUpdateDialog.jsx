import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../services/client';
import { UPDATE_PROFILE, GET_PROFILE_DATA } from '../../services/query';
import useRole from '../../redux/store/useRole';

const ProfileUpdateDialog = ({ open, onClose }) => {
  const { role } = useRole();
  const [profileData, setProfileData] = useState({
    name: '',
    buildingName: '',
    address: '',
    email: '',
    organization: '',
    newpassword: '',
    conformpassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetAdmin, setResetAdmin] = useState(false);
  const [resetViewer, setResetViewer] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile data when dialog opens
  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlClient.request(GET_PROFILE_DATA);
      const currentUserId = localStorage.getItem("userid");
      const profile = data?.allProfiles?.nodes?.find(
        (p) => p.userid === currentUserId
      );

      if (profile) {
        setProfileData({
          name: profile.name || '',
          buildingName: profile.buildingName || '',
          address: profile.address || '',
          email: profile.email || '',
          organization: profile.orgname || '',
          newpassword: '',
          conformpassword: '',
        });
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Get current profile data to get nodeId and userid
      const data = await graphqlClient.request(GET_PROFILE_DATA);
      const currentUserId = localStorage.getItem("userid");
      const currentProfile = data?.allProfiles?.nodes?.find(
        (p) => p.userid === currentUserId
      );

      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      const updateVariables = {
        input: {
          nodeId: currentProfile.nodeId,
          profilePatch: {
            userid: currentProfile.userid,
            name: profileData.name,
            buildingName: profileData.buildingName,
            address: profileData.address,
            email: profileData.email,
            orgname: profileData.organization,
            // Only update passwords if checkboxes are checked
            ...(resetAdmin && profileData.newpassword && { adminPassword: profileData.newpassword }),
            ...(resetViewer && profileData.conformpassword && { viewerPassword: profileData.conformpassword }),
          }
        }
      };

      await graphqlClient.request(UPDATE_PROFILE, updateVariables);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setProfileData({
      name: '',
      buildingName: '',
      address: '',
      email: '',
      organization: '',
      newpassword: '',
      conformpassword: '',
    });
    setResetAdmin(false);
    setResetViewer(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Update Profile
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  required
                  disabled={role !== 'ADMIN'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Building Name"
                  name="buildingName"
                  value={profileData.buildingName}
                  onChange={handleInputChange}
                  required
                  disabled={role !== 'ADMIN'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  required
                  disabled={role !== 'ADMIN'}
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
                  onChange={handleInputChange}
                  required
                  disabled={role !== 'ADMIN'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Organization"
                  name="organization"
                  value={profileData.organization}
                  onChange={handleInputChange}
                  required
                  disabled={role !== 'ADMIN'}
                />
              </Grid>

              {role === 'ADMIN' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <input
                              type="checkbox"
                              checked={resetAdmin}
                              onChange={(e) => setResetAdmin(e.target.checked)}
                              style={{ marginRight: 8 }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              Reset Admin Password
                            </Typography>
                          </Box>
                          {resetAdmin && (
                            <TextField
                              fullWidth
                              size="small"
                              label="New Admin Password"
                              name="newpassword"
                              type="password"
                              value={profileData.newpassword}
                              onChange={handleInputChange}
                              error={!!profileData.newpassword && profileData.newpassword.length < 4}
                              helperText={profileData.newpassword && profileData.newpassword.length < 4 ? 'Minimum 4 characters' : ''}
                              sx={{ ml: 3 }}
                            />
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <input
                              type="checkbox"
                              checked={resetViewer}
                              onChange={(e) => setResetViewer(e.target.checked)}
                              style={{ marginRight: 8 }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              Reset Viewer Password
                            </Typography>
                          </Box>
                          {resetViewer && (
                            <TextField
                              fullWidth
                              size="small"
                              label="New Viewer Password"
                              name="conformpassword"
                              type="password"
                              value={profileData.conformpassword}
                              onChange={handleInputChange}
                              error={!!profileData.conformpassword && profileData.conformpassword.length < 4}
                              helperText={profileData.conformpassword && profileData.conformpassword.length < 4 ? 'Minimum 4 characters' : ''}
                              sx={{ ml: 3 }}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={saving}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={saving || loading}
          sx={{ minWidth: 100 }}
        >
          {saving ? <CircularProgress size={20} /> : 'Update Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileUpdateDialog;
