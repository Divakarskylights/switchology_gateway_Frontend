import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Checkbox,
} from "@mui/material";

const DeleteParameterDialog = ({
  open,
  onClose,
  fields,
  selectedParams,
  onChange,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ py: 1, px: 1 }}>Delete Parameters</DialogTitle>
    <DialogContent sx={{ py: 0, px: 1 }}>
      <Typography>Select parameters to delete:</Typography>
      <Stack spacing={0}>
        {fields
          .filter(
            (f) =>
              f.parameter !== "from_date" &&
              f.parameter !== "to_date" &&
              f.parameter !== "created_by" &&
              f.parameter !== "time",
          )
          .map((f) => (
            <Box
              key={f.parameter}
              sx={{
                display: "flex",
                alignItems: "center",
                minHeight: 10,
                py: 0,
              }}
            >
              <Checkbox
                size="small"
                checked={selectedParams.includes(f.parameter)}
                onChange={() => onChange(f.parameter)}
                sx={{ my: 0 }}
              />
              <Typography sx={{ fontSize: "0.95rem", my: 0 }}>
                {f.parameter}
              </Typography>
            </Box>
          ))}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" size="small" color="info">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        size="small"
        disabled={selectedParams.length === 0}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteParameterDialog;
