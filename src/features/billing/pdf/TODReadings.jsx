import React from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const TODReadings = ({data}) => {
  return (
    < >
      <Typography fontWeight="bold" fontSize="12px">
        TOD meter readings for meter
      </Typography>
      <TableContainer sx={{ border: '1px solid #ccc', borderRadius: "5px" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "gray.100", '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Time Zone
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Name of the Zone
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" >Present Readings</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Previous Readings
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" >Consumption</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  MD Reading
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  06:00 Hrs to 10:00Hrs
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  Morning Peak
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  10:00 Hrs to 18:00Hrs
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  Normal
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  18:00 Hrs to 22:00Hrs
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  On Peak
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>  
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >
                  22:00 Hrs to 06:00Hrs
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  >Off Peak</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }}>
                <Typography fontSize="10px"  >-</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TODReadings;

