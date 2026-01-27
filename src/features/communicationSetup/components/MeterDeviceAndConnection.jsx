import React from "react";
import {
  Autocomplete,
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ConfigItem from "../../setup/components/SetUpConfigItem";
import ElectricMeterOutlinedIcon from "@mui/icons-material/ElectricMeterOutlined";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import { parityOptions as parityOptionsDefault } from "../constants/communicationDefaults";

export default function MeterDeviceAndConnection({
  currentMake,
  currentModel,
  getOptionText,
  handleMeterSelectionChange,
  filterWithCreateOption,
  meterMakeOptions,
  meterModelOptions,
  meterLoading,
  serialPortOptions,
  serialPortsLoading,
  state,
  handleDefinitionFieldChange,
  handleSerialFieldChange,
  parityOptions,
  connectionType,
  handleConnectionFieldChange,
  connectionTypeOptions,
  modeOptions,
  meterError,
}) {
  const resolvedParityOptions = parityOptions || parityOptionsDefault;

  return (
    <Grid item xs={12} md={6}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          height: "100%",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          borderTopWidth: 3,
          borderTopColor: "primary.main",
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ mb: 0.75, fontWeight: 600, letterSpacing: 0.2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ElectricMeterOutlinedIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />
            <span>Meter & Device</span>
          </Box>
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={7}>
            <Autocomplete
              value={
                currentMake ? { label: currentMake, value: currentMake } : null
              }
              onChange={(event, newValue) => {
                const text = getOptionText(newValue);
                handleMeterSelectionChange("make", text);
              }}
              filterOptions={(options, params) =>
                filterWithCreateOption(options, params, "Add make")
              }
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={meterMakeOptions}
              isOptionEqualToValue={(option, value) =>
                getOptionText(option).toLowerCase() ===
                getOptionText(value).toLowerCase()
              }
              getOptionLabel={getOptionText}
              loading={meterLoading.makes}
              freeSolo
              renderOption={(props, option) =>
                (() => {
                  const { key, ...liProps } = props;
                  return (
                    <li key={key} {...liProps}>
                      {option.label || getOptionText(option)}
                    </li>
                  );
                })()
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Meter make"
                  size="small"
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={5}>
            <Autocomplete
              value={
                currentModel
                  ? { label: currentModel, value: currentModel }
                  : null
              }
              onChange={(event, newValue) => {
                const text = getOptionText(newValue);
                handleMeterSelectionChange("model", text);
              }}
              filterOptions={(options, params) =>
                filterWithCreateOption(options, params, "Add model")
              }
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={meterModelOptions}
              isOptionEqualToValue={(option, value) =>
                getOptionText(option).toLowerCase() ===
                getOptionText(value).toLowerCase()
              }
              getOptionLabel={getOptionText}
              loading={meterLoading.models}
              freeSolo
              disabled={!currentMake}
              renderOption={(props, option) =>
                (() => {
                  const { key, ...liProps } = props;
                  return (
                    <li key={key} {...liProps}>
                      {option.label || getOptionText(option)}
                    </li>
                  );
                })()
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Meter model"
                  size="small"
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Meter name"
              value={state?.meter?.name || ""}
              onChange={(e) =>
                handleMeterSelectionChange("name", e.target.value)
              }
              placeholder="e.g. Main Incomer Meter"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <ConfigItem
              label="Slave ID"
              value={state?.definition?.slaveId ?? 1}
              onChange={handleDefinitionFieldChange("slaveId", (v) =>
                Number(v),
              )}
              name="slaveId"
              type="number"
              required
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <ConfigItem
              label="Baud rate"
              value={state?.connection?.serial?.baudRate || 9600}
              onChange={handleSerialFieldChange("baudRate", (v) => Number(v))}
              name="baudRate"
              select
              options={[
                { value: 1200, label: "1200" },
                { value: 2400, label: "2400" },
                { value: 4800, label: "4800" },
                { value: 9600, label: "9600" },
                { value: 19200, label: "19200" },
                { value: 38400, label: "38400" },
                { value: 57600, label: "57600" },
                { value: 115200, label: "115200" },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <ConfigItem
              label="Data bits"
              value={state?.connection?.serial?.dataBits ?? 8}
              onChange={handleSerialFieldChange("dataBits", (v) => Number(v))}
              name="dataBits"
              select
              options={[
                { value: 7, label: "7" },
                { value: 8, label: "8" },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <ConfigItem
              label="Stop bits"
              value={state?.connection?.serial?.stopBits ?? 1}
              onChange={handleSerialFieldChange("stopBits", (v) => Number(v))}
              name="stopBits"
              select
              options={[
                { value: 1, label: "1" },
                { value: 2, label: "2" },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <ConfigItem
              label="Parity"
              value={state?.connection?.serial?.parity || "even"}
              onChange={handleSerialFieldChange("parity")}
              name="parity"
              select
              options={resolvedParityOptions}
            />
          </Grid>
        </Grid>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ mt: 1.5, fontWeight: 600, letterSpacing: 0.2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <SettingsEthernetIcon
              fontSize="small"
              sx={{ color: "secondary.main" }}
            />
            <span>Communicate</span>
          </Box>
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={connectionType === "serial_rtu" ? 4 : 6}>
            <ConfigItem
              label="Connection type"
              value={connectionType}
              onChange={handleConnectionFieldChange("type")}
              name="type"
              select
              options={connectionTypeOptions}
              required
            />
          </Grid>
          <Grid item xs={12} md={connectionType === "serial_rtu" ? 4 : 6}>
            <ConfigItem
              label="Mode"
              value={state?.connection?.mode || "rtu"}
              onChange={handleConnectionFieldChange("mode")}
              name="mode"
              select
              options={modeOptions}
            />
          </Grid>
          {connectionType === "serial_rtu" ? (
            <Grid item xs={12} md={4}>
              <ConfigItem
                label="Port"
                value={state?.connection?.serial?.port || "COM1"}
                onChange={handleSerialFieldChange("port")}
                name="port"
                select
                options={serialPortOptions || []}
                disabled={Boolean(serialPortsLoading)}
              />
            </Grid>
          ) : null}
        </Grid>
        {meterError ? (
          <Typography variant="body2" sx={{ color: "error.main", mt: 1 }}>
            {meterError}
          </Typography>
        ) : null}
      </Paper>
    </Grid>
  );
}
