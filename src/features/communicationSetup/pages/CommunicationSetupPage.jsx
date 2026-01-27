import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { toast } from "react-toastify";
import HeaderBar from "../components/HeaderBar";
import RegisterMappingSection from "../components/RegisterMappingSection";
import MeterDeviceAndConnection from "../components/MeterDeviceAndConnection";
import ConfigItem from "../../setup/components/SetUpConfigItem";
import {
  getCommunicationApiBaseUrl,
  getMeterDetails,
  getMeterMakes,
  getMeterModels,
  getMeterSummary,
  getSerialPorts,
  readMeterRegisters,
  readWriteOnce,
  testCommunicationConnection,
  createMeterRegistersBulk,
  getMeterRegisters,
} from "../services/communicationApi";
import BulkTogglePanel from "../components/BulkTogglePanel";
import PresetSummaryPanel from "../components/PresetSummaryPanel";
import ManualDefinitionForm from "../components/ManualDefinitionForm";
import {
  STORAGE_KEY,
  connectionTypeOptions,
  modeOptions,
  parityOptions,
  functionOptions,
  valueTypeOptions,
  defaultComPorts,
  defaultState,
} from "../constants/communicationDefaults";

import {
  getOptionText,
  sanitizeSummaryBlocks,
  areBlocksEqual,
  findSummaryModbus,
  withSelectedMappingsOnly,
} from "../utils/communicationUtils";

const freeSoloFilter = createFilterOptions();

export default function CommunicationSetupPage() {
  const [state, setState] = React.useState(defaultState);
  const [testing, setTesting] = React.useState(false);
  const [reading, setReading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [meterMakes, setMeterMakes] = React.useState([]);
  const [meterModels, setMeterModels] = React.useState([]);
  const [meterLoading, setMeterLoading] = React.useState({
    makes: false,
    models: false,
    details: false,
  });
  const [meterError, setMeterError] = React.useState("");
  const [serialPortOptions, setSerialPortOptions] = React.useState(null);
  const [serialPortsLoading, setSerialPortsLoading] = React.useState(false);
  const [meterSummary, setMeterSummary] = React.useState(null);
  const [meterSummaryLoading, setMeterSummaryLoading] = React.useState(false);
  const [meterSummaryError, setMeterSummaryError] = React.useState("");
  const [slaveIdExists, setSlaveIdExists] = React.useState(false);
  const connectionType = state?.connection?.type || "serial_rtu";
  const currentMake = state?.meter?.make || "";
  const currentModel = state?.meter?.model || "";

  const meterMakeOptions = React.useMemo(
    () => (meterMakes || []).map((make) => ({ label: make, value: make })),
    [meterMakes],
  );
  const meterModelOptions = React.useMemo(
    () => (meterModels || []).map((model) => ({ label: model, value: model })),
    [meterModels],
  );

  const isKnownMake = React.useMemo(() => {
    if (!currentMake) return false;
    return meterMakes.some(
      (item) => String(item).toLowerCase() === currentMake.toLowerCase(),
    );
  }, [meterMakes, currentMake]);

  const isKnownModel = React.useMemo(() => {
    if (!currentModel) return false;
    return meterModels.some(
      (item) => String(item).toLowerCase() === currentModel.toLowerCase(),
    );
  }, [meterModels, currentModel]);

  const lastExistToastRef = React.useRef(null);

  const filterWithCreateOption = React.useCallback(
    (options, params, labelPrefix) => {
      const filtered = freeSoloFilter(options, params);
      const inputValue = params.inputValue?.trim();
      if (inputValue) {
        const exists = options.some((option) => {
          const optionValue =
            typeof option === "string"
              ? option
              : option?.value || option?.label || "";
          return optionValue.toLowerCase() === inputValue.toLowerCase();
        });
        if (!exists) {
          filtered.push({
            inputValue,
            value: inputValue,
            label: `${labelPrefix} "${inputValue}"`,
          });
        }
      }
      return filtered;
    },
    [],
  );

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.connection && parsed?.definition) setState(parsed);
    } catch (e) {
      setState(defaultState);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    const sid = Number(state?.definition?.slaveId);
    if (!Number.isInteger(sid) || sid < 0 || sid > 247) {
      lastExistToastRef.current = null;
      return () => controller.abort();
    }
    (async () => {
      try {
        const res = await getMeterRegisters(
          { slave_id: sid },
          { signal: controller.signal },
        );
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.results)
              ? res.results
              : [];
        const exists = Array.isArray(list) && list.length > 0;
        if (exists && lastExistToastRef.current !== sid) {
          toast.info(`Slave ID: ${sid} already exists`);
          lastExistToastRef.current = sid;
        }
        if (!exists) {
          lastExistToastRef.current = null;
        }
        setSlaveIdExists(Boolean(exists));
      } catch {
        // ignore realtime check errors
      }
    })();
    return () => controller.abort();
  }, [state?.definition?.slaveId]);

  React.useEffect(() => {
    const controller = new AbortController();
    const loadMakes = async () => {
      setMeterLoading((l) => ({ ...l, makes: true }));
      try {
        const list = await getMeterMakes({ signal: controller.signal });
        const normalized = (list || [])
          .map((item) =>
            typeof item === "string" ? item : item?.make || item?.value,
          )
          .filter(Boolean);
        setMeterMakes(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          setMeterError("Failed to load meter makes");
          setMeterMakes([]);
        }
      } finally {
        setMeterLoading((l) => ({ ...l, makes: false }));
      }
    };
    loadMakes();
    return () => controller.abort();
  }, []);

  const canTest = React.useMemo(() => {
    const make = (state?.meter?.make || "").trim();
    const model = (state?.meter?.model || "").trim();
    const name = (state?.meter?.name || "").trim();
    const slaveId = Number(state?.definition?.slaveId);
    const connType = state?.connection?.type || "";
    const mode = state?.connection?.mode || "";
    const isSlaveValid =
      Number.isInteger(slaveId) && slaveId >= 0 && slaveId <= 247;

    if (!make || !model || !name || !isSlaveValid || !connType || !mode)
      return false;
    if (slaveIdExists) return false; // disable when duplicate slave id exists

    if (connType.startsWith("serial")) {
      const serial = state?.connection?.serial || {};
      const port = (serial.port || "").trim();
      const baud = Number(serial.baudRate);
      const dataBits = Number(serial.dataBits);
      const stopBits = Number(serial.stopBits);
      const parity = (serial.parity || "").trim();
      if (!port) return false;
      if (!Number.isFinite(baud) || baud < 1) return false;
      if (!Number.isInteger(dataBits) || dataBits < 5 || dataBits > 8)
        return false;
      if (!Number.isInteger(stopBits) || stopBits < 1 || stopBits > 2)
        return false;
      if (
        parity &&
        ![
          "none",
          "odd",
          "even",
          "mark",
          "space",
          "parity_even",
          "parity_odd",
        ].some((p) => p === parity.toLowerCase())
      )
        return false;
    }

    return true;
  }, [state, slaveIdExists]);

  const canSave = React.useMemo(() => Boolean(result?.ok), [result]);

  const handleSaveMeter = async () => {
    try {
      const workingState = withSelectedMappingsOnly(state);

      const meter = workingState.meter || {};
      const connection = workingState.connection || {};
      const definition = workingState.definition || {};
      const serial = connection.serial || {};

      const normalizeConnType = (t) => {
        if (!t) return null;
        if (t === "modbus_tcp" || t === "modbus_udp") return "tcp";
        return t; // 'serial_rtu' or 'serial_ascii'
      };

      const baseAddress = Number(definition.address ?? 0);
      const baseQuantity = Number(definition.quantity ?? 0);
      const baseBlock = {
        address: Number.isFinite(baseAddress) ? baseAddress : 0,
        quantity:
          Number.isFinite(baseQuantity) && baseQuantity > 0 ? baseQuantity : 0,
      };
      const extraBlocks = sanitizeSummaryBlocks(definition.blocks);
      const blocks = [baseBlock, ...extraBlocks].filter((b) => b.quantity > 0);
      const seen = new Set();
      const uniqueBlocks = blocks.filter((b) => {
        const key = `${b.address}:${b.quantity}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Build parameters from the latest result set, if available
      const parameters = (() => {
        const rows = Array.isArray(result?.data?.results)
          ? result.data.results
          : Array.isArray(result?.data?.rows)
            ? result.data.rows
            : [];
        return rows.map((r, idx) => {
          console.log("cbfbfbf", r, rows);

          const address = Number(r?.start_register ?? r?.address ?? 0);
          const targetDataType =
            r?.target_data_type ||
            r?.data_type ||
            result?.data?.meta?.modbus?.default_value_type ||
            result?.data?.meta?.modbus?.value_type ||
            result?.data?.meta?.modbus?.valueType ||
            null;

          const registerDataType =
            r?.register_data_type || r?.registerType || r?.type || null;
          return {
            name: r?.name ?? "",
            address: Number.isFinite(address) ? address : 0,
            index: idx,
            scale: r?.scale ?? "",
            op: r?.op ?? "mul",
            target_data_type: targetDataType,
            register_data_type: registerDataType,
          };
        });
      })();

      const payload = {
        meter_name: meter.name || null,
        meter_make: meter.make || "",
        meter_model: meter.model || "",
        slave_id: definition.slaveId ?? null,
        connection_type: normalizeConnType(connection.type) || "serial_rtu",
        mode: connection.mode || "rtu",
        serial_port: connection.type?.startsWith("serial")
          ? serial.port || null
          : null,
        // intervalTime in seconds (backend field). Derive from scanRateMs if provided; default 10s
        intervalTime: (() => {
          const ms = Number(definition?.scanRateMs);
          if (Number.isFinite(ms) && ms > 0) return Math.round(ms / 1000);
          return 10;
        })(),
        ...(connection.type?.startsWith("serial")
          ? {
              baud_rate: serial.baudRate ?? null,
              data_bits: serial.dataBits ?? null,
              stop_bits: serial.stopBits ?? null,
              parity: serial.parity ?? null,
            }
          : {}),
        // Always store backend callRegister in datatype_if_bulk as requested
        datatype_if_bulk: (() => {
          const cr = result?.data?.meta?.modbus?.callRegister;
          const v = cr == null ? "" : String(cr).trim();
          return v || null;
        })(),
        config: {
          scanRateMs: Number(definition.scanRateMs ?? 1000),
          ...(Array.isArray(workingState?.definition?.mappings) &&
          workingState.definition.mappings.length
            ? { mappings: workingState.definition.mappings }
            : {}),
          ...(uniqueBlocks && uniqueBlocks.length
            ? { blocks: uniqueBlocks }
            : {}),
          ...(parameters && parameters.length ? { parameters } : {}),
        },
      };

      // Basic validation similar to ResultPanel
      const sid = Number(payload.slave_id);
      if (!Number.isInteger(sid) || sid < 0 || sid > 247) {
        toast.error("Slave ID must be an integer between 0 and 247");
        return;
      }
      if (connection.type?.startsWith("serial")) {
        const baud = Number(payload.baud_rate);
        const dataBits = Number(payload.data_bits);
        const stopBits = Number(payload.stop_bits);
        const parity = payload.parity;
        const allowedParities = new Set(["none", "odd", "even"]);
        if (!Number.isFinite(baud) || baud < 1) {
          toast.error("Baud rate must be a number >= 1");
          return;
        }
        if (!Number.isInteger(dataBits) || dataBits < 5 || dataBits > 8) {
          toast.error("Data bits must be an integer between 5 and 8");
          return;
        }
        if (!Number.isInteger(stopBits) || stopBits < 1 || stopBits > 2) {
          toast.error("Stop bits must be an integer between 1 and 2");
          return;
        }
        if (
          parity != null &&
          parity !== "" &&
          !allowedParities.has(String(parity).toLowerCase())
        ) {
          toast.error("Parity must be one of: none, odd, even");
          return;
        }
        payload.baud_rate = baud;
        payload.data_bits = dataBits;
        payload.stop_bits = stopBits;
        payload.parity =
          parity == null || parity === "" ? null : String(parity).toLowerCase();
      }

      setSaving(true);
      const res = await createMeterRegistersBulk([payload]);
      if (res && res.ok === false) {
        const backendMsg = res?.message || "";
        const lowerMsg = String(backendMsg).toLowerCase();
        if (
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("duplicate") ||
          lowerMsg.includes("unique")
        ) {
          toast.info(`Slave ID: ${String(payload.slave_id)} already exists`);
        } else {
          toast.error(backendMsg || "Failed to save");
        }
        return;
      }
      const skipped = res?.skippedIds || "";
      const allExists = !!res?.alreadyAll;
      if (allExists) {
        toast.info(`Slave ID: ${skipped || ""} Already exists`);
      } else if (skipped) {
        toast.info(`Saved, but skipped (already exists): ${skipped}`);
      } else {
        toast.success("Saved successfully");
      }
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };
  React.useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      setMeterSummaryLoading(true);
      try {
        const summary = await getMeterSummary({ signal: controller.signal });
        setMeterSummary(summary);
        setMeterSummaryError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setMeterSummary(null);
          setMeterSummaryError("Failed to load meter presets");
        }
      } finally {
        setMeterSummaryLoading(false);
      }
    };
    loadSummary();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    const make = currentMake;
    if (!make || !isKnownMake) {
      setMeterModels([]);
      return () => controller.abort();
    }
    const loadModels = async () => {
      setMeterLoading((l) => ({ ...l, models: true }));
      try {
        const list = await getMeterModels(make, { signal: controller.signal });
        const normalized = (list || [])
          .map((item) =>
            typeof item === "string" ? item : item?.model || item?.value,
          )
          .filter(Boolean);
        setMeterModels(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          setMeterError("Failed to load meter models");
          setMeterModels([]);
        }
      } finally {
        setMeterLoading((l) => ({ ...l, models: false }));
      }
    };
    loadModels();
    return () => controller.abort();
  }, [currentMake, isKnownMake]);

  React.useEffect(() => {
    const controller = new AbortController();
    const make = currentMake;
    const model = currentModel;
    if (!make || !model || !isKnownMake || !isKnownModel) {
      setState((s) => {
        if (!s?.meter?.details) return s;
        return {
          ...s,
          meter: { ...(s.meter || { make: "", model: "" }), details: null },
        };
      });
      return () => controller.abort();
    }
    const loadDetails = async () => {
      setMeterLoading((l) => ({ ...l, details: true }));
      try {
        const details = await getMeterDetails(make, model, {
          signal: controller.signal,
        });
        setState((s) => ({
          ...s,
          meter: { ...(s.meter || { make: "", model: "" }), details },
        }));
      } catch (err) {
        if (err.name !== "AbortError") {
          setMeterError("Failed to load meter details");
        }
      } finally {
        setMeterLoading((l) => ({ ...l, details: false }));
      }
    };
    loadDetails();
    return () => controller.abort();
  }, [currentMake, currentModel, isKnownMake, isKnownModel]);

  React.useEffect(() => {
    if (connectionType !== "serial_rtu") return () => {};
    const controller = new AbortController();
    const load = async () => {
      setSerialPortsLoading(true);
      try {
        const res = await getSerialPorts({ signal: controller.signal });
        const ports = Array.isArray(res?.data?.ports)
          ? res.data.ports
          : Array.isArray(res?.ports)
            ? res.ports
            : [];
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
  }, [connectionType]);

  const serialPortDropdownOptions =
    serialPortOptions && serialPortOptions.length
      ? serialPortOptions
      : defaultComPorts;

  const summaryModbus = React.useMemo(
    () =>
      findSummaryModbus(meterSummary, state?.meter?.make, state?.meter?.model),
    [meterSummary, state?.meter?.make, state?.meter?.model],
  );

  const bulkEnabled = Boolean(state?.definition?.bulk);

  React.useEffect(() => {
    if (!summaryModbus) return;
    const summaryFunctionCode =
      summaryModbus.functionCode !== undefined
        ? Number(summaryModbus.functionCode)
        : undefined;
    const summaryAddress =
      summaryModbus.address !== undefined
        ? Number(summaryModbus.address)
        : undefined;
    const summaryQuantity =
      summaryModbus.quantity !== undefined
        ? Number(summaryModbus.quantity)
        : undefined;
    const summaryValueType = summaryModbus.valueType || "float_custom";
    const summaryBulk =
      typeof summaryModbus.bulk === "boolean" ? summaryModbus.bulk : undefined;
    const summaryBlocks = sanitizeSummaryBlocks(summaryModbus.blocks);
    let definitionChanged = false;
    setState((s) => {
      const definition = s?.definition || {};
      const nextDefinition = { ...definition };
      let changed = false;
      if (
        summaryFunctionCode !== undefined &&
        Number(nextDefinition.functionCode) !== summaryFunctionCode
      ) {
        nextDefinition.functionCode = summaryFunctionCode;
        changed = true;
      }
      if (
        summaryAddress !== undefined &&
        Number(nextDefinition.address) !== summaryAddress
      ) {
        nextDefinition.address = summaryAddress;
        changed = true;
      }
      if (
        summaryQuantity !== undefined &&
        Number(nextDefinition.quantity) !== summaryQuantity
      ) {
        nextDefinition.quantity = summaryQuantity;
        changed = true;
      }
      if (summaryValueType && nextDefinition.valueType !== summaryValueType) {
        nextDefinition.valueType = summaryValueType;
        changed = true;
      }
      if (
        summaryBulk !== undefined &&
        Boolean(nextDefinition.bulk) !== summaryBulk
      ) {
        nextDefinition.bulk = summaryBulk;
        changed = true;
      }
      const currentBlocks = sanitizeSummaryBlocks(nextDefinition.blocks);
      if (!areBlocksEqual(currentBlocks, summaryBlocks)) {
        nextDefinition.blocks = summaryBlocks;
        changed = true;
      }
      if (changed) {
        definitionChanged = true;
        return {
          ...s,
          definition: nextDefinition,
        };
      }
      return s;
    });
    if (definitionChanged) {
      setResult(null);
    }
  }, [summaryModbus]);

  const handleDefinitionFieldChange =
    (field, parser = (v) => v) =>
    (name, value) => {
      const parsed = parser(value);
      setState((s) => ({
        ...s,
        definition: { ...(s.definition || {}), [field]: parsed },
      }));
      setResult(null);
    };

  const handleConnectionFieldChange =
    (field, parser = (v) => v) =>
    (name, value) => {
      const parsed = parser(value);
      setState((s) => ({
        ...s,
        connection: { ...(s.connection || {}), [field]: parsed },
      }));
      setResult(null);
    };

  const handleBulkToggle = (_, checked) => {
    setState((s) => ({
      ...s,
      definition: { ...(s.definition || {}), bulk: checked },
    }));
    setResult(null);
  };

  const handleSerialFieldChange =
    (field, parser = (v) => v) =>
    (name, value) => {
      const parsed = parser(value);
      setState((s) => ({
        ...s,
        connection: {
          ...(s.connection || {}),
          serial: { ...(s.connection?.serial || {}), [field]: parsed },
        },
      }));
      setResult(null);
    };

  const handleNetworkFieldChange =
    (field, parser = (v) => v) =>
    (name, value) => {
      const parsed = parser(value);
      setState((s) => ({
        ...s,
        connection: {
          ...(s.connection || {}),
          network: { ...(s.connection?.network || {}), [field]: parsed },
        },
      }));
      setResult(null);
    };

  const handleBlockFieldChange =
    (index, field, parser = (v) => v) =>
    (event) => {
      const rawValue = event?.target?.value ?? "";
      const parsed = parser(rawValue);
      setState((s) => {
        const blocks = Array.isArray(s?.definition?.blocks)
          ? [...s.definition.blocks]
          : [];
        blocks[index] = {
          ...(blocks[index] || { address: 0, quantity: 0 }),
          [field]: parsed,
        };
        return {
          ...s,
          definition: {
            ...(s.definition || {}),
            blocks,
          },
        };
      });
      setResult(null);
    };

  const handleAddBlock = () => {
    setState((s) => ({
      ...s,
      definition: {
        ...(s.definition || {}),
        blocks: [
          ...(s.definition?.blocks || []),
          {
            address: s.definition?.address ?? 0,
            quantity: s.definition?.quantity ?? 1,
          },
        ],
      },
    }));
    setResult(null);
  };

  const handleRemoveBlock = (index) => {
    setState((s) => ({
      ...s,
      definition: {
        ...(s.definition || {}),
        blocks: (s.definition?.blocks || []).filter((_, idx) => idx !== index),
      },
    }));
    setResult(null);
  };

  const handleMeterSelectionChange = (key, value) => {
    setState((s) => {
      const prev = s?.meter || { make: "", model: "", details: null };
      const next = { ...prev, [key]: value };
      if (key === "make") {
        next.model = "";
        next.details = null;
      }
      if (key === "model") {
        next.details = null;
      }
      return { ...s, meter: next };
    });
    setResult(null);
    setMeterError("");
  };

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const workingState = withSelectedMappingsOnly(state);

      const connectionRes = await testCommunicationConnection(workingState);

      if (!connectionRes?.ok) {
        setResult(connectionRes);
        toast.error(connectionRes?.message || "Connection test failed");
        return;
      }

      const previewPayload = {
        ...workingState,
        definition: {
          ...workingState.definition,
          functionCode: 3,
        },
      };
      console.log("prev", previewPayload);

      const readRes = await readMeterRegisters(previewPayload);

      const finalRes = {
        ...readRes,
        message: readRes?.ok
          ? `Connection OK. ${readRes.message || "Read successful"}`
          : `Connection OK. ${readRes?.message || "Read failed"}`,
      };

      setResult(finalRes);

      if (readRes?.ok) {
        toast.success(readRes.message || "Read successful");
      } else {
        toast.error(readRes?.message || "Read failed");
      }
    } catch (e) {
      setResult({
        ok: false,
        message: "Test failed",
        timeTakenMs: 0,
        data: null,
      });
      toast.error("Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <MeterDeviceAndConnection
          currentMake={currentMake}
          currentModel={currentModel}
          getOptionText={getOptionText}
          handleMeterSelectionChange={handleMeterSelectionChange}
          filterWithCreateOption={filterWithCreateOption}
          meterMakeOptions={meterMakeOptions}
          meterModelOptions={meterModelOptions}
          meterLoading={meterLoading}
          serialPortOptions={serialPortDropdownOptions}
          serialPortsLoading={serialPortsLoading}
          state={state}
          handleDefinitionFieldChange={handleDefinitionFieldChange}
          handleSerialFieldChange={handleSerialFieldChange}
          parityOptions={parityOptions}
          connectionType={connectionType}
          handleConnectionFieldChange={handleConnectionFieldChange}
          connectionTypeOptions={connectionTypeOptions}
          modeOptions={modeOptions}
          meterError={meterError}
        />
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              borderTopWidth: 3,
              borderTopColor: "secondary.main",
            }}
          >
            <Grid container spacing={1.5}>
              {!isKnownMake ? (
                <Grid item xs={12} md={6}>
                  <BulkTogglePanel
                    bulkEnabled={bulkEnabled}
                    onToggle={handleBulkToggle}
                  />
                </Grid>
              ) : null}

              {bulkEnabled && !isKnownMake ? (
                <Grid item xs={12} md={6}>
                  <ConfigItem
                    label="Datatype (bulk)"
                    value={state?.definition?.datatypeIfBulk ?? ""}
                    onChange={handleDefinitionFieldChange("datatypeIfBulk")}
                    name="datatypeIfBulk"
                    placeholder="e.g. Float32 from Uint16 buffer"
                  />
                </Grid>
              ) : null}

              {summaryModbus ? (
                <Grid item xs={12} md={8}>
                  <PresetSummaryPanel
                    summaryModbus={summaryModbus}
                    loading={meterSummaryLoading}
                    error={meterSummaryError}
                  />
                </Grid>
              ) : (
                <ManualDefinitionForm
                  definition={state?.definition}
                  functionOptions={functionOptions}
                  valueTypeOptions={valueTypeOptions}
                  onChangeFunctionCode={handleDefinitionFieldChange(
                    "functionCode",
                    (v) => Number(v),
                  )}
                  onChangeValueType={handleDefinitionFieldChange("valueType")}
                  onChangeAddress={handleDefinitionFieldChange("address", (v) =>
                    Number(v),
                  )}
                  onChangeQuantity={handleDefinitionFieldChange(
                    "quantity",
                    (v) => Number(v),
                  )}
                  onChangeScanRateMs={handleDefinitionFieldChange(
                    "scanRateMs",
                    (v) => Number(v),
                  )}
                  blocks={state?.definition?.blocks || []}
                  onAddBlock={handleAddBlock}
                  onBlockFieldChange={handleBlockFieldChange}
                  onRemoveBlock={handleRemoveBlock}
                />
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <HeaderBar
        testing={testing}
        reading={reading}
        saving={saving}
        canTest={canTest}
        canSave={canSave}
        onTest={handleTest}
        onSave={handleSaveMeter}
        apiBaseUrl={getCommunicationApiBaseUrl()}
      />

      <RegisterMappingSection
        valueType={state?.definition?.valueType}
        mappings={state?.definition?.mappings || []}
        onMappingsChange={(mappings) => {
          setState((s) => ({
            ...s,
            definition: {
              ...s.definition,
              mappings,
            },
          }));
          setResult(null);
        }}
        result={result}
        requestContext={withSelectedMappingsOnly(state)}
        loading={testing || reading}
      />
    </Box>
  );
}