
import React from 'react';
import { Paper, Box, Typography, Tooltip, IconButton, Divider, useTheme, alpha } from '@mui/material';
// Removed EditIcon and DeleteIcon imports as they are no longer used on the card directly
import IOSSwitch from './IOSSwitch';
import { Zap } from 'lucide-react';

const DeviceCard = ({ device, onToggle }) => {
    const theme = useTheme();
    const IconComponent = Zap; // Default icon
    const iconColor = theme.palette.primary.main;

    const isOutputOn = typeof device.outputStatus === 'boolean' ? device.outputStatus : false;
    const isInputActive = typeof device.inputStatus === 'boolean' ? device.inputStatus : false;

    // IconButton base style removed as icons are removed

    return (
        <Paper
            elevation={2}
            sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[5],
                }
            }}
        >
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{
                    mr: 1,
                    color: iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.8,
                    backgroundColor: alpha(iconColor, 0.1),
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                }}>
                    {IconComponent && <IconComponent size={18} />}
                </Box>
                <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {device.name || 'Unnamed Device'}
                </Typography>
                {/* Edit and Delete Icons Removed */}
            </Box>
            <Divider sx={{ mb: 1, borderColor: theme.palette.divider }} />

            {/* Status and Toggle Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
                        Output Relay: {device.relay_number != null ? `R${device.relay_number}` : 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium', mr: 0.5, fontSize: '0.75rem' }}>
                            Output Status:
                        </Typography>
                        <Box
                            component="span"
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isOutputOn ? theme.palette.success.main : theme.palette.error.main,
                                mr: 0.5,
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{ color: isOutputOn ? theme.palette.success.dark : theme.palette.error.dark, fontWeight: 'medium', fontSize: '0.75rem' }}
                        >
                            {isOutputOn ? 'On' : 'Off'}
                        </Typography>
                    </Box>
                </Box>
                <IOSSwitch
                    checked={isOutputOn}
                    onChange={() => onToggle(device)}
                    disabled={device.relay_number == null}
                />
            </Box>
            
            <Box sx={{mt: 0.5}}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
                    Feedback Relay: {device.input_relay_number != null ? `R${device.input_relay_number}` : 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium', mr: 0.5, fontSize: '0.75rem' }}>
                        Feedback Status:
                    </Typography>
                    <Box
                        component="span"
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: isInputActive ? theme.palette.error.main : theme.palette.success.main,
                            mr: 0.5,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ 
color: isInputActive ? theme.palette.error.dark : theme.palette.success.dark, 
                            fontWeight: 'medium', 
                            fontSize: '0.75rem' 
                        }}
                    >
                        {isInputActive ? 'On' : 'Off'}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default DeviceCard;
