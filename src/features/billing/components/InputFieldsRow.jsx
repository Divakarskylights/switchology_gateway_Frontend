import React from "react";
import { Button, Stack, TextField } from "@mui/material";
import { DGTariffDialog } from "./DGTariffDialog";

export const InputFieldsRow = ({
  state,
  onStateChange,
  isSmallScreen,
  disabled,
  tableData,
  setTableData,
  tariffData,
  loading,
  setLoading,
  handleApplyDateFilter
}) => {
  const {
    fromDate,
    toDate,
    isApplied,
    contractDemand,
    fcaCharges,
    interOnReven,
    interOnTax,
    dgTariff,
  } = state;

  return (
    <Stack
      direction={isSmallScreen ? "column" : "row"}
      spacing={1}
      sx={{ width: isSmallScreen ? "100%" : "auto", flex: 2 }}
    >
      <TextField
        label="Contract Demand (kVA)"
        type="number"
        size="small"
        value={contractDemand}
        onChange={(e) => onStateChange({ contractDemand: Math.min(Number(e.target.value), 1000) })}
        sx={{ width: isSmallScreen ? "100%" : "auto" }}
        disabled={disabled}
      />
      <TextField
        label="FCA Charges (Rs)"
        type="number"
        size="small"
        value={fcaCharges}
        onChange={(e) => onStateChange({ fcaCharges: Number(e.target.value) })}
        sx={{ width: isSmallScreen ? "100%" : "auto" }}
        disabled={disabled}
      />
      <TextField
        label="Inter on Reven (Rs)"
        type="number"
        size="small"
        value={interOnReven}
        onChange={(e) => onStateChange({ interOnReven: Number(e.target.value) })}
        sx={{ width: isSmallScreen ? "100%" : "auto" }}
        disabled={disabled}
      />
      <TextField
        label="Inter on Tax (Rs)"
        type="number"
        size="small"
        value={interOnTax}
        onChange={(e) => onStateChange({ interOnTax: Number(e.target.value) })}
        sx={{ width: isSmallScreen ? "100%" : "auto" }}
        disabled={disabled}
      />



<ApplyButton
  disabled={
    !fromDate ||
    !toDate || !contractDemand ||
    (tableData.some((row) => row.isDg) && !dgTariff) ||
    isApplied
  }
  onClick={() =>
    handleApplyDateFilter(
      state,
      tableData,
      setTableData,
      tariffData,
      setLoading,
      onStateChange
    )
  }
  isSmallScreen={isSmallScreen}
  loading={loading}
/>
      <Button
        variant="contained"
        color="primary"
        sx={{ width: isSmallScreen ? "30%" : "auto", alignSelf: "center" }}
        size="small"
        onClick={() => onStateChange({ openModifyAdjNetConsumption: true })}
        disabled={!disabled}
      >
        Modify
      </Button>
      <Button
        variant="contained"
        color="error"
        sx={{ width: isSmallScreen ? "30%" : "auto", alignSelf: "center" }}
        size="small"
        onClick={() => {
          // Reset all input fields
          onStateChange({
            fromDate: null,
            toDate: null,
            contractDemand: '',
            fcaCharges: '',
            interOnReven: '',
            interOnTax: '',
            dgTariff: '',
            isApplied: false
          });
          // Reset table data
          setTableData(tableData.map(r => {
            return {
              ...r,
              dg_previous: 0,
              dg_present: 0,
              dg_netConsumption: 0,
              dg_energyCharges: 0,
              isDg: false,
              eb_previous: 0,
              eb_present: 0,
              netConsumption: 0,
              energyCharges: 0,
              tax: 0,
              contractDemand: 0,
              canShared: false,
              demandCharges: 0,
              fcaCharges: 0,
              interOnReven: 0,
              interOnTax: 0,
              currentBillAmount: 0,
              adjustmentNetConsumption: 0,
              adjustedReadingKWh: 0,
              adjEnergyCharges: 0,
              adjTax: 0,
              adjCurrentBillAmount: 0,
              sharedNetConsumption: 0,
            }
          }));
        }}
      >
        Reset
      </Button>

   
    </Stack>
  );
};


const ApplyButton = ({ disabled, onClick, isSmallScreen, loading }) => {
  return (
    <Button
      onClick={onClick} // no more wrapping
      variant="contained"
      color="secondary"
      size="small"
      disabled={disabled || loading}
      sx={{
        width: isSmallScreen ? "30%" : "auto",
        mt: 2,
        alignSelf: "center",
      }}
    >
      {loading ? 'Processing...' : 'Apply'}
    </Button>
  );
};
