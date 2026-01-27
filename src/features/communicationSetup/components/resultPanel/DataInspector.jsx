import React from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function DataInspector({
  open,
  rows,
  label,
  pos,
  onHeaderMouseDown,
  onClose,
  blockKind,
}) {
  if (!open || !rows?.length) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        width: 360,
        maxHeight: '70vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 6,
        border: '1px solid',
        borderColor: 'divider',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: 'grey.100',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
        onMouseDown={onHeaderMouseDown}
      >
        <Typography variant="subtitle2">{label}</Typography>
        <Button size="small" onClick={onClose}>
          Close
        </Button>
      </Box>
      <Box sx={{ p: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Raw</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.address}-${row.type || 'decoded'}-${idx}`}>
                <TableCell>{row.name || `#${idx}`}</TableCell>
                <TableCell>{Array.isArray(row.raw) ? row.raw.join(', ') : ''}</TableCell>
                <TableCell>{row.value === null || row.value === undefined ? '' : String(row.value)}</TableCell>
                <TableCell>{row.type || blockKind || 'n/a'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
