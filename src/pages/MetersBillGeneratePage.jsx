import React, { useRef, useState, useEffect } from "react";
import { Button, Box, Stack, useMediaQuery, useTheme, Dialog, DialogContent, DialogActions, DialogTitle, Typography, CircularProgress, LinearProgress, Grow, Fade, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../constants/toastIds";
import TariffDialog from "../features/billing/components/TariffDialog";
import { InputFieldsRow } from "../features/billing/components/InputFieldsRow";
import {
  DELETE_REPORTDATA,
  GET_TARIFFS, // This query is used by useMeterData hook
  INSERT_METER_DATA,
  UPDATE_REPORTDATA,
} from "../services/query";
import { graphqlClient } from "../services/client";
import { MetersBillForm } from "../features/billing/components/MetersBillForm";
import { ShareDialog } from "../features/billing/components/ShareDialog";
import { format } from 'date-fns';
import axios from "axios";
import { ModifyEditDialog } from "../features/billing/components/ModifyEditDialog";
import { useReactToPrint } from "react-to-print";
import { DGTariffDialog } from "../features/billing/components/DGTariffDialog";
import {
    formatToFixedSafe,
    calculatePercentageShare,
    calculateAdjustmentNetConsumption,
    calculateAdjustedConsumptionkWh,
    calculateCurrentBillAmount,
    calculateAdjustedEnergyCharges,
    calculateAdjustedTax,
    calculateTotalAdjustedAmount,
} from "../features/billing/utils/billingCalculations";
import { DateRangePicker } from "../features/billing/components/DateRangePicker";
import { MeterBillTable } from "../features/billing/components/MeterBillTable";
import ElectricityBill from "../features/billing/pdf/ElectricityBill";
import { configInit } from "../components/layout/globalvariable";
import { useMeterData } from "../features/billing/hooks/useMeterData";


const ActionButtons = ({ isSmallScreen, meters, onAdd, onTariff, tariffData, loadingTariff }) => (
  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
    <Button onClick={onAdd} variant="contained" size="small" disabled={!meters || meters.length === 0}>
      Add
    </Button>
    <Button
      onClick={onTariff}
      variant="contained"
      color="secondary"
      size="small"
    >
      Tariff Settings
    </Button>
  </Stack>
);

const handleApplyDateFilter = async (state, tableData, setTableData, tariffDataArray, setLoading, handleStateChange) => {
  const { fromDate, toDate, contractDemand, fcaCharges, interOnReven, interOnTax, adjustmentNetConsumption, dgTariff } = state;
  const token = localStorage.getItem("accessToken") || "";

  if (!fromDate || !toDate) {
    toast.error('Please select both From and To dates', { toastId: TOAST_IDS.BILL_GENERATE });
    return;
  }

  if (fromDate > toDate) {
    toast.error('From date cannot be later than To date', { toastId: TOAST_IDS.BILL_GENERATE });
    return;
  }

  try {
    setLoading(true);
    const formattedFromDate = format(fromDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const formattedToDate = format(toDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const metersPayload = tableData.map((row) => ({
      meter_id: row.firstMeter.match(/\((.*?)\)/)?.[1] || row.firstMeter,
      param: ['Wh_Received', 'Wh_Delivered'],
    }));

    console.log("metersPayload", metersPayload);
    const response = await axios.get(`${configInit.appBaseUrl}/v2/api/report/get-data-batch`,
      {
        params: {
          from: formattedFromDate,
          to: formattedToDate,
          meters: JSON.stringify(metersPayload),
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("response", response);
    const { results } = response.data;
    if (!results || results.length === 0) {
      toast.warning('No valid data found for the selected meters', { toastId: TOAST_IDS.BILL_GENERATE });
      setLoading(false);
      return;
    }

    const updatedTableData = tableData.map(row => {
      const meterIdMatch = row.firstMeter.match(/\((.*?)\)/);
      const bracketoutsidetext = row.firstMeter.split('(')[0] || row.firstMeter;
      const meterId = meterIdMatch ? meterIdMatch[1] : row.firstMeter;

      const resultsForMeter = results.filter(r => r.meterId === meterId);
      const whRecvd = resultsForMeter.find(r => r.param === 'Wh_Received');
      const whDelvrd = resultsForMeter.find(r => r.param === 'Wh_Delivered');

      const tariff = tariffDataArray?.find(t => t.tariff_name === row.tariff) || {};

      const netConsumption = (whRecvd?.max != null && whRecvd?.min != null)
        ? whRecvd.max - whRecvd.min
        : 0;

      const baseEnergyCharges = netConsumption * (Number(tariff.energy_charges_rs_kwh) || 0);
      const taxAmount = baseEnergyCharges * (Number(tariff.tax_percent) || 0) / 100;
      const demandChargesValue = (Number(contractDemand) || 0) * (Number(tariff.demand_charges_rs_kva) || 0);

      const currentBillAmount = baseEnergyCharges + taxAmount + demandChargesValue +
        Number(fcaCharges || 0) + Number(interOnReven || 0) + Number(interOnTax || 0);

      const adjEnergyCharges = (Number(tariff.energy_charges_rs_kwh) || 0);
      const adjTax = (Number(tariff.tax_percent) || 0) / 100;
      // console.log("cscscscs", row);
      return {
        ...row,
        meterLableName: bracketoutsidetext,
        rawPercentofCDKVA: Number(tariff.percent_of_cd_kva) || 0,
        rawDemandChargesRsKva: Number(tariff.demand_charges_rs_kva) || 0,
        rawEnergyChargesRsKwh: Number(tariff.energy_charges_rs_kwh) || 0,
        rawTaxPercent: Number(tariff.tax_percent) || 0,
        rawFuelCostAdjRsKwh: Number(tariff.fuel_cost_adj_rs_kwh) || 0,
        rawInterestOnRevenue: Number(tariff.interest_on_revenue) || 0,
        rawInterestOnTax: Number(tariff.interest_on_tax) || 0,
        dg_previous: Number(whDelvrd?.min) || 0,
        dg_present: Number(whDelvrd?.max) || 0,
        dg_netConsumption: (whDelvrd?.max != null && whDelvrd?.min != null)
          ? whDelvrd.max - whDelvrd.min
          : 0,
        dg_energyCharges: ((Number(whDelvrd?.max) || 0) - (Number(whDelvrd?.min) || 0)) * (Number(dgTariff) || 0),
        eb_previous: Number(whRecvd?.min) || 0,
        eb_present: Number(whRecvd?.max) || 0,
        netConsumption,
        energyCharges: baseEnergyCharges,
        tax: taxAmount,
        contractDemand: Number(contractDemand || 0),
        canShared: true,
        demandCharges: demandChargesValue,
        fcaCharges: Number(fcaCharges || 0),
        interOnReven: Number(interOnReven || 0),
        interOnTax: Number(interOnTax || 0),
        currentBillAmount,
        adjustmentNetConsumption: Number(adjustmentNetConsumption || 0),
        adjEnergyCharges,
        adjTax,
        adjCurrentBillAmount: 0,
        sharedNetConsumption: 0,
      };
    });

    const totalNetConsumption = updatedTableData.reduce(
      (sum, row) => sum + (Number(row.netConsumption) || 0),
      0
    );

    const finalTableData = updatedTableData.map(row => ({
      ...row,
      adjustmentNetConsumption: Number(adjustmentNetConsumption) === 0 ? totalNetConsumption : Number(adjustmentNetConsumption),
    }));
    setTableData(finalTableData);

    if (Number(adjustmentNetConsumption) === 0) {
      handleStateChange({ adjustmentNetConsumption: totalNetConsumption });
    }

    handleStateChange({ isApplied: true });
    toast.success('Data filtered successfully', { toastId: TOAST_IDS.REPORT_GENERATE });

  } catch (error) {
    console.error('Error fetching filtered data:', error);
    toast.error('Error fetching filtered data: ' + (error.response?.data?.error || error.message), { toastId: TOAST_IDS.REPORT_GENERATE });
  } finally {
    setLoading(false);
  }
};

const MetersBillGeneratePage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
    onAfterPrint: () => console.log("Printing completed"),
  });

  const [state, setState] = useState({
    openForm: false,
    openTariff: false,
    shareDialog: null,
    editData: null,
    fromDate: null,
    toDate: null,
    contractDemand: '',
    fcaCharges: '',
    interOnReven: '',
    interOnTax: '',
    adjustmentNetConsumption: '',
    dgTariff: 0,
    showAdjNetCons: false,
    afterSharedValue: 0,
    openModifyAdjNetConsumption: false,
    isApplied: false,
    showBillTemplate: false,
    billData: [],
    openDGTariffDialog: false
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const {
    meters,
    tableData,
    setTableData,
    sharedMeters,
    setSharedMeters,
    totals, // This totals is from useMeterData, calculated based on raw tableData
    loading: meterDataLoading,
    setLoading: setMeterDataLoading,
    tariffData, // This is an object like { tariffs: [], loading: true, error: null }
    loadingTariff
  } = useMeterData();

  const handleStateChange = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async (form) => {
    const dataToSubmit = {
      firstMeter: form.firstMeter,
      tariff: form.tariff,
      bescomBill: 0,
      ...(state.editData && { updated_at: new Date().toISOString() }),
    };
  
    const mutation = state.editData ? UPDATE_REPORTDATA : INSERT_METER_DATA;
  
    const variables = state.editData
      ? {
          input: {
            id: state.editData.id,
            reportDataPatch: dataToSubmit,
          },
        }
      : {
          input: {
            reportdatum: dataToSubmit,
          },
        };
  
    try {
      const response = await graphqlClient.request(mutation, variables);
      console.log("response=>", response);
  
      if (state.editData) {
        // Update existing row in tableData
        setTableData((prev) =>
          prev.map((row) =>
            row.id === state.editData.id ? { ...row, ...dataToSubmit } : row
          )
        );
      } else {
        // Insert new row from response
        const newRow = response.createReportdatum?.reportdatum;
  
        if (newRow) {
          setTableData((prev) => [...prev, newRow]);
        } else {
          toast.warning("Form submitted but no data returned.", { toastId: TOAST_IDS.BILL_GENERATE });
        }
      }
  
      handleStateChange({ openForm: false, editData: null });
      toast.success(`Form ${state.editData ? "Updated" : "Submitted"} Successfully!`, { toastId: TOAST_IDS.BILL_GENERATE });
    } catch (error) {
      toast.error("Error in submitting the form: " + error.message, { toastId: TOAST_IDS.BILL_GENERATE });
      console.error("Error submitting form:", error);
    }
  };
  


  const handleDelete = async (row) => {

    console.log("row",row.id);
    
    try {
      await graphqlClient.request(DELETE_REPORTDATA, { 
        input: { 
          id: row.id 
        } 
      });

      toast.success("Meter data deleted successfully!", { toastId: TOAST_IDS.BILL_GENERATE });
      setTableData((prev) => prev.filter((item) => item.id !== row.id));

    } catch (error) {
      toast.error("Error deleting meter data: " + error.message, { toastId: TOAST_IDS.BILL_GENERATE });
      console.error("Error deleting meter data:", error);
    }
  };

  const handleEdit = (row) => {
    handleStateChange({ editData: row, openForm: true });
  };

  const handleShareDialog = (row) => {
    if (!row) return;
    const getNetSharedConsumption = Number(row.netConsumption) || 0;
    setSharedMeters(prev => {
      const newEntry = {
        meterName: row.firstMeter,
        eb_netConsumption: Number(row.eb_present - row.eb_previous) || 0,
        total_netConsumption: getNetSharedConsumption
      };
      const combined = [...prev, newEntry];
      const updatedSharedMeters = [...new Map(combined.map(item => [item.meterName, item])).values()];
      const sharedTotal = updatedSharedMeters.reduce((sum, meter) => sum + (meter.total_netConsumption || 0), 0);
      setTableData(prevTable => {
        const otherMetersTotalNetConsumption = prevTable
          .filter(r => r.firstMeter !== row.firstMeter && !updatedSharedMeters.some(sm => sm.meterName === r.firstMeter))
          .reduce((acc, r) => acc + (Number(r.netConsumption) || 0), 0);
        return prevTable
          .map(r => {
            if (r.firstMeter !== row.firstMeter && !updatedSharedMeters.some(sm => sm.meterName === r.firstMeter)) {
              const ratio = otherMetersTotalNetConsumption > 0 ? (Number(r.netConsumption) / otherMetersTotalNetConsumption) : 0;
              return { ...r, sharedNetConsumption: sharedTotal * ratio };
            }
            return r;
          })
          .filter(r => r.firstMeter !== row.firstMeter);
      });
      return updatedSharedMeters;
    });
  };

  const handleGenerateBill = async () => {
    setMeterDataLoading(true);
    try {
        const totalNetConsumption_for_percentage = tableData.reduce((sum, r) => sum + (Number(r.netConsumption) || 0), 0);

        const reportData = tableData.map(item => {
            const percShare = calculatePercentageShare(item.netConsumption, totalNetConsumption_for_percentage);
            return {
                ...item, // Spread original item data
                dgTariff: state.dgTariff,
                buildingName: configInit.buildingName,
                address: configInit.address,
                orgName: configInit.orgName,
                tenantMeterId: item.firstMeter,
                tenantName: 'FULL BUILDING', // Assuming static
                tenantSinceDate: '01/05/23', // Assuming static
                period: state.fromDate && state.toDate ? `${format(state.fromDate, 'yyyy/MM/dd')}-${format(state.toDate, 'yyyy/MM/dd')}` : 'N/A',
                billDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                discDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                rowAdjNetConsumptionkwh: formatToFixedSafe(calculateAdjustedConsumptionkWh(item, percShare)),
                rowAdjNetConsumption: formatToFixedSafe(calculateAdjustmentNetConsumption(item, percShare)),
                percentageShare: formatToFixedSafe(percShare),
                demandCharges: formatToFixedSafe((Number(item.demandCharges) || 0) * (percShare / 100) * ((Number(item.rawPercentofCDKVA) || 0) / 100)),
                fcaCharges: formatToFixedSafe((Number(item.fcaCharges) || 0) * (percShare / 100)),
                interOnReven: formatToFixedSafe((Number(item.interOnReven) || 0) * (percShare / 100)),
                interOnTax: formatToFixedSafe((Number(item.interOnTax) || 0) * (percShare / 100)),
                currentBillAmount: formatToFixedSafe(calculateCurrentBillAmount(item, percShare)),
                adjEnergyCharges: formatToFixedSafe(calculateAdjustedEnergyCharges(item, percShare)),
                adjTax: formatToFixedSafe(calculateAdjustedTax(item, percShare)),
                adjCurrentBillAmount: formatToFixedSafe(calculateTotalAdjustedAmount(item, percShare)),
            };
        });

        const totalPercentageShareVal = tableData.reduce((sum, row) => sum + calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage), 0);
        const totalCurrentBillAmountVal_calc = tableData.reduce((sum, row) => sum + calculateCurrentBillAmount(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalAdjustedNetConsumptionVal_calc = tableData.reduce((sum, row) => sum + calculateAdjustmentNetConsumption(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalAdjustReadingKWhVal_calc = tableData.reduce((sum, row) => sum + calculateAdjustedConsumptionkWh(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalAdjustEnergyChargeVal_calc = tableData.reduce((sum, row) => sum + calculateAdjustedEnergyCharges(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalAdjustTaxVal_calc = tableData.reduce((sum, row) => sum + calculateAdjustedTax(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalAdjustCurrentBillAmountVal_calc = tableData.reduce((sum, row) => sum + calculateTotalAdjustedAmount(row, calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage)), 0);
        const totalDemandChargesVal_calc = tableData.reduce((sum, row) => sum + ((Number(row.demandCharges) || 0) * (calculatePercentageShare(row.netConsumption, totalNetConsumption_for_percentage) / 100) * ((Number(row.rawPercentofCDKVA) || 0) / 100)), 0);

      const totalsRow = {
        isTotal: true,
        firstMeter: "(Total)",
        meterLableName: "(Total)",
        buildingName: configInit.buildingName,
        address: configInit.address,
        orgName: configInit.orgName,
        period: state.fromDate && state.toDate ? `${format(state.fromDate, 'yyyy/MM/dd')}-${format(state.toDate, 'yyyy/MM/dd')}` : 'N/A',
        billDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        eb_previous: formatToFixedSafe(totals.eb_previous),
        eb_present: formatToFixedSafe(totals.eb_present),
        dg_previous: formatToFixedSafe(totals.dg_previous),
        dg_present: formatToFixedSafe(totals.dg_present),
        dg_netConsumption: formatToFixedSafe(totals.dg_netConsumption),
        dg_energyCharges: formatToFixedSafe(totals.dg_energyCharges),
        dgTariff: state.dgTariff,
        netConsumption: formatToFixedSafe(totals.netConsumption),
        energyCharges: formatToFixedSafe(totals.energyCharges),
        tax: formatToFixedSafe(totals.tax * (totalPercentageShareVal / 100)), // Adjusted tax total
        contractDemand: state.contractDemand,
        demandCharges: formatToFixedSafe(totalDemandChargesVal_calc),
        fcaCharges: formatToFixedSafe(totals.fcaCharges * (totalPercentageShareVal / 100)),
        interOnReven: formatToFixedSafe(totals.interOnReven * (totalPercentageShareVal / 100)),
        interOnTax: formatToFixedSafe(totals.interOnTax * (totalPercentageShareVal / 100)),
        currentBillAmount: formatToFixedSafe(totalCurrentBillAmountVal_calc),
        sharedNetConsumption: formatToFixedSafe(tableData.reduce((sum, row) => sum + (Number(row.sharedNetConsumption) || 0), 0)),
        rowAdjNetConsumption: formatToFixedSafe(totalAdjustedNetConsumptionVal_calc),
        adjustmentNetConsumption: formatToFixedSafe(totalAdjustedNetConsumptionVal_calc),
        adjustedReadingKWh: formatToFixedSafe(totalAdjustReadingKWhVal_calc),
        adjEnergyCharges: formatToFixedSafe(totalAdjustEnergyChargeVal_calc),
        adjTax: formatToFixedSafe(totalAdjustTaxVal_calc),
        adjCurrentBillAmount: formatToFixedSafe(totalAdjustCurrentBillAmountVal_calc),
        rawPercentofCDKVA: tableData.length > 0 ? (Number(tableData[0].rawPercentofCDKVA) || 0) : 0,
        rawDemandChargesRsKva: tableData.length > 0 ? (Number(tableData[0].rawDemandChargesRsKva) || 0) : 0,
        rawEnergyChargesRsKwh: tableData.length > 0 ? (Number(tableData[0].rawEnergyChargesRsKwh) || 0) : 0,
        rawTaxPercent: tableData.length > 0 ? (Number(tableData[0].rawTaxPercent) || 0) : 0,
      };

      handleStateChange({
        showBillTemplate: true,
        billData: [...reportData, totalsRow]
      });
      toast.success('Bill generated successfully', { toastId: TOAST_IDS.BILL_GENERATE });
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error(error.response?.data?.error || 'Failed to generate bill');
    } finally {
      setMeterDataLoading(false);
    }
  };

  return (
    <Fade in={loaded} timeout={700}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: {xs: 1, sm: 2} }}>
        {meterDataLoading && !state.showBillTemplate ? (
          <CircularProgress />
        ) : (
          <>
            <Stack direction="column" spacing={2} sx={{ width: "100%", mb: 2 }}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <ActionButtons
                  isSmallScreen={isSmallScreen}
                  meters={meters}
                  onAdd={() => handleStateChange({ openForm: true, editData: null })}
                  onTariff={() => handleStateChange({ openTariff: true })}
                  tariffData={tariffData?.tariffs || []}
                  loadingTariff={loadingTariff}
                />
              </Paper>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <DateRangePicker
                  fromDate={state.fromDate}
                  toDate={state.toDate}
                  onFromDateChange={(date) => handleStateChange({ fromDate: date })}
                  onToDateChange={(date) => handleStateChange({ toDate: date })}
                  isSmallScreen={isSmallScreen}
                  disabled={state.isApplied}
                />
                <Box sx={{mt: 2}}>
                  <InputFieldsRow
                    state={state}
                    onStateChange={handleStateChange}
                    isSmallScreen={isSmallScreen}
                    disabled={state.isApplied}
                    tableData={tableData}
                    setTableData={setTableData}
                    tariffData={tariffData?.tariffs || []}
                    loading={meterDataLoading}
                    setLoading={setMeterDataLoading}
                    handleApplyDateFilter={handleApplyDateFilter}
                  />
                </Box>
              </Paper>
            </Stack>

            <MetersBillForm
              open={state.openForm}
              onClose={() => handleStateChange({ openForm: false, editData: null })}
              onSubmit={handleSubmit}
              initialData={state.editData}
              meters={meters || []}
              tariffData={tariffData?.tariffs || []}
              onOpenTariffSettings={() => handleStateChange({ openTariff: true })}
            />
            <Box sx={{ width: '100%', borderBottom: '2px solid #e0e0e0', my: 2 }} />
            <Button
              onClick={handleGenerateBill}
              variant="contained"
              color="primary"
              size="medium"
              sx={{ mb: 2, px: 3, py: 1 }}
              disabled={!state.isApplied || meterDataLoading}
            >
              {meterDataLoading ? <CircularProgress size={24} color="inherit" /> : "Generate Bill"}
            </Button>
            <Grow in={(tableData && tableData.length > 0) || (sharedMeters && sharedMeters.length > 0)} timeout={500}>
                <Paper elevation={3} sx={{width: '100%', borderRadius: 2, overflow: 'hidden'}}>
                    <MeterBillTable
                        data={tableData || []}
                        handleStateChange={handleStateChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        setTableData={setTableData}
                        setShareDialog={(row) => handleStateChange({ shareDialog: row })}
                        totals={totals} // Pass calculated totals
                        sharedMeters={sharedMeters || []}
                        state={state}
                    />
                </Paper>
            </Grow>

            <TariffDialog
              open={state.openTariff}
              onClose={() => handleStateChange({ openTariff: false })}
              tariffData={tariffData} // Pass the whole tariffData object
              loading={loadingTariff}
            />

            <Dialog open={Boolean(state.shareDialog)} onClose={() => handleStateChange({ shareDialog: null })} TransitionComponent={Grow}>
              <ShareDialog
                open={Boolean(state.shareDialog)}
                onClose={() => handleStateChange({ shareDialog: null })}
                onConfirm={() => {
                  handleShareDialog(state.shareDialog);
                  handleStateChange({ shareDialog: null });
                }}
              />
            </Dialog>
            <Dialog open={state.openModifyAdjNetConsumption} onClose={() => handleStateChange({ openModifyAdjNetConsumption: false })} TransitionComponent={Grow}>
              <ModifyEditDialog
                open={state.openModifyAdjNetConsumption}
                onClose={() => handleStateChange({ openModifyAdjNetConsumption: false })}
                state={state}
                handleStateChange={handleStateChange}
                setTableData={setTableData}
              />
            </Dialog>
            <Dialog open={state.openDGTariffDialog} onClose={() => handleStateChange({ openDGTariffDialog: false })} TransitionComponent={Grow}>
              <DGTariffDialog
                open={state.openDGTariffDialog}
                onClose={() => handleStateChange({ openDGTariffDialog: false })}
                dgTariff={state.dgTariff}
                onStateChange={handleStateChange}
              />
            </Dialog>
            <Dialog
              open={state.showBillTemplate}
              onClose={() => handleStateChange({ showBillTemplate: false })}
              maxWidth="lg"
              fullWidth
              TransitionComponent={Grow}
            >
              <DialogTitle>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ flex: 1, textAlign: "center", ml: { xs: 0, sm: 12 } }}>
                    Detailed Bill
                  </Typography>
                  <Button variant="contained" color="secondary" size="small" onClick={() => handleStateChange({ showBillTemplate: false })}>
                    Close
                  </Button>
                  <Button variant="contained" size="small" onClick={handlePrint} disabled={meterDataLoading}>
                    {meterDataLoading ? <CircularProgress size={20} /> : "Print Bill"}
                  </Button>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ mb: 2 }}>
                {meterDataLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> :
                  <ElectricityBill printRef={printRef} data={state.billData.sort((a, b) => {
                    const getMeterId = (meter) => {
                      if (!meter?.firstMeter) return '';
                      return meter.firstMeter.includes('(')
                        ? meter.firstMeter.split('(')[1]?.replace(')', '')
                        : meter.firstMeter;
                    };
                    return getMeterId(a).localeCompare(getMeterId(b));
                  })} />
                }
              </DialogContent>
            </Dialog>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default MetersBillGeneratePage;
