
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FanIcon from '@mui/icons-material/Toys'; // Substitute for fan icon

export const DEVICE_TYPES = {
    LIGHT: 'light',
    FAN: 'fan',
    AC: 'ac',
    HEATER: 'heater',
};

export const DEFAULT_DEVICE_STATUS = {
    ON: true,
    OFF: false,
};

export const DEFAULT_RELAY_NAME = 'Relay';

// Object with icon components as plain JavaScript references
export const deviceIcons = {
    light: { component: LightbulbIcon, color: '#33cf4d' },
    fan: { component: FanIcon, color: '#00bcd4' },
    ac: { component: AcUnitIcon, color: '#1976d2' },
    heater: { component: WhatshotIcon, color: '#e65100' },
};
