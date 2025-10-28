import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, Fade } from '@mui/material';
import Editor from '@monaco-editor/react';
import { graphqlClient } from '../../../services/client';
import { GET_ALL_GENERATED_JSON_DATA, INSERT_JSON_DATA, UPDATE_JSON_DATA } from '../../../services/query';
import { toast } from 'react-toastify';
import { configInit } from '../../../components/layout/globalvariable';


// Insert meter JSON data into the database and backend file
export const insertMeterJsonData = async (defaultJsonConfig, meterno, meterJsonData, getMeterName) => {
  console.log("defaultJsonConfig", defaultJsonConfig);
  try {
    // Fetch all generated_json_data and filter by meterId to get nodeId
    const allJsonData = await graphqlClient.request(GET_ALL_GENERATED_JSON_DATA );
    const meterRecord = allJsonData?.allGeneratedJsonData?.nodes?.find(
      node => node.meterId === String(meterno)
    );
    const nodeId = meterRecord ? meterRecord.nodeId : null; // <- Correct field
    console.log("Found nodeId for meterId", meterno, nodeId);
    // If needed, you can fetch a specific record using nodeId
    let response;
    if (defaultJsonConfig && Object.keys(defaultJsonConfig).length > 0 && !nodeId) {
      response = await graphqlClient.request(INSERT_JSON_DATA, {
        input: {
          generatedJsonDatum: {
            meterId: String(meterno),
            jsonData: JSON.stringify(meterJsonData),
            dateAndTime: new Date().toISOString()
          }
        }
      });
    } else {
      const variables = {
        input: {
          generatedJsonDatumPatch: {
            meterId: String(meterno),
            jsonData: JSON.stringify(meterJsonData), // NOT stringified!
          },
          nodeId: nodeId, // from `generatedJsonDatumById`
        }
      };
      
      response = await graphqlClient.request(UPDATE_JSON_DATA, variables);
      console.log("dvdjnvd", response )
    }
    if (response?.createGeneratedJsonDatum?.generatedJsonDatum || response?.updateGeneratedJsonDatum?.generatedJsonDatum) {
      try {
        const response = await fetch(`${configInit.appBaseUrl}/v2/api/save-json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meter_id: getMeterName,
            operation: 'write',
            json_data: meterJsonData
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save JSON file for ${getMeterName}`);
        }
        const result = await response.json();
        console.log("cdvdvd", result);
      } catch (fileError) {
        // Optionally handle file error
      }
    }else{
      toast.error("Something Went Wrong ")
    }
  } catch (error) {
    console.error("Error inserting meter JSON data:", error);
    throw error;
  }
};

const MeterJsonEditorDialog = ({ open, onClose, defaultJsonConfig, jsonError, jsonString, onEditorChange, onEditorMount,
  onSave, saveDisabled, getMeterName }) => (
  <Dialog open={open} fullWidth maxWidth="lg" TransitionComponent={Fade}>
    <DialogTitle sx={{ textAlign: 'center', p: 1 }}>
      <span style={{ fontWeight: 'lighter' }}>Dashboard Configuration for </span>
      <span style={{ fontWeight: 'bold' }}>{getMeterName}</span>
    </DialogTitle>
    <DialogContent dividers sx={{ p: 0 }}>
      {jsonError && (
        <Box
          sx={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            backgroundColor: 'background.paper', boxShadow: 3,
            border: '1px solid', borderRadius: 1, px: 1,
          }}
        >
          <Typography color="error" variant="subtitle2" fontWeight="bold">
            JSON Error
          </Typography>
          <Typography variant="caption" color="error">
            {jsonError}
          </Typography>
        </Box>
      )}

      <Box sx={{
        border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1,
        backgroundColor: 'background.paper', minHeight: 400
      }}>
        <Editor
          height="60vh"
          defaultLanguage="json"
          value={jsonString}
          onChange={onEditorChange}
          theme="vs"
          beforeMount={(monaco) => {
            // Configure Monaco Editor before mounting
            monaco.editor.defineTheme('vs', {
              base: 'vs',
              inherit: true,
              rules: [],
              colors: {}
            });
          }}
          options={{
            minimap: { enabled: true, showSlider: true },
            fontSize: 13,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: true,
            wordWrap: 'on',
            readOnly: false,
            lineNumbers: 'on',
            renderValidationDecorations: 'on',
          }}
          onMount={onEditorMount}
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} size="small" color="secondary" variant="outlined">Cancel</Button>
      <Button variant="contained" color="primary" size="small"
        sx={{ mr: 1 }}
        disabled={saveDisabled}
        onClick={onSave}
      >
        {defaultJsonConfig == null ? 'Update' : 'Add'} Dashboard
      </Button>
    </DialogActions>
  </Dialog>
);

export default MeterJsonEditorDialog;
