import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import CssBaseline from "@mui/material/CssBaseline";
import App from './App';
import { ThemeProvider } from './src/components/common/themeProvider';
import './src/config/monaco-editor-config.js';

ReactDOM.createRoot(document.getElementById('firstRoot')).render(
  // <React.StrictMode>
      <ThemeProvider> 
        <ToastContainer />
        <CssBaseline />
        <App />
      </ThemeProvider>
  // </React.StrictMode>,
);