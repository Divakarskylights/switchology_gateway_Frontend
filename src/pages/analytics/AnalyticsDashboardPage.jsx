
import React, { useEffect, useState, useRef } from 'react';
import useThemeChange from '../../redux/store/useThemeStore';
import { configInit } from '../../components/layout/globalvariable';
import useRole from '../../redux/store/useRole';
import { Box, CircularProgress, Typography, Fade } from '@mui/material'; // Added Fade

const AnalyticsDashboardPage = () => {
  const { themeMode } = useThemeChange();
  const { role } = useRole();
  const [iframeUrl, setIframeUrl] = useState('');
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false); // For animation

  useEffect(() => {
    setLoaded(true); // Trigger animation

    const baseUrl = `${configInit.appBaseUrl}/main/page/dashboards/?theme=${themeMode}`;

    if (role !== 'ADMIN') {
      setIframeUrl(`${baseUrl}&orgId=1&from=now-6h&to=now&refresh=5s`);
    } else {
      setIframeUrl(baseUrl);
    }

    const handleMessage = (event) => {
      try {
        if (typeof event.data === 'string' && event.data.startsWith('Grafana')) {
          return;
        }

        const data = JSON.parse(event.data);
        if (data.type === 'urlChange') {
         // console.log('URL changed in iframe:', data.url);
          if (data.url.includes('/admin') && role !== 'ADMIN') {
            //console.log('Admin page detected for non-admin, redirecting in iframe...');
            if (iframeRef.current) {
              iframeRef.current.src = `${configInit.appBaseUrl}/main/page/dashboards/?theme=${themeMode}&orgId=1&from=now-6h&to=now&refresh=5s`;
            }
          }
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          console.error('Error handling message from iframe:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [themeMode, role]); 

  const handleIframeLoad = (event) => {
    try {
      const iframe = event.target;
      if (iframe.contentWindow) {
        const script = `
          (function() {
            if (window.grafanaRoutedUrlChangeBound) return; 
            window.grafanaRoutedUrlChangeBound = true;

            const originalPushState = window.history.pushState;
            window.history.pushState = function() {
              originalPushState.apply(this, arguments);
              window.parent.postMessage(JSON.stringify({
                type: 'urlChange',
                url: window.location.href
              }), '*'); 
            };

            const originalReplaceState = window.history.replaceState;
            window.history.replaceState = function() {
              originalReplaceState.apply(this, arguments);
              window.parent.postMessage(JSON.stringify({
                type: 'urlChange',
                url: window.location.href
              }), '*'); 
            };

            window.addEventListener('popstate', function() {
              window.parent.postMessage(JSON.stringify({
                type: 'urlChange',
                url: window.location.href
              }), '*'); 
            });
          })();
        `;
        
        iframe.contentWindow.eval(script);
      }
    } catch (error) {
      // console.error('Error setting up iframe monitoring (possibly cross-origin):', error);
    }
  };

  return (
    <Fade in={loaded} timeout={700}>
      <div style={{ height: '100vh', width: '100%' }}>
        {iframeUrl ? (
          <iframe 
            ref={iframeRef}
            src={iframeUrl}
            style={{ border: 'none', width: '100%', height: '100%', borderRadius:"10px" }}
            title="Dashboard"
            onLoad={handleIframeLoad}
          />
        ) : (
          <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
              <CircularProgress/>
              <Typography sx={{ml:1}}>Loading Dashboard...</Typography>
          </Box>
        )}
      </div>
    </Fade>
  );
}

export default AnalyticsDashboardPage;