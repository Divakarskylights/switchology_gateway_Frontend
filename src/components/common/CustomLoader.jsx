// import { Typography } from '@mui/material';
// import Box from '@mui/material/Box';
// import * as React from 'react';

// export const CustomLoader = ({ percentage }) => {
//   // Calculate the color based on the percentage
//   const getColor = (percentage) => {
//     const red = Math.round((100 - percentage) * 2.55); // Red decreases as percentage increases
//     const green = Math.round(percentage * 2.55); // Green increases as percentage increases
//     return `rgb(${red}, ${green}, 0)`; // Resulting color from red to green
//   };

//   return (
//     <Box sx={{ width: '100%' }}>
//       <div style={{ width: '100%', backgroundColor: '#f0f0f0', position: 'relative', margin: '10px' }}>
//         <div
//           style={{
//             width: `${percentage}%`,
//             backgroundColor: getColor(percentage),
//             height: '15px',
//             transition: 'width 0.3s ease, background-color 0.3s ease', // Smooth transition for both width and color
//             borderRadius: 5,
//           }}
//         ></div>
//       </div>
//        <Typography variant="caption" sx={{ display: 'block' }}>Meter response time : {percentage}</Typography>
//     </Box>
//   );
// };
