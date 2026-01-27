import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ConfigItem from '../../setup/components/SetUpConfigItem';
import { getSerialPorts } from '../services/communicationApi';

const connectionTypeOptions = [
  { value: 'serial_rtu', label: 'Serial Port (RTU)' },
  { value: 'modbus_tcp', label: 'Modbus TCP/IP' },
  { value: 'modbus_udp', label: 'Modbus UDP/IP' },
];

const parityOptions = [
  { value: 'none', label: 'None' },
  { value: 'even', label: 'Even' },
  { value: 'odd', label: 'Odd' },
];

const modeOptions = [
  { value: 'rtu', label: 'RTU' },
  { value: 'ascii', label: 'ASCII' },
];

const defaultComPorts = Array.from({ length: 16 }, (_, i) => ({
  value: `COM${i + 1}`,
  label: `COM${i + 1}`,
}));

export default function ConnectionSetupCard({ value, onChange }) {
  const type = value?.type || 'serial_rtu';

  const [serialPortOptions, setSerialPortOptions] = React.useState(null);
  const [serialPortsLoading, setSerialPortsLoading] = React.useState(false);

  React.useEffect(() => {
    if (type !== 'serial_rtu') return;

    const controller = new AbortController();

    const load = async () => {
      setSerialPortsLoading(true);
      try {
        const res = await getSerialPorts({ signal: controller.signal });
        const ports = Array.isArray(res?.data?.ports) ? res.data.ports : [];
        const options = ports.map((p) => ({ value: p, label: p }));
        setSerialPortOptions(options);
      } catch {
        setSerialPortOptions([]);
      } finally {
        setSerialPortsLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [type]);

  const serialPortDropdownOptions =
    serialPortOptions && serialPortOptions.length ? serialPortOptions : defaultComPorts;

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Connection Setup
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ConfigItem
            label="Connection type"
            value={type}
            onChange={(name, v) => onChange({ ...value, type: v })}
            name="type"
            select
            options={connectionTypeOptions}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ConfigItem
            label="Mode"
            value={value?.mode || 'rtu'}
            onChange={(name, v) => onChange({ ...value, mode: v })}
            name="mode"
            select
            options={modeOptions}
          />
        </Grid>

        {type === 'serial_rtu' && (
          <>
            <Grid item xs={12} md={6}>
              <ConfigItem
                label="Serial port"
                value={value?.serial?.port || 'COM1'}
                onChange={(name, v) => onChange({ ...value, serial: { ...(value?.serial || {}), port: v } })}
                name="serial_port"
                select
                options={serialPortDropdownOptions}
                disabled={serialPortsLoading}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigItem
                label="Baud rate"
                value={value?.serial?.baudRate || 9600}
                onChange={(name, v) => onChange({ ...value, serial: { ...(value?.serial || {}), baudRate: Number(v) } })}
                name="baudRate"
                select
                options={[
                  { value: 1200, label: '1200' },
                  { value: 2400, label: '2400' },
                  { value: 4800, label: '4800' },
                  { value: 9600, label: '9600' },
                  { value: 19200, label: '19200' },
                  { value: 38400, label: '38400' },
                  { value: 57600, label: '57600' },
                  { value: 115200, label: '115200' },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ConfigItem
                label="Data bits"
                value={value?.serial?.dataBits || 8}
                onChange={(name, v) => onChange({ ...value, serial: { ...(value?.serial || {}), dataBits: Number(v) } })}
                name="dataBits"
                select
                options={[
                  { value: 7, label: '7' },
                  { value: 8, label: '8' },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ConfigItem
                label="Stop bits"
                value={value?.serial?.stopBits || 1}
                onChange={(name, v) => onChange({ ...value, serial: { ...(value?.serial || {}), stopBits: Number(v) } })}
                name="stopBits"
                select
                options={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ConfigItem
                label="Parity"
                value={value?.serial?.parity || 'even'}
                onChange={(name, v) => onChange({ ...value, serial: { ...(value?.serial || {}), parity: v } })}
                name="parity"
                select
                options={parityOptions}
              />
            </Grid>
          </>
        )}

        {(type === 'modbus_tcp' || type === 'modbus_udp') && (
          <>
            <Grid item xs={12} md={6}>
              <ConfigItem
                label="Remote IP"
                value={value?.network?.host || '127.0.0.1'}
                onChange={(name, v) => onChange({ ...value, network: { ...(value?.network || {}), host: v } })}
                name="host"
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <ConfigItem
                label="Port"
                value={value?.network?.port || 502}
                onChange={(name, v) => onChange({ ...value, network: { ...(value?.network || {}), port: Number(v) } })}
                name="port"
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <ConfigItem
                label="Timeout (ms)"
                value={value?.network?.timeoutMs || 3000}
                onChange={(name, v) => onChange({ ...value, network: { ...(value?.network || {}), timeoutMs: Number(v) } })}
                name="timeoutMs"
                type="number"
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 1 }} />
    </Paper>
  );
}
