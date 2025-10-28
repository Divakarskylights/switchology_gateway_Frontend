import React from "react";
import {
  Table, TableContainer, TableHead,
  TableRow, TableCell, TableBody,
  IconButton, Checkbox, Tooltip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

const tableCellStyles = {
  header: {
    fontWeight: "bold",
    fontSize: "0.69rem",
    whiteSpace: "wrap",
    padding: "3px",
    textAlign: "center",
    borderRight: "1px solid #e0e0e0"
  },
  cell: {
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    padding: "4px",
    textAlign: "right"
  },
  cellCenter: {
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    padding: "1px",
    textAlign: "center"
  },
  totalRow: {
    fontWeight: "bold",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    padding: "4px"
  },
  totalRowRight: {
    fontWeight: "bold",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    padding: "6px",
    textAlign: "right"
  },
  totalRowCenter: {
    fontWeight: "bold",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    padding: "6px",
    textAlign: "center"
  }
};

export const MeterBillTable = ({
  data,
  handleStateChange,
  onEdit,
  onDelete,
  setTableData,
  setShareDialog,
  totals,
  sharedMeters,
  state

}) => {
 //  console.log("datavdvdvdv", data);
  const gettotalNetconsumption = () => data.reduce((sum, row) => sum + row.netConsumption || 0, 0);
  const percentageShare = (row) => (row.netConsumption / gettotalNetconsumption()) * 100 || 0;
  const totalPercentageShare = data.reduce((sum, row) => sum + percentageShare(row), 0);

  const getAdjustmentNetConsumption = (row) => {
    if (row.sharedNetConsumption == 0) {
      // console.log("111111row.sharedNetConsumption", gettotalNetconsumption(), row.netConsumption, totals.netConsumption, "row.adjustmentNetConsumption", row.adjustmentNetConsumption, "percentageShare(row)", percentageShare(row));
      return Number((row.sharedNetConsumption + row.adjustmentNetConsumption) * percentageShare(row) / 100|| 0);
    } else {

      // console.log("222222state.afterSharedValue", row.adjustmentNetConsumption, row.sharedNetConsumption, state.afterSharedValue, "percentageShare(row)", percentageShare(row));
      return Number(row.adjustmentNetConsumption * percentageShare(row) / 100 || 0);
    }
  };
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num)
      ? '0.00'
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };
  

  
  
  React.useEffect(() => {
    // Only proceed if we have data
    if (!data.length) return;
    let value = data.find(item => item.netConsumption !== undefined)?.netConsumption;
    if (value) {
      handleStateChange({ showAdjNetCons: true });
    }
    if(sharedMeters.length > 0){
      handleStateChange({ afterSharedValue: data.reduce((sum, row) => sum + getAdjustmentNetConsumption(row), 0) });
    }
  }, [data]);

  const contractDemandTotal = () => {
    const value = data.find(item => item.contractDemand !== undefined)?.contractDemand;
    return Number(value) || 0;
  }
  // console.log("conte", data, sharedMeters);

  const currentBillAmount = (row) => ((row.energyCharges + row.tax + (row.demandCharges * percentageShare(row) / 100 * (row.rawPercentofCDKVA / 100)) + row.fcaCharges * percentageShare(row) / 100 + row.interOnReven * percentageShare(row) / 100 + row.interOnTax * percentageShare(row) / 100) || 0);
  const getAdjustedConsumptionkWh = (row, percentageShareFn) => {
    // if (row.sharedNetConsumption !== 0) {
    return getAdjustmentNetConsumption(row) - row.netConsumption;
    // }
    // return (row.adjustmentNetConsumption * percentageShareFn(row)) / 100 - row.netConsumption;
  };

  const getAdjustedEnergyCharges = (row, percentageShareFn) => {
    return row.adjEnergyCharges * getAdjustmentNetConsumption(row);
  };

  const getAdjustedTax = (row, percentageShareFn) => {
    const energyCharges = getAdjustedEnergyCharges(row, percentageShareFn);
    return row.adjTax * energyCharges;
  };

  const getTotalAdjustedAmount = (row, percentageShareFn) => {
    const consumption = getAdjustedConsumptionkWh(row, percentageShareFn);
    const energyCharges = getAdjustedEnergyCharges(row, percentageShareFn);
    const tax = getAdjustedTax(row, percentageShareFn);
    const demand = (row.demandCharges * percentageShareFn(row)) / 100 * (row.rawPercentofCDKVA / 100);
    const fca = (row.fcaCharges * percentageShareFn(row)) / 100;
    const interOnReven = (row.interOnReven * percentageShareFn(row)) / 100;
    const interOnTax = (row.interOnTax * percentageShareFn(row)) / 100;

    return row.adjCurrentBillAmount + energyCharges + tax + demand + fca + interOnReven + interOnTax;
  };
  const totalSharedNetConsumtion = () => data.reduce((sum, row) => sum + row.sharedNetConsumption || 0, 0)

  const totalDemandCharges = () => data.reduce((sum, row) => sum + ((row.demandCharges * percentageShare(row)) / 100) * (row.rawPercentofCDKVA / 100) || 0, 0);
  const totalCurrentBillAmount = () => data.reduce((sum, row) => sum + currentBillAmount(row), 0);
  const totalAdjustedNetConsumption = () => data.reduce((sum, row) => sum + getAdjustmentNetConsumption(row), 0);
  const totalAdjustReadingKWh = () => data.reduce((sum, row) => sum + getAdjustedConsumptionkWh(row, percentageShare), 0);
  const totalAdjustEnergyCharge = () => data.reduce((sum, row) => sum + row.adjEnergyCharges * (row.adjustmentNetConsumption * percentageShare(row) / 100) || 0, 0);
  const totalAdjustTax = () => data.reduce((sum, row) => sum + row.adjTax * Number(row.adjEnergyCharges * Number((row.adjustmentNetConsumption * percentageShare(row) / 100)) || 0) || 0, 0);

  const totalAdjustCurrentBillAmount = () => {
    return data.reduce((sum, row) => {
      return sum + getTotalAdjustedAmount(row, percentageShare);
    }, 0); // Ensure the initial sum is 0
  };
  // console.log(data, "data");

  return (
    <TableContainer>
      <Table size="small" sx={{ border: "1px solid #e0e0e0" }}>
        <TableHead>
          <TableRow>
            {[
              "Date (Mtr_Added)", "DG (Dual)", "Shared Meter", "Meter Name (Mtr_Id)",
              "Tariff",
              "Previous Readings kWh", "Present Readings kWh", "Net Consumption kWh",
              "Percentage share %", 
              // "Energy Charges", "Tax",
               
              // "Current Bill Amount",
              "Shared Net Consumption kWh", "Adjusted Net Consumption kWh",
              "Difference  kWh (Adj Cons - Net Cons)", "Energy Charges Rs. 🅐",
              "Tax Rs. 🅑", "Contract Demand kVA", "Demand Charges Rs. 🅒", "FCA Charges Rs. 🅓",
              "Inter on Reven Rs. 🅔", "Inter on Tax Rs. 🅕", "Current Bill Amount Rs.🅐+🅑+🅒+🅓+🅔+🅕", "Action"
            ].map((header) => (
              <TableCell
                key={header}
                sx={{
                  ...tableCellStyles.header,
                  minWidth: header === "Meter Name" ? "160px" : "auto",
                  whiteSpace: header === "Date (Mtr_Added)" || header === "DG (Dual)" ? "wrap" : "normal", // Prevent line break for this header
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} hover>
              <TableCell sx={tableCellStyles.cellCenter}>
                {row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "N/A"}
              </TableCell>

              <DGCheckbox row={row} i={i} state={state} handleStateChange={handleStateChange} setTableData={setTableData} tableData={data} />

              <ShareCheckbox row={row} setShareDialog={setShareDialog} />

              <TableCell sx={tableCellStyles.cellCenter}>
                {row.firstMeter}
              </TableCell>

              <TableCell sx={tableCellStyles.cellCenter}>
                {row.tariff}
              </TableCell>

              <ReadingCell
                value={row.eb_previous}
                label="EB"
                dgValue={row.dg_previous}
                hasDG={row.isDg}
              />

              <ReadingCell
                value={row.eb_present}
                label="EB"
                dgValue={row.dg_present}
                hasDG={row.isDg}
              />

              <ConsumptionCell
                netConsumption={row.netConsumption}
                dgNetConsumption={row.dg_netConsumption}
                hasDG={row.isDg}
                duplicate={row.duplicateNetConsumption}
                hideOther={row.hideOtherDatas}
              />

              <TableCell sx={tableCellStyles.cell}>
                {percentageShare(row)?.toFixed(2)}
              </TableCell>

              {/* <EnergyChargesCell
                energyCharges={row.energyCharges}
                dgCharges={row.dg_energyCharges}
                hasDG={row.isDg}
              />

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(row.tax)}
              </TableCell> */}

           
              {/* <TableCell sx={tableCellStyles.cell}>
                {formatNumber(currentBillAmount(row))}
              </TableCell> */}

              <SharedMetersTooltip
                sharedMeters={sharedMeters}
                value={row.sharedNetConsumption}
              />

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(getAdjustmentNetConsumption(row))}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(getAdjustedConsumptionkWh(row, percentageShare))}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(getAdjustedEnergyCharges(row, percentageShare))}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(getAdjustedTax(row, percentageShare))}
              </TableCell>
              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(row.contractDemand)}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber((row.demandCharges * percentageShare(row) / 100) * (row.rawPercentofCDKVA / 100))}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber((row.fcaCharges * percentageShare(row)) / 100)}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber((row.interOnReven * percentageShare(row)) / 100)}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber((row.interOnTax * percentageShare(row)) / 100)}
              </TableCell>

              <TableCell sx={tableCellStyles.cell}>
                {formatNumber(getTotalAdjustedAmount(row, percentageShare))}
              </TableCell>


              <ActionButtons
                onDelete={() => onDelete(row, i)}
                onEdit={() => onEdit(row, i)}
              />
            </TableRow>
          ))}

          <TotalsRow
            formatNumber={formatNumber}
            totals={totals}
            contractDemand={contractDemandTotal}
            totalDemandCharges={totalDemandCharges()}
            totalPercentageShare={totalPercentageShare}
            totalCurrentBillAmount={totalCurrentBillAmount()}
            totalAdjustedNetConsumption={totalAdjustedNetConsumption()}
            totalSharedNetConsumtion={totalSharedNetConsumtion()}
            totalAdjustReadingKWh={totalAdjustReadingKWh}
            totalAdjustEnergyCharge={totalAdjustEnergyCharge}
            totalAdjustTax={totalAdjustTax}
            totalAdjustCurrentBillAmount={totalAdjustCurrentBillAmount}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};


// Sub-components for MeterBillTable
const DGCheckbox = ({ row, i, state, handleStateChange, setTableData, tableData }) => (
  <TableCell sx={tableCellStyles.cellCenter}>
    <Checkbox
      checked={Boolean(row.isDg)}
      size="small"
      onChange={(e) => {
        const isChecked = e.target.checked;

        setTableData((prev) => {
          const updated = prev.map((r, index) =>
            index === i ? { ...r, isDg: isChecked } : r
          );

          // Open dialog only if at least one checkbox is checked
          if (state.dgTariff === 0 || tableData.some((r) => r.isDg)) {
            handleStateChange({ openDGTariffDialog: true });
          }

          return updated;
        });
      }}
    />
  </TableCell>
);



const ShareCheckbox = ({ row, setShareDialog }) => (
  <TableCell sx={tableCellStyles.cellCenter}>
    {row.canShared && (
      <Checkbox
        checked={Boolean(row.hideOtherDatas)}
        size="small"
        disabled={row.isDg}
        onChange={(e) => e.target.checked && setShareDialog(row)}
      />
    )}
  </TableCell>
);


const ReadingCell = ({ value, label, dgValue, hasDG }) => (
  <TableCell sx={tableCellStyles.cell}>
    <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
      <strong>{label}:</strong>
      <span>{Number(value).toFixed(2) || 0}</span>
    </div>
    {hasDG && (
      <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
        <strong>DG:</strong>
        <span>{Number(dgValue).toFixed(2) || 0}</span>
      </div>
    )}
  </TableCell>
);


const ConsumptionCell = ({ netConsumption, dgNetConsumption, hasDG, duplicate, hideOther }) => (
  <TableCell sx={tableCellStyles.cell}>
    <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
      <strong>EB:</strong>
      <span>{Number(hideOther ? duplicate : netConsumption || 0).toFixed(2)}</span>
    </div>
    {hasDG && (
      <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
        <strong>DG:</strong>
        <span>{Number(hideOther ? duplicate : dgNetConsumption || 0).toFixed(2)}</span>
      </div>
    )}
  </TableCell>
);

const EnergyChargesCell = ({ energyCharges, dgCharges, hasDG }) => (
  <TableCell sx={tableCellStyles.cell}>
    <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
      <strong>EB:</strong>
      <span>{Number(energyCharges || 0).toFixed(2)}</span>
    </div>
    {hasDG && (
      <div style={{ display: "flex", justifyContent: "space-between", paddingX: "4px" }}>
        <strong>DG:</strong>
        <span>{Number(dgCharges || 0).toFixed(2)}</span>
      </div>
    )}
  </TableCell>
);

const SharedMetersTooltip = ({ sharedMeters, value }) => {
  const content = sharedMeters.length > 0 ? (
    <div>
      <h3 style={{ textAlign: "center" }}>Shared Meters</h3>
      {sharedMeters.map((m, i) => (
        <div key={i}>
          <strong>{m.meterName}</strong>
          <li>Total: {(m.eb_netConsumption || 0).toFixed(2)}</li>
          {i !== sharedMeters.length - 1 && <hr />}
        </div>
      ))}
    </div>
  ) : (
    <div>No shared data</div>
  );
  // console.log(value, "value");
  return (
    <Tooltip title={content} arrow followCursor>
      <TableCell sx={tableCellStyles.cell}>{Number(value || 0).toFixed(2)}</TableCell>
    </Tooltip>
  );
};

const ActionButtons = ({ onDelete, onEdit }) => (
  <TableCell sx={tableCellStyles.cellCenter}>
    <IconButton size="small" onClick={onDelete}>
      <Delete fontSize="small" />
    </IconButton>
    <IconButton size="small" onClick={onEdit}>
      <Edit fontSize="small" />
    </IconButton>
  </TableCell>
);


// Sub-components remain the same as previous implementation
// [DGCheckbox, ShareCheckbox, ReadingCell, ConsumptionCell, 
// EnergyChargesCell, SharedMetersTooltip, ActionButtons, TotalsRow]
// ... (include all the sub-components from the previous implementation)

const TotalsRow = ({ totals, contractDemand, totalPercentageShare, totalCurrentBillAmount, totalAdjustedNetConsumption, totalSharedNetConsumtion, totalAdjustReadingKWh, totalAdjustEnergyCharge, totalAdjustTax, totalAdjustCurrentBillAmount, totalDemandCharges, formatNumber   }) => (
  <TableRow>
    {Array(4).fill().map((_, i) => (
      <TableCell key={i} sx={tableCellStyles.totalRow}></TableCell>
    ))}
    <TableCell sx={tableCellStyles.totalRow}>(Total)</TableCell>
    {Array(2).fill().map((_, i) => (
      <TableCell key={i + 4} sx={tableCellStyles.totalRow}></TableCell>
    ))}
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totals?.netConsumption)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalPercentageShare)}
    </TableCell>
    {/* <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totals.energyCharges)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totals.tax)}
    </TableCell> */}
   
    {/* <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalCurrentBillAmount)}
    </TableCell> */}
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalSharedNetConsumtion)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalAdjustedNetConsumption)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalAdjustReadingKWh())}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalAdjustEnergyCharge())}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalAdjustTax())}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(contractDemand())}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalDemandCharges)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber((totals?.fcaCharges * totalPercentageShare) / 100)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber((totals?.interOnReven * totalPercentageShare) / 100)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber((totals?.interOnTax * totalPercentageShare) / 100)}
    </TableCell>
    <TableCell sx={tableCellStyles.totalRowRight}>
      {formatNumber(totalAdjustCurrentBillAmount())}
    </TableCell>
    {/* <TableCell sx={tableCellStyles.totalRowCenter}></TableCell> */}
  </TableRow>
);
