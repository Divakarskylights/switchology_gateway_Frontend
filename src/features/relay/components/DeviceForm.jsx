
import React, { useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
// Removed ImageIcon as imageSrc is being removed

const DeviceForm = ({ initialData, onCommit, onCancel, submitButtonText = "Submit", allDevices = [], currentDeviceId = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    // type: "", // Removed type
    relayNumber: "",
    inputRelayNumber: "", 
    // imageSrc: "", // Removed imageSrc
    config_json: {},
  });

  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  const inputRelayOptions = useMemo(() => [
    { value: "", label: "None" },
    ...Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
  ], []);

  const outputRelayOptions = useMemo(() => [
    { value: "", label: "None" },
    ...Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
  ], []);


  useEffect(() => {
    if (initialData) {
      const {
        name = "",
        // type = "", // Removed type
        relay_number = "",
        input_relay_number = "",
        // image_src = "", // Removed imageSrc
        config_json = {}
      } = initialData;
      setFormData({
        name,
        // type, // Removed type
        relayNumber: relay_number === null ? "" : String(relay_number),
        inputRelayNumber: input_relay_number === null ? "" : String(input_relay_number),
        // imageSrc, // Removed imageSrc
        config_json: config_json || {},
      });
    } else {
      setFormData({
        name: "",
        // type: "", // Removed type
        relayNumber: "",
        inputRelayNumber: "",
        // imageSrc: "", // Removed imageSrc
        config_json: {},
      });
    }
    setFieldErrors({});
  }, [initialData]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Device name is required";
    }
    // No validation for type as it's removed

    const outputRelayNum = formData.relayNumber === '' ? NaN : Number(formData.relayNumber);
    if (formData.relayNumber !== "" && (isNaN(outputRelayNum) || outputRelayNum < 1 || outputRelayNum > 8)) {
      errors.relayNumber = "Output relay must be 1-8 or empty";
    } else if (formData.relayNumber !== "") {
      const isDuplicateOutput = allDevices.some(
        (device) => device.relay_number === outputRelayNum && device.id !== currentDeviceId
      );
      if (isDuplicateOutput) {
        errors.relayNumber = `Output relay ${outputRelayNum} is already in use.`;
      }
    }

    const inputRelayNum = formData.inputRelayNumber === '' ? NaN : Number(formData.inputRelayNumber);
    if (formData.inputRelayNumber !== "" && (isNaN(inputRelayNum) || inputRelayNum < 1 || inputRelayNum > 8)) {
      errors.inputRelayNumber = "Feedback relay must be 1-8 or empty";
    }
    
    // No validation for imageSrc as it's removed
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
        setFieldErrors(prev => ({...prev, [field]: null}));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsPending(true);
    const dataToCommit = {
      ...formData,
      // type will not be included
      // imageSrc will not be included
      relayNumber: formData.relayNumber === '' ? null : Number(formData.relayNumber),
      inputRelayNumber: formData.inputRelayNumber === '' ? null : Number(formData.inputRelayNumber),
    };

    const success = await onCommit(dataToCommit);

    if (success) {
      onCancel();
    } else {
      setFormError("An error occurred. Please try again.");
    }
    setIsPending(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" gutterBottom textAlign={'center'}>
        {initialData ? "Edit Device" : "Add Device"}
      </Typography>

      <TextField
        label="Device Name"
        size="small"
        variant="outlined"
        value={formData.name}
        onChange={handleChange("name")}
        error={!!fieldErrors.name}
        helperText={fieldErrors.name}
        disabled={isPending}
        fullWidth
      />

      {/* Device Type TextField removed */}

      <FormControl fullWidth size="small" error={!!fieldErrors.relayNumber}>
        <InputLabel>Output Relay Number (1-8, optional)</InputLabel>
        <Select
          label="Output Relay Number (1-8, optional)"
          value={formData.relayNumber}
          onChange={handleChange("relayNumber")}
          disabled={isPending}
        >
          {outputRelayOptions.map((opt) => (
            <MenuItem key={`out-${opt.value}`} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {fieldErrors.relayNumber && <Typography color="error" variant="caption" sx={{ml:1.5}}>{fieldErrors.relayNumber}</Typography>}
      </FormControl>

      <FormControl fullWidth size="small" error={!!fieldErrors.inputRelayNumber}>
        <InputLabel>Feedback Relay Number (1-8, optional)</InputLabel>
        <Select
          label="Feedback Relay Number (1-8, optional)"
          value={formData.inputRelayNumber}
          onChange={handleChange("inputRelayNumber")}
          disabled={isPending}
        >
          {inputRelayOptions.map((opt) => (
            <MenuItem key={`in-${opt.value}`} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {fieldErrors.inputRelayNumber && <Typography color="error" variant="caption" sx={{ml:1.5}}>{fieldErrors.inputRelayNumber}</Typography>}
      </FormControl>

      {/* Image Selection and Preview removed */}

      {formError && (
        <Typography color="error" variant="body2">
          {formError}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt:1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending} size="medium">
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={isPending || Object.keys(fieldErrors).some(key => fieldErrors[key])} size="medium">
          {isPending ? `${submitButtonText}...` : submitButtonText}
        </Button>
      </Box>
    </Box>
  );
};

export default DeviceForm; // Make sure export name matches if it was DeviceForm before
