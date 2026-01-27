
import React, { useReducer, memo } from "react";
import { Dialog, Grow } from "@mui/material"; // Added Grow
import MetersBillFormContent from './MetersBillFormContent';

// Reusable Form Component
export const MetersBillForm = memo(({ open, onClose, onSubmit, initialData, meters, tariffData, onOpenTariffSettings }) => {
    
    const [form, setForm] = useReducer(
        (state, updates) => ({ ...state, ...updates }),
        {
            firstMeter: "",
            tariff: "",
            firstMeterParam: "WH Received",
            bescom_bill: 0,
            ...initialData,
        }
    );

    const handleChange = (field) => (e) => {
        const value = typeof e === 'object' && e !== null && 'target' in e ? e.target.value : e;
        setForm({ [field]: value });
    };

    const isValid = form.firstMeter && form.tariff;

    return (
            <Dialog 
                open={open} 
                onClose={onClose} 
                fullWidth 
                maxWidth="sm"
                TransitionComponent={Grow} // Added Grow transition
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: 5,
                  }
                }}
            >
                <MetersBillFormContent
                    form={form}
                    handleChange={handleChange}
                    isValid={isValid}
                    onClose={onClose}
                    onSubmit={onSubmit}
                    initialData={initialData}
                    meters={meters}
                    tariffData={tariffData}
                    onOpenTariffSettings={onOpenTariffSettings}
                />
            </Dialog>
    );
});
  
