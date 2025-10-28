
// Helper function to safely format numbers
export const formatToFixedSafe = (value, digits = 2) => {
    const num = Number(value);
    if (Number.isNaN(num) || typeof num !== 'number') {
        return (0).toFixed(digits);
    }
    return num.toFixed(digits);
};

export const calculatePercentageShare = (rowNetConsumption, totalNetConsumption) => {
    const rn = Number(rowNetConsumption) || 0;
    const tn = Number(totalNetConsumption) || 0;
    if (tn === 0) return 0;
    return (rn / tn) * 100;
};

export const calculateAdjustmentNetConsumption = (row, percentageShare) => {
    const rowSharedNetConsumption = Number(row.sharedNetConsumption) || 0;
    const rowAdjustmentNetConsumption = Number(row.adjustmentNetConsumption) || 0;
    const percShareDecimal = percentageShare / 100;

    if (rowSharedNetConsumption === 0) {
        return rowSharedNetConsumption + rowAdjustmentNetConsumption * percShareDecimal;
    } else {
        return rowAdjustmentNetConsumption * percShareDecimal;
    }
};

export const calculateAdjustedConsumptionkWh = (row, percentageShare) => {
    const adjustedNetConsumption = calculateAdjustmentNetConsumption(row, percentageShare);
    const netConsumption = Number(row.netConsumption) || 0;
    return adjustedNetConsumption - netConsumption;
};

export const calculateCurrentBillAmount = (row, percentageShare) => {
    const energyC = Number(row.energyCharges) || 0;
    const taxVal = Number(row.tax) || 0;
    const percShareDecimal = percentageShare / 100;
    const rawPercentCDKVA = Number(row.rawPercentofCDKVA) || 0;

    const demandC = (Number(row.demandCharges) || 0) * percShareDecimal * (rawPercentCDKVA / 100);
    const fcaC = (Number(row.fcaCharges) || 0) * percShareDecimal;
    const interOnRevC = (Number(row.interOnReven) || 0) * percShareDecimal;
    const interOnTaxC = (Number(row.interOnTax) || 0) * percShareDecimal;

    return energyC + taxVal + demandC + fcaC + interOnRevC + interOnTaxC;
};

export const calculateAdjustedEnergyCharges = (row, percentageShare) => {
    const adjEnergyChargesVal = Number(row.adjEnergyCharges) || 0;
    const adjustedNetConsumption = calculateAdjustmentNetConsumption(row, percentageShare);
    return adjEnergyChargesVal * adjustedNetConsumption;
};

export const calculateAdjustedTax = (row, percentageShare) => {
    const adjTaxVal = Number(row.adjTax) || 0; // This adjTax is likely a percentage (e.g., 0.09 for 9%)
    const adjustedEnergyCharges = calculateAdjustedEnergyCharges(row, percentageShare);
    return adjTaxVal * adjustedEnergyCharges; // If adjTax is 0.09, this directly gives tax amount
};

export const calculateTotalAdjustedAmount = (row, percentageShare) => {
    const adjCurrentBillAmountVal = Number(row.adjCurrentBillAmount) || 0; // Base amount for adjustment
    const energyCharges = calculateAdjustedEnergyCharges(row, percentageShare);
    const taxVal = calculateAdjustedTax(row, percentageShare);
    const percShareDecimal = percentageShare / 100;
    const rawPercentCDKVA = Number(row.rawPercentofCDKVA) || 0;

    const demand = (Number(row.demandCharges) || 0) * percShareDecimal * (rawPercentCDKVA / 100);
    const fcaVal = (Number(row.fcaCharges) || 0) * percShareDecimal;
    const interOnRevenueVal = (Number(row.interOnReven) || 0) * percShareDecimal;
    const interOnTaxVal = (Number(row.interOnTax) || 0) * percShareDecimal;

    return adjCurrentBillAmountVal + energyCharges + taxVal + demand + fcaVal + interOnRevenueVal + interOnTaxVal;
};
