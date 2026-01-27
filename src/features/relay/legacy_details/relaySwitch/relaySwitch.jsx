
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Switch,
  Typography,
  styled,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useRelayStatusStore from '../../../../store/zustand/useRelayStatusStore';
import useRelayData from "../../../../store/zustand/useRelayData"; 
import IOSSwitch from '../../../components/IOSSwitch'; // Corrected import path

const CustomBackDrop = (open) =>{
  return(
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

const RelaySwitch = ({ params, relayonStatus, relayNum, relayInfo }) => {
  const {
    relayStatus,
    setUpdateRelayState
  } = useRelayStatusStore();

  const [iosSwitch, setiosSwitch] = useState(relayonStatus);
  const [isBackdrop, setIsbackdrop] = useState(false);
  const { relayClickedData } = useRelayData();
  // console.log("asduahsuverwhewrgfjadf", relayClickedData, relayInfo, relayNum, isBackdrop);

  const handleUpdateClick = () => {
    try {
      setUpdateRelayState(true, relayNum, !iosSwitch);
    } catch (err) {
      console.error("Error updating", err);
    } finally {
      setUpdateRelayState(false);
      setTimeout(() => {
        setIsbackdrop(false);
      }, 2000);
    }
  };

  return (
    <div>
      <Grid item >
        <Paper
          elevation={3}
          sx={{ height: 100, p: 1, m: "auto", bgcolor: "#fcb58b", }}
        >
          <Typography
            variant="h6"
            sx={{ textAlign: "center",}}
          >
            Relay {relayInfo?.number}: {relayInfo?.name}
          </Typography>
          <Divider sx={{ bgcolor: "red", fontWeight: 600 }} />
          <Box sx={{display:'flex', flexDirection:'row',  justifyContent:'space-between',m:0, pt:2}}>
          <Typography
            variant="body1"
            sx={{
              mt: 0.5,
              bgcolor: "#fff",
              p: 0.3,
              borderRadius: 1,
              display:'flex',
              flexDirection:'row',

            }}
          >
            Live Status:{" "}
            {Array.isArray(relayStatus) && relayStatus[0].status[relayNum] ? (
              <Typography
                variant="body1"
                sx={{ color: "#c62828", }}
              >
                On
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: "#00c853",
                  
                  fontWeight: 600,
                }}
              >
                Off
              </Typography>
            )}
          </Typography>
          <IOSSwitch
            checked={
              Array.isArray(relayStatus) && relayStatus[0].status[relayNum] || iosSwitch
            }
            onClick={() => {
              setiosSwitch(!iosSwitch);
              handleUpdateClick();
              setIsbackdrop(true);
            }}
          />
          </Box>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isBackdrop}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Paper>
      </Grid>
      </div>
);
};

export default RelaySwitch;

    