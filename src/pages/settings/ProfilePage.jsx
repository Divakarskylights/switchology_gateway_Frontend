import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Grid, Grow, Paper } from '@mui/material'; // Added Grow and Paper
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { graphqlClient } from "../../services/client";
import { INSERT_PROFILE_DATA, UPDATE_PROFILE, GET_PROFILE_DATA } from "../../services/query";
import { ProfileForm } from "../../features/profile/components/ProfileForm";
import { configInit } from '../../components/layout/globalvariable';
import { clearToken } from '../../utils/secureUrls';
// import { useSecureNavigation } from '../../hooks/useSecureNavigation';

function ProfilePage() {
    const navigate = useNavigate();
    console.log("navigate=>", navigate);

    // const { navigateToDashboard } = useSecureNavigation();
    const gatewayName = configInit.gatewayName || "";

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

    console.log("profileData=>", profileData, configInit.gatewayName,);

    useEffect(() => {
        console.log("ProfilePage - useEffect started");
        const fetchProfileData = async () => {
            try {
                console.log("ProfilePage - fetching profile data...");
                const data = await graphqlClient.request(GET_PROFILE_DATA);
                const profile = data?.allProfiles?.nodes?.[0];
                console.log("profile=>", profile);

                if (profile) {
                    setProfileData(prev => ({
                        ...prev,
                        gatewayname: profile.gatewayName || gatewayName,
                        name: profile.name || '',
                        buildingName: profile.buildingName || '',
                        address: profile.address || '',
                        email: profile.email || '',
                        organization: profile.orgname || '',
                        userPresent: true,
                        nodeId: profile.nodeId,
                        userid: profile.userid,
                        dbAdminPass: profile.adminPassword || '',
                        dbViewerPass: profile.viewerPassword || '',
                    }));
                } else {
                    setProfileData(prev => ({
                        ...prev,
                        userPresent: false
                    }));
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Failed to fetch profile data');
            } finally {
                setLoading(false);
                setShowContent(true);
                console.log("ProfilePage - loading finished, showContent set to true");
            }
        };
        fetchProfileData();
    }, [gatewayName]);

    const handleSubmit = async (formData) => {
        try {
            if (profileData.userPresent) {
                // Update existing profile
                const updateVariables = {
                    input: {
                        nodeId: profileData.nodeId,
                        profilePatch: {
                            userid: profileData.userid,
                            name: formData.name,
                            buildingName: formData.buildingName,
                            address: formData.address,
                            email: formData.email,
                            orgname: formData.organization,
                            adminPassword: checkboxStates.resetAdmin ? (formData.newpassword || '0000') : profileData.dbAdminPass,
                            viewerPassword: checkboxStates.resetViewer ? (formData.conformpassword || '0000') : profileData.dbViewerPass,
                        }
                    }
                };

                await graphqlClient.request(UPDATE_PROFILE, updateVariables);
                toast.success("Profile updated successfully");
            } else {
                // Create new profile
                // Validate passwords before creating profile
                if ((formData.adminPassword || '').length < 4) {
                    toast.error('Admin password must be at least 4 characters');
                    return;
                }
                if ((formData.viewerPassword || '').length < 4) {
                    toast.error('Viewer password must be at least 4 characters');
                    return;
                }
                if (formData.adminPassword !== formData.adminConfirmPassword) {
                    toast.error('Admin passwords do not match');
                    return;
                }
                if (formData.viewerPassword !== formData.viewerConfirmPassword) {
                    toast.error('Viewer passwords do not match');
                    return;
                }
                if (formData.adminPassword === formData.viewerPassword) {
                    toast.error('Admin and Viewer passwords must be different');
                    return;
                }
                const createVariables = {
                    input: {
                        profile: {
                            userid: formData.name.toLowerCase().replace(/\s+/g, ''),
                            name: formData.name,
                            buildingName: formData.buildingName,
                            address: formData.address,
                            email: formData.email,
                            orgname: formData.organization,
                            // Use the actual entered passwords from the new profile form
                            adminPassword: formData.adminPassword || '0000',
                            viewerPassword: formData.viewerPassword || '0000',
                            gatewayName: formData.gatewayname,
                        }
                    }
                };
                await graphqlClient.request(INSERT_PROFILE_DATA, createVariables);
                toast.success("Profile created successfully");
                // Clear any existing auth/session and go to login
                try { clearToken(); } catch { }
                try { localStorage.removeItem('userid'); } catch { }
                try { localStorage.removeItem('userRole'); } catch { }
                try { sessionStorage.clear(); } catch { }
                navigate('/auth/login', { replace: true });
                setTimeout(() => {
                    window.location.reload();
                }, 700);
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