
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Grow } from '@mui/material'; // Added Grow
import TariffDialogContent from './TariffDialogContent';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../../services/client';
import { INSERT_TARIFFS } from '../../../services/query';

const TariffDialog = ({ open, onClose, tariffData: initialTariffData, loading: initialLoading, error: initialError }) => {
    
    const fields = [
        { name: 'tariffName', label: 'Tariff Name', type: 'text', length: 20 },
        { name: 'Contract', label: 'Percent % of CD (KVA)', type: 'float', min: 0, max: 100, precision: 3 },
        { name: 'demandCharge', label: 'Demand Charges Rs/KVA', type: 'number' },
        { name: 'energyCharge', label: 'Energy Charges Rs/KWh', type: 'number' },
        { name: 'fuelCostAdjustment', label: 'Fuel Cost Adj Rs/KWh', type: 'number' },
        { name: 'interestOnRevenue', label: 'Interest on Revenue', type: 'number' },
        { name: 'interestOnTaxes', label: 'Interest on Tax', type: 'number' },
        { name: 'tax', label: 'Tax %', type: 'float', min: 0, max: 100, precision: 3 }
    ];

    const [formData, setFormData] = useState(fields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
    }, {}));
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const tariffVariables = {
                tariffName: formData.tariffName,
                percentOfCdKva: parseFloat(formData.Contract) || 0,
                demandChargesRsKva: parseFloat(formData.demandCharge) || 0,
                energyChargesRsKwh: parseFloat(formData.energyCharge) || 0,
                fuelCostAdjRsKwh: parseFloat(formData.fuelCostAdjustment) || 0,
                interestOnRevenue: parseFloat(formData.interestOnRevenue) || 0,
                interestOnTax: parseFloat(formData.interestOnTaxes) || 0,
                taxPercent: parseFloat(formData.tax) || 0,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
            };
            console.log(tariffVariables);
            
            const data = await graphqlClient.request(INSERT_TARIFFS, { 
              input: { 
                tariff: tariffVariables
              } 
            });

            console.log("data=>",data);
            

            if (data?.createTariff?.tariff) {
                toast.success('Tariff saved successfully!');
                setFormData(fields.reduce((acc, field) => { 
                    acc[field.name] = '';
                    return acc;
                }, {}));
            } else {
                toast.error('Failed to save tariff.');
            }
        } catch (error) {
            console.error('Error saving tariff:', error);
            toast.error('Error saving tariff. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="lg"
            TransitionComponent={Grow} // Added Grow transition
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: 5,
              }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium' }}>Tariff Settings</DialogTitle>
            <DialogContent sx={{ m: 0 }}>
                <TariffDialogContent 
                    fields={fields} 
                    formData={formData} 
                    tariffData={initialTariffData} 
                    loading={initialLoading || isSubmitting} 
                    onChange={handleChange}
                    onClose={onClose}
                    onSave={handleSave}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TariffDialog;
