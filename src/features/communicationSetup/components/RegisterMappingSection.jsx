import React from 'react';
import { Grid } from '@mui/material';
import RegisterMappingTable from './RegisterMappingTable';
import ResultPanel from './ResultPanel';

export default function RegisterMappingSection({
  valueType,
  mappings,
  onMappingsChange,
  result,
  requestContext,
  loading,
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {valueType === 'custom' ? (
          <RegisterMappingTable mappings={mappings} disabled={false} onChange={onMappingsChange} />
        ) : null}
      </Grid>

      <Grid item xs={12}>
        <ResultPanel
          result={result}
          valueType={valueType}
          mappings={mappings}
          requestContext={requestContext}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
}