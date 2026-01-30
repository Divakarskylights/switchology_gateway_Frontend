import React from "react";
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KpiParameterTable from "./KpiParameterTable";

const KpiInputCard = ({
  fromDate,
  toDate,
  now,
  textfieldStyle,
  handleFromDateChange,
  handleToDateChange,
  durationValue,
  durationUnit,
  setDurationUnit,
  fields,
  handleFieldChange,
  fieldsDisabled,
  handleSubmit,
  requestAdminPassword,
}) => (
  <Paper
    elevation={3}
    sx={{ p: { xs: 0.5, sm: 1 }, borderRadius: 2, textAlign: "center", mb: 2 }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
        flexWrap: "wrap",
        gap: 0.5,
      }}
    >
      <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
        Key Performance Indicators
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => requestAdminPassword("addParameter")}
          sx={{ minWidth: "auto", px: 1, py: 0.25, fontSize: "0.85rem" }}
        >
          Add Parameter
        </Button>

        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          size="small"
          sx={{ minWidth: "auto", px: 1, py: 0.25, fontSize: "0.85rem" }}
          onClick={() => requestAdminPassword("bulkDelete")}
          disabled={fields.length === 0}
        >
          Delete Parameters
        </Button>
      </Box>
    </Box>

    {/* Date Range */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        mb: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
        >
          From:
        </Typography>
        <TextField
          type="datetime-local"
          value={fromDate}
          onChange={handleFromDateChange}
          size="extraSmall"
          sx={textfieldStyle}
          inputProps={{
            max: now,
          }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
        >
          To:
        </Typography>
        <TextField
          type="datetime-local"
          value={toDate}
          onChange={handleToDateChange}
          size="extraSmall"
          sx={textfieldStyle}
          inputProps={{
            min: fromDate || undefined,
          }}
        />
      </Box>
    </Box>

    {/* Duration */}
    {fromDate && toDate && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <Typography sx={{ fontWeight: "bold", minWidth: 70, fontSize: "0.95rem" }}>
          Duration
        </Typography>
        <TextField
          value={durationValue}
          InputProps={{ readOnly: true }}
          size="small"
          sx={textfieldStyle}
        />
        <Select
          value={durationUnit}
          onChange={(e) => setDurationUnit(e.target.value)}
          size="small"
          sx={textfieldStyle}
        >
          <MenuItem value="minutes">Minutes</MenuItem>
          <MenuItem value="hours">Hours</MenuItem>
          <MenuItem value="days">Days</MenuItem>
        </Select>
      </Box>
    )}

    <KpiParameterTable
      fields={fields}
      fromDate={fromDate}
      toDate={toDate}
      textfieldStyle={textfieldStyle}
      handleFieldChange={handleFieldChange}
      fieldsDisabled={fieldsDisabled}
    />

    {/* Submit Buttons */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 0.5,
      }}
    >
      <Button
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={!fromDate || !toDate || fromDate === toDate || fieldsDisabled}
      >
        Submit
      </Button>
    </Box>
  </Paper>
);

export default KpiInputCard;
