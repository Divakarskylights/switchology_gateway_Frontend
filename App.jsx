import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Fade, Box } from '@mui/material';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from './src/AppRoutes';
// import Chatbot from './test';
function App() {
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <BrowserRouter>
      <Fade in={pageLoaded} timeout={700}>
        <Box sx={{ height: '100%'}}>
          <AppRoutes />
          {/* <Chatbot /> */}          
        </Box>
      </Fade>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </BrowserRouter>
  );
}

export default App;