
import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import {
  List, ListItem, ListItemButton,
  ListItemIcon, ListItemText,
  IconButton, Tooltip, styled,
  Grow, Typography
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import ElectricMeterOutlinedIcon from '@mui/icons-material/ElectricMeterOutlined';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import useThemeChange from '../../redux/store/useThemeStore';
import useRole from '../../redux/store/useRole';
import { useSecureNavigation } from '../../hooks/useSecureNavigation';

const DrawerHeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar, // Necessary for proper spacing with AppBar
  justifyContent: 'flex-end',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
}));

const navItems = [
  { name: 'Home', route: '/dashboard', Icon: HomeOutlinedIcon, roles: ['ADMIN', 'VIEWER'] },
  { name: 'Setup', route: '/admin/setup', Icon: EngineeringOutlinedIcon, roles: ['ADMIN'] },
  // { name: 'Relay Setup', route: '/admin/relay-setup', Icon: SettingsInputComponentIcon, roles: ['ADMIN'] },
  { name: 'Energy Monitoring', route: '/analytics/ems', Icon: AnalyticsOutlinedIcon, roles: ['ADMIN', 'VIEWER'] },
  { name: 'KPI', route: '/analytics/kpi', Icon: AssessmentIcon, roles: ['ADMIN', 'VIEWER'] },
  { name: 'Meter Billing', route: '/admin/meter-config', Icon: SpeedOutlinedIcon, roles: ['ADMIN'] },
  { name: 'Scada', route: '/scada/diagram', Icon: ElectricMeterOutlinedIcon, roles: ['ADMIN', 'VIEWER'] }, // Removed SLD
];

export const DrawerList = memo(({ open, setOpen, isXs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { themeMode } = useThemeChange();
  const { role } = useRole();
  const { navigateToSecure } = useSecureNavigation();

  // Debug: Log role changes
  React.useEffect(() => {
    console.log('DrawerList: Role changed to:', role);
  }, [role]);

  const handleNavigation = (route) => {
    navigateToSecure(route);
    if (isXs && open) {
      setOpen(false);
    }
  };

  return (
    <>
      <DrawerHeaderStyled>
        <Tooltip title="Close Menu" arrow>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon sx={{ color: theme.palette.text.secondary }} />
          </IconButton>
        </Tooltip>
      </DrawerHeaderStyled>
      <List sx={{ pt: 1, px: 1.5 }}> {/* Increased horizontal padding */}
        {navItems.map((item, index) => {
          const isAllowed = item.roles.includes(role);
          console.log('Menu item:', item.name, 'Role:', role, 'Roles allowed:', item.roles, 'Is allowed:', isAllowed);
          const isSelected = location.pathname === item.route;
          // console.log(isSelected);


          return (
            <Grow
              key={item.name}
              in={open}
              style={{ transformOrigin: '0 0 0' }}
              timeout={open ? 300 + index * 50 : 0} // Adjusted stagger
            >
              <ListItem disablePadding sx={{ mb: 0.75 }}> {/* Slightly increased margin bottom */}
                <ListItemButton
                  onClick={() => isAllowed && handleNavigation(item.route)}
                  selected={isSelected}
                  disabled={!isAllowed}
                  sx={{
                    borderRadius: '8px', // Consistent border radius
                    minHeight: 44,
                    py: 1.25, // Adjusted padding
                    px: 2,
                    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-left-color 0.2s ease-in-out',
                    borderLeft: isSelected ? `3px solid ${theme.palette.accent?.main || theme.palette.primary.main}` : '3px solid transparent', // Accent border for selected
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.08), // More subtle hover
                      color: theme.palette.text.primary,
                      borderLeftColor: alpha(theme.palette.primary.light, 0.5), // Hover border color
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main, // Text color for selected item
                      borderLeftColor: theme.palette.accent?.main || theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.25),
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.accent?.main || theme.palette.primary.main, // Icon color for selected item
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: '600', // Bolder selected text
                        color: theme.palette.accent?.main || theme.palette.primary.main,
                      }
                    },
                    '&.Mui-disabled': {
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 36,
                    color: isSelected ? (theme.palette.accent?.main || theme.palette.primary.main) : (isAllowed ? theme.palette.text.secondary : 'inherit'),
                    mr: 1, // Add some margin to the right of the icon
                  }}>
                    <item.Icon sx={{ fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? (theme.palette.accent?.main || theme.palette.primary.main) : 'inherit',
                        }}
                      >
                        {item.name}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </Grow>
          );
        })}
      </List>
    </>
  );
});
