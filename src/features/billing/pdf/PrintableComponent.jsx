
import React, { forwardRef } from "react";
import { Box, GlobalStyles } from "@mui/material";
import BillHeader from "./BillHeader";
import CustomerInfo from "./CustomerInfo";
import BillingDetails from "./BillingDetails";
import MeterReadings from "./MeterReadings";
import TODReadings from "./TODReadings";
import DetailedBill from "./DetailedBill";
import BillFooter from "./BillFooter";

const PrintableBills = forwardRef(({ data }, ref) => {
  const totalPages = data.length;
  // console.log(data, "datscscsa"); // for testing 
  return (
    <div ref={ref}>
      <GlobalStyles
        styles={{
          '@media print': {
            'body': {
              counterReset: 'page',
            },
            '.page': {
              counterIncrement: 'page',
              position: 'relative',
              pageBreakAfter: 'always',
            },
            '.page-number': {
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              fontSize: '10px',
              color: '#555',
            },
            '.page-number::after': {
              content: '"Page: " counter(page) "/"' + totalPages + '"',
            },
            '@page': {
              marginBottom: '30px',
            },
          },
        }}
      />
      {data.map((item, index) => (
        <Box key={index} className="page" sx={{ }}>
          <BillHeader />
          <Box sx={{ px: 4, pb: 1, borderTop: 1, borderColor: "gray.200" }}>
            <CustomerInfo data={item} />
          </Box>
          <Box sx={{ px: 4, pb: 0 }}>
            <BillingDetails data={item} />
          </Box>
          <Box sx={{ px: 4, pb: 1 }}>
            <MeterReadings data={item} />
          </Box>
          <Box sx={{ px: 4, py: 0 }}>
            <TODReadings data={item} />
          </Box>
          <Box sx={{ px: 4, py: 0 }}>
            <DetailedBill data={item} />
          </Box>
          <BillFooter data={item} />

          {/* Page number */}
          <Box className="page-number" />
        </Box>
      ))}
    </div>
  );
});

export default PrintableBills;
