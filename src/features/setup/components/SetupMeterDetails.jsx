import React from "react";
import { Box, Button, Grid, Typography, Paper, Divider, TextField, Checkbox } from "@mui/material";
import meterOptions from "../../../meters/meters.json";
import ConfigItem from "./SetUpConfigItem";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

// Default meter configuration
const defaultMeter = {
  meter_make: "",
  meter_model: "",
  meter_name: "",
  meter_type: "",
  meter_no: "",
  label: "",
  // interval removed from default, will be based on global
  con: {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "even",
    datatypeIfBulk: null,
  },
};

// Reusable Meter Details Component
export const MeterDetails = ({
  meter = defaultMeter,
  onChange,
  jsonDialogOpen,
  onRequestPassword,
  onSave,
  onSaveParameters,
  onDelete,
  onClose,
  responseMessage,
  loaderPercentage,
  globalInterval,
  usedMeterNos = [],
}) => {
  const [paramsEditMode, setParamsEditMode] = React.useState(false);
  const [localConfig, setLocalConfig] = React.useState(meter?.config || null);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [paramPage, setParamPage] = React.useState(0);
  const pageSize = 30;
  const isValidNumber = (v) => {
    if (v === '' || v === null || v === undefined) return false;
    const n = Number(v);
    return Number.isFinite(n);
  };
  const hasInvalid = React.useMemo(() => {
    if (!paramsEditMode || !Array.isArray(localConfig?.parameters)) return false;
    return localConfig.parameters.some((p, idx) => (
      selectedRows[idx] && (!isValidNumber(p?.address) || !isValidNumber(p?.scale))
    ));
  }, [paramsEditMode, localConfig, selectedRows]);
  React.useEffect(() => {
    setLocalConfig(meter?.config || null);
    const count = Array.isArray(meter?.config?.parameters) ? meter.config.parameters.length : 0;
    setSelectedRows(Array.from({ length: count }, () => true));
    setParamPage(0);
  }, [meter]);
  const mappedDevice =
    meterOptions.find(
      (d) =>
        d.device_make === meter?.meter_make &&
        d.device_model === meter?.meter_model,
    ) || {};
  const currentBaud = meter?.con?.baudRate ?? 9600;
  let baudRates = mappedDevice.baud_rate?.map((b) => ({ value: b, label: b.toString() })) || [{ value: 9600, label: "9600" }];
  if (!baudRates.some((o) => o.value === currentBaud)) {
    baudRates = [{ value: currentBaud, label: String(currentBaud) }, ...baudRates];
  }
  const parities = mappedDevice.parity?.map((p) => ({
    value: p.toLowerCase(),
    label: p,
  })) || [{ value: "even", label: "Even" }];
  // Meter no dropdown logic: id2 to id25, exclude used except current
  const allMeterNos = Array.from({ length: 24 }, (_, i) => i + 2); // [2, 3, ..., 25]
  const availableMeterNos = allMeterNos.filter(
    (no) => !usedMeterNos.includes(no) || no === meter.meter_no,
  );
  const meterNoOptions = availableMeterNos.map(
    (no) => ({
      value: no,
      label: `id${no}`,
    })
  );
  const totalParams = Array.isArray(localConfig?.parameters) ? localConfig.parameters.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalParams / pageSize));
  const startIndex = Math.min(paramPage, totalPages - 1) * pageSize;
  const endIndex = Math.min(totalParams, startIndex + pageSize);
  const visibleParams = React.useMemo(() => {
    if (!Array.isArray(localConfig?.parameters)) return [];
    return localConfig.parameters.slice(startIndex, endIndex);
  }, [localConfig?.parameters, startIndex, endIndex]);
  React.useEffect(() => {
    if (paramPage > totalPages - 1) {
      setParamPage(totalPages - 1);
    }
  }, [paramPage, totalPages]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 1 }, borderRadius: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: "center",
          fontWeight: "medium",
          color: "primary.main",
        }}
      >
        Edit Meter: {meter?.label || `ID ${meter?.meter_no}`}
      </Typography>
      <Divider />
      <Grid container spacing={3}>
        {/* Device Information Section */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "text.secondary" }}
          >
            Device Information
          </Typography>
          <ConfigItem label="Make" value={meter?.meter_make || ""} disabled />
          <ConfigItem
            label="Model"
            value={meter?.meter_model || ""}
            disabled
          />
          {/** Name removed as Label already represents display name */}
          <ConfigItem label="Type" value={meter?.meter_type || ""} disabled />
          <ConfigItem
            label="Meter No."
            value={
              meter?.meter_no === "" ||
                meter?.meter_no === undefined ||
                meter?.meter_no === null
                ? ""
                : Number(meter.meter_no)
            }
            onChange={onChange}
            name="meter_no"
            select
            options={meterNoOptions}
            // required
            disabled
          />

          <ConfigItem
            label="Label"
            value={meter?.label || ""}
            onChange={onChange}
            name="label"
            disabled
          />
        </Grid>

        {/* Connection Settings Section */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "text.secondary" }}
          >
            Connection Settings
          </Typography>

          <ConfigItem
            label="BaudRate"
            value={meter?.con?.baudRate || 9600}
            onChange={onChange}
            name="baudRate"
            select
            options={baudRates}
            disabled
          />
          <ConfigItem
            label="DataBits"
            value={meter?.con?.dataBits || 8}
            onChange={onChange}
            name="dataBits"
            select
            options={[
              { value: 5, label: "5" },
              { value: 6, label: "6" },
              { value: 7, label: "7" },
              { value: 8, label: "8" },
            ]}
            disabled
          />
          <ConfigItem
            label="StopBits"
            value={meter?.con?.stopBits || 1}
            onChange={onChange}
            name="stopBits"
            select
            options={[
              { value: 1, label: "1" },
              { value: 2, label: "2" },
            ]}
            disabled
          />
          <ConfigItem
            label="Parity"
            value={meter?.con?.parity || "even"}
            onChange={onChange}
            name="parity"
            select
            options={parities}
            disabled
          />
          <ConfigItem
            label="Datatype (bulk)"
            value={meter?.con?.datatypeIfBulk || "n/a"}
            name="datatypeIfBulk"
            disabled
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button size="small" variant="outlined" onClick={() => setParamsEditMode(true)}>
              Edit parameters
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Parameters editor - visible only when editing */}
      {paramsEditMode && localConfig?.parameters && Array.isArray(localConfig.parameters) ? (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "text.secondary", m: 0 }}
            >
              Parameters (editing)
            </Typography>
            {totalParams > pageSize && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption">
                  Rows {totalParams === 0 ? 0 : startIndex + 1}-{endIndex} of {totalParams}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setParamPage((prev) => Math.max(0, prev - 1))}
                  disabled={paramPage === 0}
                >
                  Prev
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setParamPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={endIndex >= totalParams}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
              maxHeight: 280,
              overflow: "auto",
            }}
          >
            <Grid container spacing={1} sx={{ fontFamily: 'monospace' }}>
              <Grid item xs={1} sx={{ fontWeight: 700 }}>Edit</Grid>
              <Grid item xs={3} sx={{ fontWeight: 700 }}>Name</Grid>
              <Grid item xs={2} sx={{ fontWeight: 700 }}>Address</Grid>
              <Grid item xs={1} sx={{ fontWeight: 700 }}>Scale</Grid>
              <Grid item xs={1} sx={{ fontWeight: 700 }}>Op</Grid>
              <Grid item xs={2} sx={{ fontWeight: 700 }}>Target Type</Grid>
              <Grid item xs={2} sx={{ fontWeight: 700 }}>Reg Type</Grid>
              {visibleParams.map((p, localIdx) => {
                const idx = startIndex + localIdx;
                return (
                  <React.Fragment key={idx}>
                    <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      {paramsEditMode ? (
                        <Checkbox
                          size="small"
                          checked={!!selectedRows[idx]}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedRows((prev) => {
                              const arr = Array.isArray(prev) ? [...prev] : [];
                              arr[idx] = checked;
                              return arr;
                            });
                          }}
                          inputProps={{ 'aria-label': `edit-row-${idx}` }}
                        />
                      ) : null}
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.name ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, name: val } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.address ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, address: Number(val) } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                        error={paramsEditMode && selectedRows[idx] && !isValidNumber(p?.address)}
                        helperText={paramsEditMode && selectedRows[idx] && !isValidNumber(p?.address) ? 'Number required' : ''}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.scale ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, scale: Number(val) } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                        error={paramsEditMode && selectedRows[idx] && !isValidNumber(p?.scale)}
                        helperText={paramsEditMode && selectedRows[idx] && !isValidNumber(p?.scale) ? 'Number required' : ''}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.op ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, op: val } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.target_data_type ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, target_data_type: val } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        size="small"
                        value={p?.register_data_type ?? ''}
                        onChange={(e) => {
                          if (!paramsEditMode || !selectedRows[idx]) return;
                          const val = e.target.value;
                          setLocalConfig((cfg) => ({
                            ...cfg,
                            parameters: cfg.parameters.map((row, i) => i === idx ? { ...row, register_data_type: val } : row),
                          }));
                        }}
                        InputProps={{ readOnly: !(paramsEditMode && selectedRows[idx]) }}
                      />
                    </Grid>
                  </React.Fragment>
                );
              })}
            </Grid>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {paramsEditMode ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setSelectedRows(selectedRows.map(() => true))}>Select all</Button>
                <Button size="small" variant="outlined" onClick={() => setSelectedRows(selectedRows.map(() => false))}>Deselect all</Button>
              </Box>
            ) : <span />}
            {paramsEditMode ? (
              <>
                <Button size="small" variant="text" onClick={() => {
                  setParamsEditMode(false);
                  setLocalConfig(meter?.config || null);
                }}>Cancel</Button>
                <Typography variant="body2" sx={{ mr: 1 }}>{selectedRows.filter(Boolean).length} selected</Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disabled={!Array.isArray(selectedRows) || !selectedRows.some(Boolean) || hasInvalid}
                  onClick={async () => {
                    if (!onSaveParameters) return;
                    try {
                      if (hasInvalid) return;
                      await onSaveParameters(meter?.meter_no, localConfig, selectedRows);
                      setParamsEditMode(false);
                    } catch { }
                  }}
                >
                  Save parameters
                </Button>
              </>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {responseMessage && (
        <Box
          sx={{
            borderRadius: 1,
            backgroundColor:
              responseMessage === "success"
                ? "success.light"
                : responseMessage === "testing"
                  ? "info.light"
                  : "error.light",
            display: "flex",
            alignItems: "center",
          }}
        >
          {responseMessage === "success" ? (
            <CheckCircleOutlineIcon sx={{ color: "success.dark", mr: 1 }} />
          ) : responseMessage === "testing" ? (
            <HourglassEmptyIcon sx={{ color: "info.dark", mr: 1 }} />
          ) : (
            <ErrorOutlineIcon sx={{ color: "error.dark", mr: 1 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color:
                responseMessage === "success"
                  ? "success.dark"
                  : responseMessage === "testing"
                    ? "info.dark"
                    : "error.dark",
              fontWeight: "medium",
            }}
          >
            {responseMessage === "success"
              ? `Test Successful! Response time: ${loaderPercentage}`
              : responseMessage === "testing"
                ? "Testing meter connection..."
                : "Meter connection failed. Check connectivity and settings."}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pt: { xs: 1, sm: 1, md: 1, lg: 0 },
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          color="secondary"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={() => onRequestPassword && onRequestPassword()}
          disabled={jsonDialogOpen}
          startIcon={
            jsonDialogOpen ? (
              <HourglassEmptyIcon />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
        >
          Dashboard
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={onDelete}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
};
