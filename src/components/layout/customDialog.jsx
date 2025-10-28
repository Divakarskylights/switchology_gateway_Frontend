// import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
// import React, { useRef, useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// const CunstomDialog = ({ open, setOpen, handleYes, handleNo, dialogContent, dbPassword }) => {
//   let gateWayName = localStorage.getItem("system-info");
//   console.log("sdfjerfref", JSON.parse(gateWayName), open, dbPassword);
//   const [password, setPassword] = useState('');
//   const inputRef = useRef(null); // Use useRef to store the reference to the TextField

//   // Use useEffect to set the focus when the dialog opens
//   useEffect(() => {
//     if (open && inputRef.current) {
//       setTimeout(() => {
//         inputRef.current.focus();
//       }, 0);
//     }
//   }, [open]);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     console.log("sdfihrejfgreg", value);
//     setPassword(value);
//   }

//   return (
//     <Dialog open={open} onClose={() => setOpen(!open)} PaperProps={{ sx: { border: '2px solid', pb: 2 } }}>
//       <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
//         {dialogContent}
//         <TextField
//           size="small"
//           autoFocus={true}
//           type="password"
//           inputRef={inputRef} // Attach the ref to the TextField
//           onChange={handleChange}
//           value={password} // Controlled input
//           error = {dbPassword !== password}
//           helperText = {password.length >= 4 && dbPassword !== password && "Password mismatch"}
//           />
//       </DialogContent>
//       <DialogActions sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
//         <Button
//           variant="contained"
//           disabled={dbPassword !== password}
//           onClick={() => {
//             if (dbPassword === password) {
//               setOpen(!open);
//               handleYes();
//             } else {
//               toast.error("Password Incorrect");
//             }
//             setPassword('');
//           }}>
//           Proceed
//         </Button>
//         <Button
//           variant="contained"
//           onClick={() => {
//             handleNo();
//             setPassword('');
//           }}>
//           Cancel
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default CunstomDialog;
