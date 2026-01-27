import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DELETE_TARIFFS, UPDATE_TARIFFS } from "../../../services/query";
import { graphqlClient } from "../../../services/client";
import { toast } from 'react-toastify';
import { useState } from 'react';
import { configInit } from "../../../components/layout/globalvariable";
import TariffTable from "./TariffTable";

const TariffDialogContent = ({ fields, formData, tariffData, loading, onChange, onClose, onSave, onTariffChange }) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [tariffToDelete, setTariffToDelete] = useState(null);


    const updateTariff = async (id, updateData) => {
        
        
        // Prepare variables in the correct structure
        const variables = {
          input: {
            id: id,
            tariffPatch: updateData
          }
        };
      
        try {
          // Execute the mutation
          const data = await graphqlClient.request(UPDATE_TARIFFS, variables);
          
          if (data?.updateTariffById?.tariff) {
            toast.success('Tariff updated successfully!');
            // Clear form if needed
            Object.keys(formData).forEach(key => onChange(key, ''));
            if (onTariffChange) onTariffChange(); // <-- Add this line
            return data.updateTariffById.tariff;
          } else {
            toast.error('Failed to update tariff: No data returned');
            throw new Error('No data returned from mutation');
          }
        } catch (error) {
          console.error('Update mutation error:', error);
          toast.error(`Error updating tariff: ${error.message}`);
          throw error; // Re-throw to allow calling code to handle
        }finally{
            onClose();
        }
      };

      const deleteTariff = async (id) => {
        try {
          console.log('Attempting to delete tariff:', id);
          
          // Execute the mutation
          const response = await graphqlClient.request(DELETE_TARIFFS, { input: { id } });
          console.log('Delete response:', response);
          const { deleteTariffById } = response;
      
          // Handle success
          if (deleteTariffById?.tariff) {
            toast.success('Tariff deleted successfully!');
            setDeleteConfirmOpen(false);
            setTariffToDelete(null);
            if (onTariffChange) onTariffChange();
            return deleteTariffById.tariff;
          }
      
          throw new Error('No data returned from server');
          onClose();
        } catch (error) {
          console.error('Delete operation failed:', {
            error: error.message,
            id,
            stack: error.stack,
            clientStatus: !!configInit?.graphqlClient
          });
          toast.error(`Delete failed: ${error.message}`);
          throw error;
          onClose();
        }
      };
      
      
    const handleNumberInput = (field, value) => {
        if (field.type === 'float') {
            // Allow empty value
            if (value === '') {
                onChange(field.name, '');
                return;
            }

            // Allow typing decimal point
            if (value === '.') {
                onChange(field.name, '0.');
                return;
            }

            // Validate number format
            const regex = /^\d*\.?\d*$/;
            if (!regex.test(value)) return;

            const numValue = parseFloat(value);

            // Allow typing in progress
            if (isNaN(numValue)) {
                onChange(field.name, value);
                return;
            }

            // Check min/max only for complete numbers
            if (field.min !== undefined && numValue < field.min) return;
            if (field.max !== undefined && numValue > field.max) return;

            // Don't format while typing
            if (value.endsWith('.')) {
                onChange(field.name, value);
                return;
            }

            // Format only if there are more decimal places than allowed
            const parts = value.split('.');
            if (parts[1] && parts[1].length > field.precision) {
                onChange(field.name, numValue.toFixed(field.precision));
            } else {
                onChange(field.name, value);
            }
        } else if (field.type === 'text' && field.length) {
            // Limit text length
            onChange(field.name, value.slice(0, field.length));
        } else {
            onChange(field.name, value);
        }
    };

    const getHelperText = (field) => {
        if (field.type === 'float' && (field.min !== undefined || field.max !== undefined)) {
            return `(Range: ${field.min || 0} to ${field.max || 100}% (3 decimal places))`;
        }
        if (field.type === 'text' && field.length) {
            return `(Maximum ${field.length} characters (${field.length - (formData[field.name]?.length || 0)} remaining))`;
        }
        return '';
    };

    const handleEdit = (tariff) => {
      //  console.log('Editing tariff:', tariff);
        if (!tariff || !tariff.id) {
            console.error('Invalid tariff data:', tariff);
            toast.error('Invalid tariff data');
            return;
        }

        // Map tariff data to form fields
        const mappedData = {
            tariffName: tariff.tariffName,
            Contract: tariff.percentOfCdKva.toString(),
            demandCharge: tariff.demandChargesRsKva.toString(),
            energyCharge: tariff.energyChargesRsKwh.toString(),
            fuelCostAdjustment: tariff.fuelCostAdjRsKwh.toString(),
            interestOnRevenue: tariff.interestOnRevenue.toString(),
            interestOnTaxes: tariff.interestOnTax.toString(),
            tax: tariff.taxPercent.toString(),
            editingId: tariff.id // Store UUID as is
        };

      //  console.log('Mapped form data:', mappedData);
        Object.entries(mappedData).forEach(([key, value]) => {
            onChange(key, value);
        });
    };

    const handleDeleteClick = (tariff) => {
        setTariffToDelete(tariff);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!tariffToDelete) return;
        console.log("tariffToDelete",tariffToDelete);
        

        try {
            // Assuming deleteTariff is the function that performs the deletion mutation
            // and it's already defined in this component scope.
            // It also seems to handle its own toast notifications.
            await deleteTariff(tariffToDelete.id); 
            toast.success('Tariff deleted successfully!');
            // No need to call setDeleteConfirmOpen or setTariffToDelete here
            // as deleteTariff should handle it on success.
        } catch (error) {
            console.error('Error in handleDeleteConfirm:', error);
            // deleteTariff should already toast an error, but if not, add one here.
            // toast.error(`Failed to delete tariff: ${error.message}`);
            toast.error(`Failed to delete tariff: ${error.message}`);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setTariffToDelete(null);
    };

    const handleSaveInternal = async () => { // Renamed from handleSave to avoid conflict with prop
        try {
            if (!formData.editingId) {
                await onSave(); // Call the passed onSave for new entries
                if (onTariffChange) onTariffChange(); // <-- Add this line
                // Don't close after save
                return;
            }

            // For UUID we don't need to parse it
            const tariffId = formData.editingId;
          //  console.log('Using tariff ID:', tariffId);

            const updateData = {
                tariffName: formData.tariffName,
                percentOfCdKva: parseFloat(formData.Contract),
                demandChargesRsKva: parseFloat(formData.demandCharge),
                energyChargesRsKwh: parseFloat(formData.energyCharge),
                fuelCostAdjRsKwh: parseFloat(formData.fuelCostAdjustment),
                interestOnRevenue: parseFloat(formData.interestOnRevenue),
                interestOnTax: parseFloat(formData.interestOnTaxes),
                taxPercent: parseFloat(formData.tax),
                updatedDate: new Date().toISOString()
            };

          //  console.log('Update data:', updateData);

            // Assuming updateTariff is the function that performs the update mutation
            // and it's already defined in this component scope.
            await updateTariff(tariffId, updateData);
            // updateTariff should handle its own toast notifications and form clearing.

        } catch (error) {
            console.error('Error in handleSaveInternal:', error);
            toast.error(`Error saving tariff: ${error.message}`);
        }finally{
            onClose();
        }
    };

    return (
        <>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
                mt: 1
            }}>
                {fields.map((field) => (
                    <Box
                        key={field.name}
                        sx={{
                            gridColumn: field.name === 'tariffName' ? '1 / -1' : 'auto',
                        }}
                    >
                        <TextField
                            fullWidth
                            label={field.label}
                            InputLabelProps={{ sx: { fontSize: '0.97rem' } }}
                            variant="outlined"
                            required={field.required}
                            size="small"
                            type={field.type === 'float' ? 'text' : field.type}
                            inputProps={{
                                inputMode: field.type === 'float' ? 'decimal' : 'text',
                                min: field.min,
                                max: field.max,
                                maxLength: field.type === 'text' ? field.length : undefined
                            }}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleNumberInput(field, e.target.value)}
                            helperText={getHelperText(field)}
                            FormHelperTextProps={{
                                sx: { margin: '0px 0 0 0', fontSize: '0.7rem', fontStyle: 'italic' }
                            }}
                        />
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1, gap: 1 }}>
                <Button
                    onClick={() => {
                        Object.keys(formData).forEach(key => onChange(key, ''));
                        onClose();
                    }}
                    variant="contained"
                    size="small"
                    color="error"
                >
                    Close
                </Button>
                <Button
                    onClick={handleSaveInternal} // Use the renamed internal handler
                    variant="contained"
                    size="small"
                    color="primary"
                    disabled={!formData.tariffName || !formData.Contract || !formData.demandCharge ||
                        !formData.energyCharge || !formData.fuelCostAdjustment || !formData.interestOnRevenue ||
                        !formData.interestOnTaxes || !formData.tax}
                >
                    {formData.editingId ? 'Update' : 'Save'}
                </Button>
            </Box>

            <Box sx={{ borderTop: '1px solid #e0e0e0', my: 1 }} />
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Tariff Information</Typography>

            <TariffTable
                loading={loading}
                tariffData={tariffData}
                fields={fields}
                configInit={configInit}
                handleEdit={handleEdit}
                handleDeleteClick={handleDeleteClick}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete tariff "{tariffToDelete?.tariffName}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary" size="small" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" size="small" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TariffDialogContent;
