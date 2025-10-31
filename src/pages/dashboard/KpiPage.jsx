import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Checkbox, Menu } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { graphqlClient } from '../../services/client';
import { INSERT_KPI, GET_KPI_DATA, DELETE_KPI_BY_COMBINE_ID, DELETE_KPI_BY_UID } from '../../services/query';
import { toast } from 'react-toastify';


const KpiPage = () => {
  // console.log("KpiPage component loaded");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fields, setFields] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogParameters, setDialogParameters] = useState([{ parameter: '', value: '', unit: '' }]);
  const [unitInfoOpen, setUnitInfoOpen] = useState(false);
  const [kpiData, setKpiData] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRowIdx, setMenuRowIdx] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewRowData, setViewRowData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRowData, setDeleteRowData] = useState(null);
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [deleteParamsDialogOpen, setDeleteParamsDialogOpen] = useState(false);
  const [selectedParamsToDelete, setSelectedParamsToDelete] = useState([]);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const textfieldStyle = {
    '& .MuiInputBase-root': {
      height: 28,
      fontSize: 12,
      minHeight: 0,
    },
    '& .MuiInputBase-input': {
      py: 0.2,
      fontSize: 12,
    },
  };
  // Handle changes for fields
  const handleFieldChange = (idx, key, value) => {
    setFields(prevFields =>
      prevFields.map((item, index) =>
        index === idx ? { ...item, [key]: value } : item
      )
    );
  };

  // Handle dialog parameter changes
  const handleDialogParameterChange = (idx, key, value) => {
    setDialogParameters(prevParams =>
      prevParams.map((param, index) =>
        index === idx ? { ...param, [key]: value } : param
      )
    );
  };

  // Add new parameter to dialog
  const addDialogParameter = () => {
    if (dialogParameters.length < 10) {
      setDialogParameters(prev => [...prev, { parameter: '', value: '', unit: '' }]);
    }
  };

  // Remove parameter from dialog
  const removeDialogParameter = (idx) => {
    if (dialogParameters.length > 1) {
      setDialogParameters(prev => prev.filter((_, index) => index !== idx));
    }
  };



// Unit options for dropdown
const unitOptions = [
  'Nos (Numbers)',
  'Sets',
  'Pieces',
  'Litres (L)',
  'Millilitres (mL)',
  'Cubic meters (m³)',
  'Kilograms (kg)',
  'Grams (g)',
  'Tons (t)',
  'Kilowatt-hour (kWh)',
  'Megajoules (MJ)',
  'British Thermal Unit (BTU)',
  'Square meters (m²)',
  'Square feet (ft²)',
  'Hours (h)',
  'Minutes (min)',
  'Seconds (s)',
  'Pallets',
  'Batches',
  'Cycles',
  'Barrels (bbl)',
  'Gallons (gal)',
  'Cubic feet (cf)',
  'Pieces per hour (P/hr)',
  'Units per shift',
  'Kilograms per hour (kg/h)'
];

// Unit info for dialog table
const unitInfo = [
  { unit: 'Nos (Numbers)', desc: 'Count of individual items', notes: 'Discrete units, e.g., devices, products, parts' },
  { unit: 'Sets', desc: 'Grouped items or assemblies', notes: 'Furniture sets, equipment sets' },
  { unit: 'Pieces', desc: 'Individual components or small units', notes: 'Manufacturing parts, office supplies' },
  { unit: 'Litres (L)', desc: 'Volume of liquids', notes: 'Water, chemicals, fuel, beverages' },
  { unit: 'Millilitres (mL)', desc: 'Smaller volume units', notes: 'Lab chemicals, oils' },
  { unit: 'Cubic meters (m³)', desc: 'Larger volume units', notes: 'Bulk liquids, gases, wood stacks (stere)' },
  { unit: 'Kilograms (kg)', desc: 'Weight or mass', notes: 'Raw materials, bulk goods' },
  { unit: 'Grams (g)', desc: 'Smaller weight units', notes: 'Ingredients, powders' },
  { unit: 'Tons (t)', desc: 'Large weight units', notes: 'Coal, minerals, industrial bulk materials' },
  { unit: 'Kilowatt-hour (kWh)', desc: 'Energy consumption or production', notes: 'Electricity usage or generation' },
  { unit: 'Megajoules (MJ)', desc: 'Energy measurement', notes: 'Industrial energy, fuels' },
  { unit: 'British Thermal Unit (BTU)', desc: 'Energy measurement', notes: 'Heating, cooling, fuel energy' },
  { unit: 'Square meters (m²)', desc: 'Area measurement', notes: 'Floor space, production area' },
  { unit: 'Square feet (ft²)', desc: 'Area measurement', notes: 'Office, commercial space' },
  { unit: 'Hours (h)', desc: 'Time duration', notes: 'Production time, machine run time' },
  { unit: 'Minutes (min)', desc: 'Smaller time units', notes: 'Cycle times, process durations' },
  { unit: 'Seconds (s)', desc: 'Precise time measurement', notes: 'High-frequency process timing' },
  { unit: 'Pallets', desc: 'Unit load for transport/storage', notes: 'Industrial logistics, warehousing' },
  { unit: 'Batches', desc: 'Grouped production lots', notes: 'Chemical batches, food production batches' },
  { unit: 'Cycles', desc: 'Repetitive process counts', notes: 'Machine cycles, production cycles' },
  { unit: 'Barrels (bbl)', desc: 'Volume for petroleum products', notes: 'Oil industry volume measurement (1 barrel ≈ 159 litres)' },
  { unit: 'Gallons (gal)', desc: 'Volume (imperial/US)', notes: 'Fuel, liquids' },
  { unit: 'Cubic feet (cf)', desc: 'Volume (imperial)', notes: 'Gas volumes, wood volume' },
  { unit: 'Pieces per hour (P/hr)', desc: 'Production rate', notes: 'Manufacturing throughput' },
  { unit: 'Units per shift', desc: 'Production quantity per work shift', notes: 'Factory production KPIs' },
  { unit: 'Kilograms per hour (kg/h)', desc: 'Production mass flow rate', notes: 'Continuous process industries' },
];

// Add this function near the top-level of the component or outside
async function deleteKpiRow(combineId) {
  if (!combineId) throw new Error('combineId is required!');
  console.log("combineId:", combineId);

  try {
    const data = await graphqlClient.request(DELETE_KPI_BY_COMBINE_ID, { combineId });

    console.log("deleteKpiByCombineId response:", data);

    if (!data?.deleteFromKpiTable?.deletedKpis?.length) {
      throw new Error('No KPI rows found for this combine_id');
    }

    toast.success('KPI deleted successfully!');
    return data.deleteFromKpiTable.deletedKpis;
  } catch (error) {
    console.error('Delete KPI error:', error.response?.errors || error);
    toast.error(`Failed to delete KPI: ${error.message}`);
    throw error;
  }
}


// Add this function near the top-level of the component or outside
async function deleteField(uid) {
  console.log('Deleting KPI by uid:', uid);
  try {
    const data = await graphqlClient.request(DELETE_KPI_BY_UID, { 
      input: { 
        uid: uid
      } 
    });
    console.log('Delete KPI by uid response:', data);
    toast.success('KPI deleted successfully!');
    if (!data?.deleteKpiByUid?.kpi) {
      throw new Error('Failed to delete KPI by uid');
    }
    return data;
  } catch (error) {
    console.error('Delete KPI by uid error:', error);
    toast.error(`Failed to delete KPI by uid: ${error.message}`);
    throw error;
  }
}


  // Fetch KPI data
  const fetchData = async () => {
    try {
      const result = await graphqlClient.request(GET_KPI_DATA);
      console.log("Fetched KPI data:", result.allKpis.nodes);

      if (result?.allKpis) {
        const data = result.allKpis.nodes || [];

        if (data.length > 0) {
          // Extract unique parameter names and their units from KPI data where added: true (parameter definitions)
          const addedParameters = data.filter(item => item.added === true);
          // Map: parameter name -> unit
          const paramUnitMap = {};
          addedParameters.forEach(item => {
            paramUnitMap[item.parameters] = item.units;
          });
          const uniqueParameters = [...new Set(addedParameters.map(item => item.parameters))];
          // Create field objects for each unique parameter, including unit
          const uniqueFields = uniqueParameters.map(parameter => ({
            parameter,
            unit: paramUnitMap[parameter] || '',
            value: '' // always initialize value
          }));

          // Find latest value for each parameter
          const latestValues = {};
          data.filter(item => item.added === false).forEach(item => {
            if (!latestValues[item.parameters] || new Date(item.created_date) > new Date(latestValues[item.parameters].created_date)) {
              latestValues[item.parameters] = item;
            }
          });
          const uniqueFieldsWithValues = uniqueFields.map(field => ({
            ...field,
            value: latestValues[field.parameter]?.values || ''
          }));

          setKpiData(data);
          setFields(uniqueFieldsWithValues);
        } else {
          setKpiData([]);
          setFields([]); // No fields if no data
        }
      } else {
        setKpiData([]);
        setFields([]); // No fields if no data
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      setKpiData([]);
      setFields([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle dialog submit
  const handleDialogSubmit = async () => {
    console.log("dialogParameters", dialogParameters);
    const validParameters = dialogParameters.filter(param =>
      param.parameter.trim() !== '' && param.unit.trim() !== ''
    );

    if (validParameters.length > 0) {
      console.log("validParameters", validParameters);

      // Call createKPI with the fieldsData - this is adding parameters, so set added: true
      try {
        await createKPI(validParameters, {}, null, true);
        setDialogOpen(false);
        setDialogParameters([{ parameter: '', value: '', unit: '' }]);
        fetchData();
      } catch (error) {
        toast.error('Failed to save KPI data.');
        console.error('Error saving KPI data:', error);
      }
    } else {
      toast.error('Please fill in at least one parameter completely');
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogParameters([{ parameter: '', value: '', unit: '' }]);
  };

  // GraphQL function to create KPI
  async function createKPI(validParameters, tags = {}, timestamp = null, isAddingParameter = false) {
    try {
      for (const param of validParameters) {
        const numericValue = param.value && !isNaN(parseFloat(param.value))
          ? parseFloat(param.value)
          : 0;
        const data = await graphqlClient.request(INSERT_KPI, {
          input: {
            kpi: {
              values: numericValue,
              parameters: param.parameter,
              units: param.unit,
              added: isAddingParameter,
              createdDate: param.created_date || null,
              combineId: param.combine_id || null
            }
          }
        });
        if (data?.createKpi?.kpi) {
          // Success
        } else {
          throw new Error('No rows affected during KPI insertion');
        }
      }
      toast.success('KPI data written successfully!');
    } catch (error) {
      console.error('GraphQL KPI insertion error:', error);
      toast.error('Error: ' + (error.message || 'Failed to insert KPI data'));
      throw error;
    }
  }



 const handleSubmit = async () => {
  console.log("fields", fields);

  const validParameters = fields
    .filter(
      param =>
        param &&
        typeof param.parameter === 'string' &&
        param.parameter.trim() !== '' &&
        param.value !== undefined &&
        param.value !== null &&
        String(param.value).trim() !== ''
    )
    .map(param => ({ ...param }));

  if (validParameters.length > 0) {
    try {
      const fromISO = fromDate ? new Date(fromDate).toISOString() : null;
      const toISO = toDate ? new Date(toDate).toISOString() : null;

      // ✅ generate unique combineId per parameter
      const allRows = validParameters.flatMap(param => {
        const combineId =
          (window.crypto && window.crypto.randomUUID)
            ? window.crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return [
          { ...param, created_date: fromISO, combine_id: combineId },
          { ...param, created_date: toISO, combine_id: combineId }
        ];
      });

      console.log("Prepared rows:", allRows);

      await createKPI(allRows, {}, null, false);
      fetchData();
      setFields(prevFields => prevFields.map(f => ({ ...f, value: '' })));
      setFieldsDisabled(true);
      setFromDate('');
      setToDate('');
    } catch (error) {
      toast.error('Failed to save KPI data.');
      console.error('Error saving KPI data:', error);
    }
  } else {
    toast.error('Please fill in at least one parameter completely');
  }
};

  // Find all unique parameter names from KPI data
  const paramKeys = Array.from(
    new Set(
      kpiData.map(row => row.parameters).filter(Boolean)
    )
  );

  // MoreVert menu handlers
  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRowIdx(idx);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRowIdx(null);
  };

  // Menu actions (implement as needed)
  const handleView = () => {
    if (menuRowIdx !== null && mergedKpiData[menuRowIdx]) {
      setViewRowData(mergedKpiData[menuRowIdx]);
      setViewDialogOpen(true);
    }
    handleMenuClose();
  };


  const handleDelete = (row) => {
    console.log("row",row);
    
    setDeleteDialogOpen(true);  // Filter KPI data by date range

    setDeleteRowData(row);
    handleMenuClose();
  };


  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setViewRowData(null);
  };
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteRowData(null);
  };
  const handleDeleteConfirm = async (row) => {
    if (!row.uid) {
      toast.error('Cannot delete: UID is required for deletion.');
      handleDeleteDialogClose();
      return;
    }
    try {
      // Row from merged view contains comma-separated UIDs; delete each
      const uids = String(row.uid)
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

      for (const uid of uids) {
        await deleteField(uid);
      }

      fetchData();
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Failed to delete KPI row(s):', error);
      toast.error('Failed to delete KPI row(s).');
    }
  };

  const isDialogSubmitDisabled = dialogParameters.some(
    param =>
      !param.parameter.trim() ||
      !param.unit.trim()
  );

  function getDurationValue(fromDate, toDate, unit) {
    if (!fromDate || !toDate) return '';
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffMs = to - from;
    if (diffMs <= 0) return '';
    if (unit === 'minutes') return Math.floor(diffMs / (1000 * 60));
    if (unit === 'hours') return Math.floor(diffMs / (1000 * 60 * 60));
    if (unit === 'days') return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return '';
  }
  const durationValue = getDurationValue(fromDate, toDate, durationUnit);

  const openDeleteParamsDialog = () => {
    setSelectedParamsToDelete([]);
    setDeleteParamsDialogOpen(true);
  };
  const closeDeleteParamsDialog = () => {
    setDeleteParamsDialogOpen(false);
    setSelectedParamsToDelete([]);
  };
  const handleParamCheckboxChange = (param) => {
    setSelectedParamsToDelete(prev =>
      prev.includes(param)
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };
  const handleDeleteParamsConfirm = async () => {
    try {
      // Delete each selected parameter
      console.log("delete");
      
      for (const paramName of selectedParamsToDelete) {
        // Find all KPI rows with this parameter
        const uidsToDelete = kpiData
          .filter(item => item.parameters === paramName)
          .map(item => item.uid);

        for (const uid of uidsToDelete) {
          await deleteField(uid);
        }
      }
      // Remove deleted fields from UI immediately
      setFields(prevFields => prevFields.filter(f => !selectedParamsToDelete.includes(f.parameter)));
      fetchData();
      toast.success('Fields deleted successfully!');
      closeDeleteParamsDialog();
    } catch (error) {
      console.log('Error deleting fields:', error);
      toast.error('Failed to delete one or more fields.');
    }
  };

  // Reset fieldsDisabled when fromDate or toDate changes
  useEffect(() => {
    if (fromDate && toDate) {
      setFieldsDisabled(false);
    }
  }, [fromDate, toDate]);

  // Merge KPI rows when combineId is same
const mergedKpiDataMap = {};

kpiData
  .filter(row => row.added === false) // Only merge "non-added" rows
  .forEach(row => {
    const key = row.combineId || row.uid; // fallback if combineId missing

    if (!mergedKpiDataMap[key]) {
      mergedKpiDataMap[key] = {
        ...row,
        uids: [row.uid],
        values: [row.values],
        createdDates: [row.createdDate],
      };
    } else {
      mergedKpiDataMap[key].uids.push(row.uid);
      mergedKpiDataMap[key].values.push(row.values);
      mergedKpiDataMap[key].createdDates.push(row.createdDate);
    }
  });

// Format merged result
const mergedKpiData = Object.values(mergedKpiDataMap).map(group => {
  // Sort created dates
  const validDates = group.createdDates.filter(Boolean).map(d => new Date(d));
  const sortedDates = validDates.sort((a, b) => a - b);

  // Build from–to range string
  let createdDateDisplay = '-';
  if (sortedDates.length > 0) {
    const from = sortedDates[0].toLocaleString();
    const to = sortedDates[sortedDates.length - 1].toLocaleString();
    createdDateDisplay = from === to ? from : `${from} — ${to}`;
  }

  // Merge value display
  let valueDisplay = '-';
  if (group.values?.length > 0) {
    const allSame = group.values.every(v => v === group.values[0]);
    valueDisplay = allSame ? group.values[0] : group.values.join(', ');
  }

  return {
    combineId: group.combineId,
    parameters: group.parameters,
    units: group.units,
    updatedDate: group.updatedDate,
    uid: group.uids.join(', '),
    values: valueDisplay,
    createdDateDisplay,
  };
});

// Also include rows where added === true (unmerged ones)
const finalKpiData = [
  ...mergedKpiData,
  ...kpiData.filter(row => row.added === true),
];

console.log("✅ Final KPI Data:", finalKpiData);

  

  return (
    <Box sx={{ p: { xs: 1, sm: 1 } }}>


      <Paper elevation={3} sx={{ p: { xs: 0.5, sm: 1 }, borderRadius: 2, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>Key Performance Indicators</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setDialogOpen(true); setFromDate(''); setToDate(''); }}
              sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.85rem' }}
            >
              Add Parameter
            </Button>

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              size='small'
              sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.85rem' }}
              onClick={openDeleteParamsDialog}
              disabled={fields.length === 0}
            >
              Delete Parameters
            </Button>
          </Box>
        </Box>
        {/* Date Range */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>From:</Typography>
            <TextField
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              size="extraSmall"
              sx={textfieldStyle}
              inputProps={{
                max: new Date().toISOString().slice(0, 16), // Prevent future dates
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>To:</Typography>
            <TextField
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              size="extraSmall"
              sx={textfieldStyle}
              inputProps={{
                max: new Date().toISOString().slice(0, 16), // Prevent future dates
              }}
            />
          </Box>
        </Box>

        {/* Duration */}
        {fromDate && toDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography sx={{ fontWeight: 'bold', minWidth: 70, fontSize: '0.95rem' }}>Duration</Typography>
            <TextField
              value={durationValue}
              InputProps={{ readOnly: true }}
              size="small"
              sx={textfieldStyle}
            />
            <Select
              value={durationUnit}
              onChange={e => setDurationUnit(e.target.value)}
              size="small"
              sx={textfieldStyle}
            >
              <MenuItem value="minutes">Minutes</MenuItem>
              <MenuItem value="hours">Hours</MenuItem>
              <MenuItem value="days">Days</MenuItem>
            </Select>
          </Box>
        )}



        {/* Show all fields using map */}
        <Box sx={{ position: 'relative' }}>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', opacity: fromDate && toDate ? 1 : 0.5 }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow sx={{ height: 26, '& th, & td': { py: 0.25 } }}>
                  <TableCell align="center" sx={{ fontWeight: 'bold', py: 0.25 }}>Parameters</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', py: 0.25 }}>Values</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', py: 0.25 }}>Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                
                {fields
                  .filter(field => field.parameter !== 'from_date' && field.parameter !== 'to_date')
                  .map((field, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">
                        <TextField
                          type="text"
                          value={field.parameter}
                          onChange={(e) => handleFieldChange(idx, 'parameter', e.target.value)}
                          size="small"
                          fullWidth
                          disabled={true}
                          sx={{
                            ...textfieldStyle,
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // For Chrome
                            },
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <TextField
                          type="text"
                          inputMode="decimal"
                          value={field.value}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(',', '.');
                            // Only allow valid decimal input
                            if (/^\d*\.?\d*$/.test(rawValue)) {
                              handleFieldChange(idx, 'value', rawValue);
                            }
                          }}
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '.'];
                            // Allow Ctrl/Cmd + A/C/V/X (copy-paste/select)
                            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                              return;
                            }
                            if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                              e.preventDefault(); // block everything else
                            }
                            // Prevent multiple dots
                            if (e.key === '.' && e.currentTarget.value.includes('.')) {
                              e.preventDefault();
                            }
                          }}
                          size="small"
                          disabled={!fromDate || !toDate || fieldsDisabled}
                          sx={textfieldStyle}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="text"
                          value={field.unit || ''}
                          size="small"
                          fullWidth
                          disabled={true}
                          sx={{
                            ...textfieldStyle,
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black',
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {(!fromDate || !toDate) && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(255,255,255,0.6)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'all',
              borderRadius: 2
            }}>

            </Box>
          )}
        </Box>

        {/* Submit  Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
          <Button
            variant="contained"
            size='small'
            onClick={handleSubmit}
            disabled={!fromDate || !toDate || fromDate === toDate || fieldsDisabled}
          >
            Submit
          </Button>

        </Box>
      </Paper>

      {/* Add Parameter Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle align="center">Add KPI Parameters</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Parameter Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {dialogParameters.map((param, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <TextField
                      value={param.parameter}
                      onChange={(e) => {
                        // Convert input to uppercase
                        const inputValue = e.target.value.toUpperCase();

                        // Check if parameter already exists in current KPI data
                        const existingParameters = kpiData.map(row => row.parameters).filter(Boolean);
                        if (existingParameters.includes(inputValue)) {
                          toast.error("Cannot add parameter name that already exists")
                          // alert('Cannot add parameter name that already exists');
                          return;
                        }

                        console.log('Changing parameter:', inputValue);
                        handleDialogParameterChange(idx, 'parameter', inputValue);
                      }}
                      size="small"
                      sx={{ ...textfieldStyle, minWidth: 300 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={param.unit}
                      onChange={(e) => handleDialogParameterChange(idx, 'unit', e.target.value)}
                      size="small"
                      displayEmpty
                      fullWidth
                      sx={{ ...textfieldStyle, minWidth: 100 }}
                    >
                      <MenuItem value=""><em>Select Unit</em></MenuItem>
                      {unitOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeDialogParameter(idx)}
                      disabled={dialogParameters.length === 1}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>


          {dialogParameters.length < 10 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDialogParameter}
              size='small'
              sx={{ alignSelf: 'flex-start', mt: 2 }}
            >
              Add Parameter
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleDialogClose} variant="contained" size='small' color="info">Cancel</Button>
          <Button
            onClick={handleDialogSubmit}
            variant="contained"
            size="small"
            disabled={isDialogSubmitDisabled}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unit Info Dialog */}
      <Dialog open={unitInfoOpen} onClose={() => setUnitInfoOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Unit of Measure (UoM) Information</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description / Usage Example</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Notes / Typical Industry Application</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unitInfo.map((row) => (
                <TableRow key={row.unit} sx={{ '& td': { py: 0.25 } }}>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.unit}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.desc}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* KPI Data Table (bottom) */}
      <Paper elevation={1} sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', ml: 1, pt: 1 }}>All KPI Data</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Sl. No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Parameter</TableCell> {/* Max width */}
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Created Date (From - To)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Updated Date</TableCell>
                <TableCell /> {/* MoreVert column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {mergedKpiData.length > 0 ? (
                mergedKpiData.map((row, idx) => (
                  <TableRow key={idx} sx={{ height: 0 }}>
                    <TableCell sx={{ py: 0.1, whiteSpace: 'nowrap', fontSize: '10px' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ py: 0.1, width: '30%', fontSize: '10px' }}>{row.parameters || '-'}</TableCell>
                    <TableCell sx={{ py: 0.1, whiteSpace: 'nowrap', fontSize: '10px' }}>{row.values || '-'}</TableCell>
                    <TableCell sx={{ py: 0.1, whiteSpace: 'nowrap', fontSize: '10px' }}>{row.units || '-'}</TableCell>
                    <TableCell sx={{ py: 0.1, whiteSpace: 'nowrap', fontSize: '10px' }}>{row.createdDateDisplay}</TableCell>
                    <TableCell sx={{ py: 0.1, whiteSpace: 'nowrap', fontSize: '10px' }}>
                      {row.updated_date ? new Date(row.updated_date).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5 }} >
                      <IconButton
                        onClick={e => handleMenuOpen(e, idx)}
                        aria-label="more options"
                        size="small"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchorEl}
                        open={menuRowIdx === idx}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={handleView}>View</MenuItem>
                        <MenuItem onClick={() => handleDelete(row)}>Delete</MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">No KPI data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* )} */}
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleViewDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>KPI Row Details</DialogTitle>
        <DialogContent>
          {viewRowData && (
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Parameter</TableCell>
                  <TableCell>{viewRowData.parameters || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Value</TableCell>
                  <TableCell>{viewRowData.values || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Unit</TableCell>
                  <TableCell>{viewRowData.units || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Created Date</TableCell>
                  <TableCell>{viewRowData.createdDateDisplay || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Updated Date</TableCell>
                  <TableCell>{viewRowData.updated_date ? new Date(viewRowData.updated_date).toLocaleString() : '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose} variant="contained" size='small'>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete?</Typography>
        </DialogContent>
        <DialogActions>

          <Button onClick={handleDeleteDialogClose} variant="contained" size="small" color="info">Cancel</Button>
          <Button onClick={() => handleDeleteConfirm(deleteRowData)} variant="contained" color="error" size="small">Delete</Button>

        </DialogActions>
      </Dialog>
      {/* Delete Parameters Dialog */}
      <Dialog open={deleteParamsDialogOpen} onClose={closeDeleteParamsDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1, px: 1 }}>Delete Parameters</DialogTitle>
        <DialogContent sx={{ py: 0, px: 1 }}>
          <Typography >Select parameters to delete:</Typography>
          <Stack spacing={0}>
            {fields.filter(f => f.parameter !== 'from_date' && f.parameter !== 'to_date' && f.parameter !== 'created_by' && f.parameter !== 'time').map((f, idx) => (
              <Box
                key={f.parameter}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 10, // reduce row height
                  py: 0, // remove vertical padding
                }}
              >
                <Checkbox
                  size="small"
                  checked={selectedParamsToDelete.includes(f.parameter)}
                  onChange={() => handleParamCheckboxChange(f.parameter)}
                  sx={{ my: 0 }}
                />
                <Typography sx={{ fontSize: '0.95rem', my: 0 }}>{f.parameter}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteParamsDialog} variant="contained" size="small" color="info">Cancel</Button>
          <Button
            onClick={handleDeleteParamsConfirm}
            variant="contained"
            color="error"
            size="small"
            disabled={selectedParamsToDelete.length === 0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KpiPage;