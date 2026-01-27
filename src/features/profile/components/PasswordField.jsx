import React, { useMemo, useRef, useState } from "react";
import {
  Stack,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material";

const PasswordField = ({
  label,
  name,            // ✅ add name prop
  value = "",
  onChange,
  error,
  helperText,
  required,
  length = 4,
  onComplete, // optional
}) => {
  const [show, setShow] = useState(false);
  const inputsRef = useRef([]);

  // derive per-box digits
  const digits = useMemo(() => {
    const vals = Array(length).fill("");
    const str = String(value || "").slice(0, length);
    for (let i = 0; i < str.length; i++) vals[i] = str[i];
    return vals;
  }, [value, length]);

  const update = (vals) => {
    const joined = vals.join("");
    // ✅ include name so parent can set correct field
    onChange?.({ target: { name, value: joined } });
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const handleChange = (e, idx) => {
    const raw = e.target.value;
    const val = raw.replace(/[^0-9]/g, "");
    const next = [...digits];

    if (!val) {
      next[idx] = "";
      update(next);
      return;
    }

    next[idx] = val[val.length - 1];
    update(next);

    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const next = [...digits];
      next[idx - 1] = "";
      update(next);
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const onlyDigits = (text || "").replace(/\D/g, "").slice(0, length);
    if (!onlyDigits) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < onlyDigits.length; i++) next[i] = onlyDigits[i];
    update(next);
    inputsRef.current[Math.min(onlyDigits.length, length) - 1]?.focus();
  };

  return (
    <FormControl error={error} required={required} sx={{ width: "100%", alignItems: "center" }}>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        onPaste={handlePaste}
        sx={{ width: "100%" }}
      >
        {digits.map((d, idx) => (
          <TextField
            key={idx}
            value={d}
            inputRef={(el) => (inputsRef.current[idx] = el)}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            type={show ? "text" : "password"}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: false }}
            inputProps={{
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: { textAlign: "center", fontSize: "1.2rem" },
              "aria-label": `${label || "Password"} digit ${idx + 1}`,
              autoComplete: "one-time-code",
            }}
            sx={{
              width: 42,
              "& .MuiInputBase-input": {
                py: 0.5,
                textAlign: "center",
              },
              "& .MuiOutlinedInput-root": {
                height: 40,
              },
            }}
          />
        ))}
      </Stack>

      {helperText && (
        <FormHelperText error={error} sx={{ textAlign: "center" }}>
          {helperText}
        </FormHelperText>
      )}

      <FormHelperText
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        sx={{
          alignSelf: "center",
          cursor: "pointer",
          color: "primary.main",
          fontWeight: 500,
        }}
      >
        {show ? "Hide Code" : "Show Code"}
      </FormHelperText>
    </FormControl>
  );
};

export default PasswordField;
