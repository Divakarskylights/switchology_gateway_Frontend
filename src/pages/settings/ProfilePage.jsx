import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Grid, Grow, Paper } from '@mui/material'; // Added Grow and Paper
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProfileForm } from "../../features/profile/components/ProfileForm";
import { configInit } from '../../components/layout/globalvariable';
import { clearToken } from '../../utils/secureUrls';
import { fetchFirstProfile, invalidateProfilesCache } from '../../services/profileService';
// import { useSecureNavigation } from '../../hooks/useSecureNavigation';

function ProfilePage() {
    const navigate = useNavigate();
    console.log("navigate=>", navigate);

    // const { navigateToDashboard } = useSecureNavigation();
    const gatewayName = configInit.gatewayName || "";

    const applyProfileData = (profile, isMountedRef) => {
        if (!isMountedRef.current) return;
        if (profile) {
            setProfileData(prev => ({
                ...prev,
                gatewayname: profile.gatewayName || profile.gatewayname || gatewayName,
                name: profile.name || '',
                buildingName: profile.buildingName || profile.building_name || '',
                address: profile.address || '',
                email: profile.email || '',
                organization: profile.orgname || profile.organization || '',
                userPresent: true,
                userid: profile.userid,
                dbAdminPass: profile.adminPassword || profile.admin_password || '',
                dbViewerPass: profile.viewerPassword || profile.viewer_password || '',
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                userPresent: false
            }));
        }
    };

    const [profileData, setProfileData] = useState({
        gatewayname: gatewayName,
        name: '',
        buildingName: '',
        address: '',
        email: '',
        organization: '',
        newpassword: '',
        conformpassword: '',
        adminPassword: '',
        viewerPassword: '',
        adminConfirmPassword: '',
        viewerConfirmPassword: '',
        dbAdminPass: '',
        dbViewerPass: '',
        userPresent: false,
    });

    const [checkboxStates, setCheckboxStates] = useState({
        resetAdmin: false,
        resetViewer: false
    });

    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false); // For Grow animation

    // console.log("profileData=>", profileData, configInit.gatewayName,);

    useEffect(() => {
        console.log("ProfilePage - useEffect started");
        const isMountedRef = { current: true };
        let redirectedToServerIssue = false;

        const isLikelyNetworkError = (error) => {
            if (!error) return false;
            const message = String(error?.message || '').toLowerCase();
            return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network error');
        };

        const fetchProfileData = async () => {
            try {
                console.log("ProfilePage - fetching profile data...");
                const profile = await fetchFirstProfile();
                applyProfileData(profile, isMountedRef);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                if (isLikelyNetworkError(error)) {
                    redirectedToServerIssue = true;
                    navigate('/server-issue', {
                        replace: true,
                        state: { from: '/user/profile', reason: 'profile-api-unreachable' }
                    });
                } else if (isMountedRef.current) {
                    toast.error('Failed to fetch profile data');
                }
            } finally {
                if (isMountedRef.current && !redirectedToServerIssue) {
                    setLoading(false);
                    setShowContent(true);
                    console.log("ProfilePage - loading finished, showContent set to true");
                }
            }
        };
        fetchProfileData();

        return () => {
            isMountedRef.current = false;
        };
    }, [gatewayName, navigate]);

    const handleSubmit = async (formData) => {
        try {
            if (profileData.userPresent) {
                // Update existing profile using userid
                const updatePayload = {
                    name: formData.name,
                    building_name: formData.buildingName,
                    address: formData.address,
                    email: formData.email,
                    orgname: formData.organization,
                    adminPassword: checkboxStates.resetAdmin ? (formData.newpassword || '0000') : profileData.dbAdminPass,
                    viewerPassword: checkboxStates.resetViewer ? (formData.conformpassword || '0000') : profileData.dbViewerPass,
                };

                const response = await fetch(`${configInit.appBaseUrl}/api/profiles/${encodeURIComponent(profileData.userid)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                toast.success("Profile updated successfully");
                invalidateProfilesCache();
            } else {
                // Create new profile
                // Validate passwords before creating profile
                if (formData.adminPassword !== formData.adminConfirmPassword) {
                    toast.error('Admin passwords do not match');
                    return;
                }
                if (formData.viewerPassword !== formData.viewerConfirmPassword) {
                    toast.error('Viewer passwords do not match');
                    return;
                }
                const payload = {
                    userid: formData.name.toLowerCase().replace(/\s+/g, ''),
                    name: formData.name,
                    building_name: formData.buildingName,
                    address: formData.address,
                    email: formData.email,
                    orgname: formData.organization,
                    adminPassword: formData.adminPassword || '0000',
                    viewerPassword: formData.viewerPassword || '0000',
                    gatewayName: formData.gatewayname,
                };

                const saveProfile = async () => {
                    const response = await fetch(`${configInit.appBaseUrl}/api/profiles`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    toast.success("Profile created successfully");
                    invalidateProfilesCache();
                    // Clear any existing auth/session and go to login
                    try { clearToken(); } catch { }
                    try { localStorage.removeItem('userid'); } catch { }
                    try { localStorage.removeItem('userRole'); } catch { }
                    try { sessionStorage.clear(); } catch { }
                    navigate('/auth/login', { replace: true });
                    setTimeout(() => {
                        window.location.reload();
                    }, 700);
                };

                try {
                    await saveProfile();
                } catch (error) {
                    if (error.message?.includes('Failed to fetch')) {
                        navigate('/server-issue', {
                            replace: true,
                            state: { from: '/user/profile', reason: 'profile-save-network-error' }
                        });
                        return;
                    }
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3
        }}>
            <Grow in={showContent} timeout={500}>
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography align='center' variant="h6" gutterBottom>
                                    {profileData.userPresent ? 'Edit Profile' : 'Create Profile'}
                                </Typography>
                                <ProfileForm
                                    profileData={profileData}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setProfileData(prev => ({ ...prev, [name]: value }));
                                    }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit(profileData);
                                    }}
                                    isNewProfile={!profileData.userPresent}
                                    onCheckboxChange={setCheckboxStates}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Grow>
        </Box>
    );
}

export default ProfilePage;