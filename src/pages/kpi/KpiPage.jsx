import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button
} from "@mui/material";
import { unitOptions, unitInfo } from "./constants/unitMetadata";
import KpiInputCard from "./components/KpiInputCard";
import AddParameterDialog from "./components/AddParameterDialog";
import UnitInfoDialog from "./components/UnitInfoDialog";
import AllKpiDataTable from "./components/AllKpiDataTable";
import KpiViewDialog from "./components/KpiViewDialog";
import KpiDeleteDialog from "./components/KpiDeleteDialog";
import DeleteParameterDialog from "./components/DeleteParameterDialog";
import useKpiPageLogic from "./hooks/useKpiPageLogic";

const KpiPage = () => {
  const {
    fromDate,
    toDate,
    now,
    textfieldStyle,
    requestAdminPassword,
    handleFromDateChange,
    handleToDateChange,
    durationValue,
    durationUnit,
    setDurationUnit,
    fields,
    handleFieldChange,
    fieldsDisabled,
    handleSubmit,
    dialogOpen,
    handleDialogClose,
    dialogParameters,
    handleDialogParameterNameInput,
    handleDialogParameterChange,
    removeDialogParameter,
    addDialogParameter,
    handleDialogSubmit,
    unitInfoOpen,
    setUnitInfoOpen,
    mergedKpiData,
    formatDateTime,
    menuAnchorEl,
    menuRowIdx,
    handleMenuOpen,
    handleMenuClose,
    handleView,
    handleDelete,
    viewDialogOpen,
    handleViewDialogClose,
    viewRowData,
    deleteDialogOpen,
    handleDeleteDialogClose,
    handleDeleteConfirm,
    deleteParamsDialogOpen,
    closeDeleteParamsDialog,
    selectedParamsToDelete,
    handleParamCheckboxChange,
    handleDeleteParamsConfirm,
    passwordDialogOpen,
    closePasswordDialog,
    getActionDescription,
    passwordInput,
    setPasswordInput,
    handlePasswordConfirm,
    isDialogSubmitDisabled,
  } = useKpiPageLogic();

  return (
    <Box sx={{ p: { xs: 1, sm: 1 } }}>
      <KpiInputCard
        fromDate={fromDate}
        toDate={toDate}
        now={now}
        textfieldStyle={textfieldStyle}
        handleFromDateChange={handleFromDateChange}
        handleToDateChange={handleToDateChange}
        durationValue={durationValue}
        durationUnit={durationUnit}
        setDurationUnit={setDurationUnit}
        fields={fields}
        handleFieldChange={handleFieldChange}
        fieldsDisabled={fieldsDisabled}
        handleSubmit={handleSubmit}
        requestAdminPassword={requestAdminPassword}
      />

      <AddParameterDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        dialogParameters={dialogParameters}
        textfieldStyle={textfieldStyle}
        onParameterNameChange={handleDialogParameterNameInput}
        onUnitChange={(idx, value) => handleDialogParameterChange(idx, "unit", value)}
        onRemoveParameter={removeDialogParameter}
        onAddParameter={addDialogParameter}
        unitOptions={unitOptions}
        isSubmitDisabled={isDialogSubmitDisabled}
        onSubmit={handleDialogSubmit}
      />

      <UnitInfoDialog
        open={unitInfoOpen}
        onClose={() => setUnitInfoOpen(false)}
        unitInfo={unitInfo}
      />

      <AllKpiDataTable
        mergedKpiData={mergedKpiData}
        formatDateTime={formatDateTime}
        menuAnchorEl={menuAnchorEl}
        menuRowIdx={menuRowIdx}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleView={handleView}
        handleDelete={handleDelete}
      />

      <KpiViewDialog
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
        rowData={viewRowData}
      />

      <KpiDeleteDialog
        open={deleteDialogOpen}
        onCancel={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
      />

      <DeleteParameterDialog
        open={deleteParamsDialogOpen}
        onClose={closeDeleteParamsDialog}
        fields={fields}
        selectedParams={selectedParamsToDelete}
        onChange={handleParamCheckboxChange}
        onConfirm={handleDeleteParamsConfirm}
      />

      <Dialog open={passwordDialogOpen} onClose={closePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Admin Confirmation</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Please enter the admin password to {getActionDescription()}.
          </Typography>
          <TextField
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
            size="small"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ pr: 2, pb: 1 }}>
          <Button variant="outlined" size="small" onClick={closePasswordDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handlePasswordConfirm}
            disabled={!passwordInput}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KpiPage;
