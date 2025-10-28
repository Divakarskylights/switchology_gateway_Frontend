import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSecureNavigation } from '../../hooks/useSecureNavigation';
import SessionTimer from './SessionTimer';
import useAuth from '../../hooks/useAuth';
import ProfileUpdateDialog from './ProfileUpdateDialog';

const ProfileMenu = React.memo(({ anchorEl, onClose, onLogout, onProfileClick }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    slotProps={{
      paper: {
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          borderRadius: '8px',
        },
      }
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    <MenuItem onClick={onProfileClick} sx={{ gap: 1, px: 2, py: 1 }}>
      <AccountCircle fontSize="small" />
      <Typography variant="body2">Profile</Typography>
    </MenuItem>
    <MenuItem onClick={onLogout} sx={{ gap: 1, px: 2, py: 1, color: 'error.main' }}>
      <LogoutIcon fontSize="small" />
      <Typography variant="body2">Logout</Typography>
    </MenuItem>
  </Menu>
));

const Topbar = ({ open, setOpen, drawerWidth }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

  const { isLoggedIn, logout } = useAuth();
  const { navigateToProfile } = useSecureNavigation();

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    setMobileAnchorEl(null);
    setProfileDialogOpen(true);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { sm: open ? `${drawerWidth}px` : 0 },
        transition: (theme) => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}> 
        {isLoggedIn && ( 
          <Tooltip title={open ? "Close Menu" : "Open Menu"} arrow>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => setOpen(!open)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Switchology
        </Typography>
        {isLoggedIn && (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <SessionTimer />
              <Tooltip title="Profile Menu" arrow>
                <IconButton 
                  size="large" 
                  color="inherit" 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
              <SessionTimer />
              <Tooltip title="Profile Menu" arrow>
                <IconButton 
                  size="large" 
                  color="inherit" 
                  onClick={(e) => setMobileAnchorEl(e.currentTarget)}
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </Toolbar>
      {isLoggedIn && (
        <>
          <ProfileMenu 
            anchorEl={anchorEl} 
            onClose={() => setAnchorEl(null)} 
            onLogout={handleLogout} 
            onProfileClick={handleProfileClick}
          />
          <ProfileMenu 
            anchorEl={mobileAnchorEl} 
            onClose={() => setMobileAnchorEl(null)} 
            onLogout={handleLogout} 
            onProfileClick={handleProfileClick}
          />
        </>
      )}
      
      {/* Profile Update Dialog */}
      <ProfileUpdateDialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)} 
      />
    </AppBar>
  );
};

export default Topbar;

