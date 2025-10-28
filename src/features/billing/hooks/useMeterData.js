import { useEffect, useState } from "react";
import axios from "axios";
import { GET_METER_INFO, GET_REPORTDATA, GET_TARIFFS } from "../../../services/query";
import { graphqlClient } from "../../../services/client";
import useBillStore from "./useBillStore";
import { configInit } from "../../../components/layout/globalvariable";


export const useMeterData = (nodeId) => {
  const [meters, setMeters] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [sharedMeters, setSharedMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tariffData, setTariffData] = useState({ tariffs: [], loading: true, error: null });
  const token = localStorage.getItem("accessToken") || "";
  const { adjustmentNetConsumption, setAdjustmentNetConsumption } = useBillStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const meterInfoPromise = graphqlClient.request(GET_METER_INFO);
        const reportDataPromise = graphqlClient.request(GET_REPORTDATA, { nodeId });
        const tariffsPromise = graphqlClient.request(GET_TARIFFS);
        console.log("tariffsPromise=>",reportDataPromise);

        const [meterInfoData, reportData, tariffResult] = await Promise.all([
          meterInfoPromise,
          reportDataPromise,
          tariffsPromise,
        ]);

        console.log("tariffResult=>", tariffResult.allTariffs.nodes); // This will show the real data
        console.log("meterInfoData=>", meterInfoData.allMeterConfigrations.nodes);
        console.log("reportData=>",reportData.allReportdata.nodes);
        
        
        
        

        const fetchedMeters = meterInfoData?.allMeterConfigrations.nodes || [];
        setMeters(
          fetchedMeters.map(
            (m) => `${m.label}(${configInit.gatewayName}_id${m.meterNo})`
          )
        );

        setTableData(reportData?.allReportdata.nodes || []);
        
        setTariffData({ tariffs: tariffResult?.allTariffs?.nodes || [], loading: false, error: null });

      } catch (error) {
        console.error("Failed to fetch billing data:", error);
        // Optionally handle specific errors for different queries
        if (error.message.includes('meter_configration')) {
            console.error("Meter info fetch error:", error);
        }
        if (error.message.includes('reportdata')) {
            console.error("Report data fetch error:", error);
        }
        if (error.message.includes('tariffs')) {
            setTariffData({ tariffs: [], loading: false, error });
        }
      }
    };

    fetchData(); // Initial fetch
    // const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

    // return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchAllMeters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${configInit.appBaseUrl}/v2/api/meterconfig/getallmeter`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const available = response.data.measurements?.filter(
          (m) => !tableData.some((t) => t.firstMeter.includes(m))
        ) || [];
      } catch (error) {
        console.error("Fetch all meters error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) { 
        fetchAllMeters();
    } else {
        setLoading(false); 
    }
  }, [token, tableData]); 

  const calculateTotals = (data) => {
    return data.reduce(
      (acc, row) => ({
        tariff: row.tariff,
        eb_present: acc.eb_present + (Number(row.eb_present) || 0),
        eb_previous: acc.eb_previous + (Number(row.eb_previous) || 0),
        dg_present: acc.dg_present + (Number(row.dg_present) || 0),
        dg_previous: acc.dg_previous + (Number(row.dg_previous) || 0),
        netConsumption: acc.netConsumption + (Number(row.netConsumption) || 0),
        energyCharges: acc.energyCharges + (Number(row.energyCharges) || 0),
        tax: acc.tax + (Number(row.tax) || 0),
        rawDemandChargesRsKva: Number(row.rawDemandChargesRsKva) || 0,
        contractDemand: acc.contractDemand + (Number(row.contractDemand) || 0),
        demandCharges: Number(row.demandCharges) || 0,
        rawEnergyChargesRsKwh: Number(row.rawEnergyChargesRsKwh) || 0,
        fcaCharges: Number(row.fcaCharges) || 0,
        interOnReven: Number(row.interOnReven) || 0,
        interOnTax: Number(row.interOnTax) || 0,
        currentBillAmount: acc.currentBillAmount + (Number(row.currentBillAmount) || 0),
        adjustmentNetConsumption:
          acc.adjustmentNetConsumption + (Number(row.adjustmentNetConsumption) || 0),
        adjustedReadingKWh: acc.adjustedReadingKWh + (Number(row.adjustedReadingKWh) || 0),
        adjEnergyCharges: acc.adjEnergyCharges + (Number(row.adjEnergyCharges) || 0),
        adjTax: acc.adjTax + (Number(row.adjTax) || 0),
        adjCurrentBillAmount:
          acc.adjCurrentBillAmount + (Number(row.adjCurrentBillAmount) || 0),
        percentageShare:
          acc.netConsumption > 0
            ? data.reduce((total, r) => {
                const rowPercentage = (Number(r.netConsumption) / acc.netConsumption) * 100;
                return total + (rowPercentage || 0);
              }, 0)
            : 0,
      }),
      {
        eb_present: 0,
        eb_previous: 0,
        dg_present: 0,
        dg_previous: 0,
        netConsumption: 0,
        energyCharges: 0,
        tax: 0,
        contractDemand: 0,
        demandCharges: 0,
        fcaCharges: 0,
        interOnReven: 0,
        interOnTax: 0,
        currentBillAmount: 0,
        adjustmentNetConsumption: 0,
        rawDemandChargesRsKva: 0,
        rawEnergyChargesRsKwh: 0,
        adjustedReadingKWh: 0,
        adjEnergyCharges: 0,
        adjTax: 0,
        adjCurrentBillAmount: 0,
        percentageShare: 0,
      }
    );
  };
  
  const totals = calculateTotals(tableData);
  
  return { meters, tableData, setTableData, sharedMeters, setSharedMeters, totals, loading, setLoading, tariffData, loadingTariff: tariffData.loading };
};
