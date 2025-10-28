import React, { createContext, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { blue, pink } from '@mui/material/colors';
import useThemeChange from '../../redux/store/useThemeStore';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

// Saffron/Orange-Red Palette
const orangeRed = {
  50: '#FFF4F2', 100: '#FFDAD2', 200: '#FFBEB2', 300: '#FFA79D',
  400: '#FF8F82', 500: '#F2592A', 600: '#D04A1A', 700: '#AD3B10',
  800: '#8A2C0C', 900: '#5D1D08',
};

const saffronPrimary = {
  light: orangeRed[300],
  main: orangeRed[500], // #F2592A
  dark: orangeRed[700],
  contrastText: '#fff',
};

// Cyan Accent
const cyanAccent = {
  main: "#00BCD4",
  contrastText: '#fff',
};

export const ThemeProvider = ({ children }) => {
  const { themeMode, setThemeMode } = useThemeChange();

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: saffronPrimary,
      secondary: pink,
      accent: cyanAccent,
      action: {
        active: saffronPrimary.main,
        hover: 'rgba(242, 89, 42, 0.08)',
      },
      error: {
        main: "#ea5455",
      },
      background: {
        default: "#F2F5F6",
        paper: "#ffffff",
        hover: "#e0e0e0",
        timeRange: "#ffffff",
        widget: "#e0e0e0",
        textColor: "#363636"
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)',
      }
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      allVariants: {
        textTransform: 'none',
      },
      fontSize: 14,
      h1: { fontSize: 43, fontWeight: 600 },
      h2: { fontSize: 37, fontWeight: 600 },
      h3: { fontSize: 33, fontWeight: 600 },
      h4: { fontSize: 27, fontWeight: 600 },
      h5: { fontSize: 23, fontWeight: 600 },
      h6: { fontSize: 18, fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {},
        }
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: saffronPrimary.main,
            color: saffronPrimary.contrastText,
          }
        }
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: saffronPrimary,
      secondary: pink,
      accent: cyanAccent,
      action: {
        active: saffronPrimary.main,
        hover: 'rgba(242, 89, 42, 0.12)',
      },
      error: {
        main: "#ea5455",
      },
      background: {
        default: "#121212",
        paper: "#1e1e1e",
        widget: "#2c2c2c",
        hover: "#333333",
        timeRange: "#303654",
        textColor: "#fafafa"
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
      }
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      allVariants: {
        textTransform: 'none',
      },
      fontSize: 14,
      h1: { fontSize: 43, fontWeight: 600 },
      h2: { fontSize: 37, fontWeight: 600 },
      h3: { fontSize: 33, fontWeight: 600 },
      h4: { fontSize: 27, fontWeight: 600 },
      h5: { fontSize: 23, fontWeight: 600 },
      h6: { fontSize: 18, fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {},
        }
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: saffronPrimary.main,
            color: saffronPrimary.contrastText,
          }
        }
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, darkTheme, lightTheme }}>
      <MuiThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
