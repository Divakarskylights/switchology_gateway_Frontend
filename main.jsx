import React from 'react'
import ReactDOM from 'react-dom/client'
import CssBaseline from "@mui/material/CssBaseline";
import App from './App';
import { ThemeProvider } from './src/components/common/themeProvider';
import './src/config/monaco-editor-config.js';

ReactDOM.createRoot(document.getElementById('firstRoot')).render(
  // <React.StrictMode>
      <ThemeProvider> 
        <CssBaseline />
        <App />
      </ThemeProvider>
  // </React.StrictMode>,
);