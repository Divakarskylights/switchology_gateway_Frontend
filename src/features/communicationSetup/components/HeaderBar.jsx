import { Box, Button, CircularProgress, Typography } from "@mui/material";

export default function HeaderBar({
  testing,
  reading,
  saving,
  canTest,
  canSave,
  onTest,
  onSave,
  apiBaseUrl,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h5">Communication Setup</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          API: {apiBaseUrl}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={onSave}
          size="small"
          disabled={!canSave || testing || reading || saving}
          startIcon={
            saving ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          Save Meter
        </Button>
        <Button
          variant="contained"
          onClick={onTest}
          size="small"
          disabled={!canTest || testing || reading}
          startIcon={
            testing ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          Test
        </Button>
      </Box>
    </Box>
  );
}

