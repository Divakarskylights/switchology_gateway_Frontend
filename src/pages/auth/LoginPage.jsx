import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grow, Tabs, Tab, useTheme } from '@mui/material'; // Added useTheme
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../services/client';
import { UPDATE_PROFILE_BY_USERID } from '../../services/query';
import SwitchologyLogo from '/Switchology.png';
import LoginForm from '../../features/auth/components/LoginForm';
import useRole from '../../redux/store/useRole';
import useAdminPasswordStore from '../../redux/store/useAdminPasswordStore';


const CustomTabPanel = React.forwardRef(function CustomTabPanel(props, ref) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`login-tabpanel-${index}`}
            aria-labelledby={`login-tab-${index}`}
            ref={ref}
            {...other}
        >
            {value === index && children}
        </div>
    );
});


const LoginPage = () => {
    const theme = useTheme(); // Added useTheme
    const navigate = useNavigate();
    const { setRole } = useRole();
    const [profileData, setProfileData] = useState(null);
    const [password, setPassword] = useState('');
    const [showForgotDialog, setShowForgotDialog] = useState(false);
    // Email not required for reset-by-auth-key flow
    const [forgotAuthKey, setForgotAuthKey] = useState('');
    const [resetTarget, setResetTarget] = useState('ADMIN'); // 'ADMIN' | 'VIEWER'
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRoleTab, setSelectedRoleTab] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
        
        const fetchProfileData = async () => {
            try {
                // const data = await graphqlClient.request(GET_PROFILE_DATA);
                await useAdminPasswordStore.getState().fetchAdminPassword();
                const adminPassword = useAdminPasswordStore.getState().adminPassword;
                const viewerPassword = useAdminPasswordStore.getState().viewerPassword;
                const nodeId = useAdminPasswordStore.getState().nodeId;
                const userid = useAdminPasswordStore.getState().userid;
                console.log("adadad", adminPassword, viewerPassword, nodeId, userid);

                if (adminPassword) {
                    setProfileData({
                        adminPassword,
                        viewerPassword,
                        nodeId,
                        userid
                    });
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
            }
        };

        fetchProfileData();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!profileData) {
            toast.error("Profile data not loaded. Please try again later.");
            return;
        }

        const isValidPassword = selectedRoleTab === 0
            ? password === profileData.adminPassword
            : password === profileData.viewerPassword;
        console.log("popopop", isValidPassword, password, profileData.adminPassword);
        
        const roleToSet = selectedRoleTab === 0 ? 'ADMIN' : 'VIEWER';
        if (isValidPassword) {
            try {
                // Set local state regardless of GraphQL success
                setRole(roleToSet);
                localStorage.setItem('userid', profileData.userid); // Store userid for later use
                localStorage.setItem('userRole', roleToSet); // Store role for later use
                // Create a simple token for secure URLs (no expiration)
                const tokenData = {
                    token: Math.random().toString(36).substring(2),
                    createdAt: Date.now()
                };
                const tokenStr = JSON.stringify(tokenData);
                // Store in both sessionStorage and localStorage for consistency
                sessionStorage.setItem('secureTokenData', tokenStr);
                localStorage.setItem('secureTokenData', tokenStr);
                
                console.log('Login successful - token set');
                console.log('Token stored:', tokenStr);
                console.log('User ID stored:', profileData.userid);
                console.log('Role stored:', roleToSet);
                // Navigate to dashboard using React Router
                navigate('/dashboard', { replace: true });
            } catch (error) {
                toast.error("Login failed: " + (error.message || "Unknown error"));
            }
        } else {
            toast.error("Invalid credentials");
        }
    };

    const handleResetPassword = async () => {
        const expectedKey = import.meta.env.VITE_AUTH_PRE || '';
        console.log("erere", expectedKey);
        
        if (!forgotAuthKey || forgotAuthKey !== expectedKey) {
            toast.error('Invalid authentication key');
            return;
        }
        if (!newPassword || newPassword.length < 4) {
            toast.error('Password must be at least 4 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        // Prevent Admin and Viewer passwords from being the same
        if (resetTarget === 'ADMIN' && newPassword === profileData?.viewerPassword) {
            toast.error('Admin and Viewer passwords cannot be the same');
            return;
        }
        if (resetTarget === 'VIEWER' && newPassword === profileData?.adminPassword) {
            toast.error('Viewer and Admin passwords cannot be the same');
            return;
        }
        try {
            // Use userid from loaded profileData to reset password (no email)
            if (!profileData?.userid) {
                toast.error('User not loaded');
                return;
            }
            const data = await graphqlClient.request(UPDATE_PROFILE_BY_USERID, {
                input: {
                    userid: profileData.userid,
                    profilePatch: {
                        ...(resetTarget === 'ADMIN' ? { adminPassword: newPassword } : { viewerPassword: newPassword })
                    }
                }
            });
            if (data?.updateProfileByUserid?.profile) {
                toast.success(`${resetTarget === 'ADMIN' ? 'Admin' : 'Viewer'} password updated`);
                setShowForgotDialog(false);
                setForgotAuthKey('');
                setNewPassword('');
                setConfirmPassword('');
                window.location.reload();
            } else {
                toast.error("Reset failed or email not found.");
            }
        } catch (error) {
            toast.error("Reset failed: " + (error.message || "Unknown error"));
        }
    };

    const orangeRed = { // This can be moved to the theme if used widely
        50: '#FFF4F2', 100: '#FFDAD2', 200: '#FFBEB2', 300: '#FFA79D',
        400: '#FF8F82', 500: '#F2592A', 600: '#D04A1A', 700: '#AD3B10',
        800: '#8A2C0C', 900: '#5D1D08',
    };

    const handleTabChange = (event, newValue) => {
        setSelectedRoleTab(newValue);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '98vh', backgroundColor: theme.palette.background.default }}>
            <Grow in={loaded} timeout={700}>
                <Card sx={{ maxWidth: 500, width: '100%', boxShadow: theme.shadows[8], borderRadius: 3, overflow: 'hidden' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
                        <img src={SwitchologyLogo} alt="Switchology Logo" style={{ height: '80px', width: '100%', objectFit: 'scale-down' }} />
                        <Typography sx={{
                            maxWidth: '80%', mx: 'auto', fontWeight: 600,
                            fontSize: 13, lineHeight: '16px', textAlign: 'center',
                            color: theme.palette.text.secondary, my: 1
                        }}>
                            You can Login using Admin or Viewer
                        </Typography>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0 }}>
                            <Tabs
                                value={selectedRoleTab}
                                onChange={handleTabChange}
                                indicatorColor="primary" // Uses theme's primary
                                textColor="primary" // Uses theme's primary
                                variant="fullWidth"
                                sx={{
                                    minWidth: { xs: '100%', sm: 400 },
                                    backgroundColor: 'white', // Keep specific orange-red for tab background
                                    borderRadius: '12px',
                                    marginBottom: '16px',
                                    boxShadow: `0 4px 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.25)'}`,
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: orangeRed[600],
                                        height: '4px',
                                        borderRadius: '2px',
                                    },
                                }}
                            >
                                <Tab
                                    label="Admin"
                                    id="login-tab-0"
                                    aria-controls="login-tabpanel-0"
                                    sx={{
                                        color: orangeRed[600],
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem',
                                        borderRadius: '8px 0 0 8px',
                                        transition: 'background-color 0.3s, color 0.3s, transform 0.2s',
                                        '&.Mui-selected': {
                                            backgroundColor: orangeRed[600],
                                            color: 'white',
                                        },
                                        '&:hover': {
                                            backgroundColor: orangeRed[400],
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                />
                                <Tab
                                    label="Viewer"
                                    id="login-tab-1"
                                    aria-controls="login-tabpanel-1"
                                    sx={{
                                        color: orangeRed[600],
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem',
                                        borderRadius: '0 8px 8px 0',
                                        transition: 'background-color 0.3s, color 0.3s, transform 0.2s',
                                        '&.Mui-selected': {
                                            backgroundColor: orangeRed[600],
                                            color: 'white',
                                        },
                                        '&:hover': {
                                            backgroundColor: orangeRed[400],
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                />
                            </Tabs>
                            <Box sx={{ width: '100%', px: { xs: 1, sm: 2 } }}>
                                {!profileData ? (
                                    <Typography color="error" align="center" sx={{ my: 2 }}>
                                        Loading profile data...
                                    </Typography>
                                ) : (
                                    <>
                                        <CustomTabPanel value={selectedRoleTab} index={0}>
                                            <LoginForm
                                                password={password}
                                                setPassword={setPassword}
                                                onSubmit={handleLogin}
                                                showForgotDialog={showForgotDialog}
                                                setShowForgotDialog={setShowForgotDialog}
                                                forgotAuthKey={forgotAuthKey}
                                                setForgotAuthKey={setForgotAuthKey}
                                                resetTarget={resetTarget}
                                                setResetTarget={setResetTarget}
                                                newPassword={newPassword}
                                                setNewPassword={setNewPassword}
                                                confirmPassword={confirmPassword}
                                                setConfirmPassword={setConfirmPassword}
                                                handleResetPassword={handleResetPassword}
                                                role="Admin"
                                                disabled={!profileData}
                                            />
                                        </CustomTabPanel>
                                        <CustomTabPanel value={selectedRoleTab} index={1}>
                                            <LoginForm
                                                password={password}
                                                setPassword={setPassword}
                                                onSubmit={handleLogin}
                                                showForgotDialog={showForgotDialog}
                                                setShowForgotDialog={setShowForgotDialog}
                                                forgotAuthKey={forgotAuthKey}
                                                setForgotAuthKey={setForgotAuthKey}
                                                resetTarget={resetTarget}
                                                setResetTarget={setResetTarget}
                                                newPassword={newPassword}
                                                setNewPassword={setNewPassword}
                                                confirmPassword={confirmPassword}
                                                setConfirmPassword={setConfirmPassword}
                                                handleResetPassword={handleResetPassword}
                                                role="Viewer"
                                                disabled={!profileData}
                                            />
                                        </CustomTabPanel>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grow>
        </Box>
    );
};

export default LoginPage;
