import React from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  TextField,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "react-toastify";
import {
  createMeterRegister,
  createMeterRegistersBulk,
  getCommunicationApiBaseUrl,
} from "../services/communicationApi";
import ResultLoading from "./resultPanel/ResultLoading";
import ResultHeader from "./resultPanel/ResultHeader";
import NamedRegistersTable from "./resultPanel/NamedRegistersTable";
import DataInspector from "./resultPanel/DataInspector";
import {
  buildDecodedSignature,
  buildMappedSignature,
  buildNamedSignature,
} from "../utils/resultPanelUtils";

const sanitizeSummaryBlocks = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : [])
    .map((block) => {
      const address = Number(block?.address);
      const quantity = Number(block?.quantity);
      return {
        address: Number.isFinite(address) ? address : 0,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
      };
    })
    .filter((block) => block.quantity > 0);

function ResultPanel({ result, requestContext, valueType, mappings, loading }) {
  const isLoading = Boolean(loading);
  const likelyCauses = Array.isArray(result?.data?.likelyCauses)
    ? result.data.likelyCauses
    : [];
  const errorKind =
    typeof result?.data?.errorKind === "string" ? result.data.errorKind : "";
  // Prefer new response shape { meta, blocks, results }, fallback to legacy fields
  const meta = result?.data?.meta || null;
  const perBlock = Array.isArray(result?.data?.blocks)
    ? result.data.blocks
    : [];
  const decodedRows = Array.isArray(result?.data?.results)
    ? result.data.results
    : Array.isArray(result?.data?.rows)
      ? result.data.rows
      : [];
  const mappedRows = Array.isArray(result?.data?.mappedRows)
    ? result.data.mappedRows
    : [];
  const rawRegisters = Array.isArray(result?.data?.registers)
    ? result.data.registers
    : [];
  const namedRegisters = (() => {
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.registerValues))
      return result.data.registerValues;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    return [];
  })();

  const [decodedSelection, setDecodedSelection] = React.useState({});
  const [mappedSelection, setMappedSelection] = React.useState({});
  const [namedRowsState, setNamedRowsState] = React.useState({});
  const [savingNamed, setSavingNamed] = React.useState(false);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [inspectorPos, setInspectorPos] = React.useState({ x: 32, y: 160 });
  const decodedSignatureRef = React.useRef("");
  const mappedSignatureRef = React.useRef("");
  const namedSignatureRef = React.useRef("");
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setInspectorPos({ x: window.innerWidth - 380, y: 140 });
  }, []);

  React.useEffect(() => {
    const signature = buildDecodedSignature(decodedRows);
    if (signature === decodedSignatureRef.current) return;
    decodedSignatureRef.current = signature;
    setDecodedSelection((prev) => {
      const next = {};
      decodedRows.forEach((row, idx) => {
        next[idx] = {
          selected: prev[idx]?.selected ?? true,
          name: prev[idx]?.name ?? row?.name ?? "",
          scale: prev[idx]?.scale ?? row?.scale ?? "",
          op: prev[idx]?.op ?? row?.op ?? "mul",
        };
      });
      return next;
    });
  }, [decodedRows]);

  React.useEffect(() => {
    const signature = buildMappedSignature(mappedRows);
    if (signature === mappedSignatureRef.current) return;
    mappedSignatureRef.current = signature;
    setMappedSelection((prev) => {
      const next = {};
      mappedRows.forEach((_, idx) => {
        next[idx] = prev[idx] ?? true;
      });
      return next;
    });
  }, [mappedRows]);

  React.useEffect(() => {
    if (!namedRegisters.length) {
      if (!namedSignatureRef.current) return;
      namedSignatureRef.current = "";
      setNamedRowsState({});
      return;
    }
    const signature = buildNamedSignature(namedRegisters);
    if (signature === namedSignatureRef.current) return;
    namedSignatureRef.current = signature;
    setNamedRowsState((prev) => {
      const next = {};
      namedRegisters.forEach((pair, idx) => {
        next[idx] = {
          selected: prev[idx]?.selected ?? true,
          name: prev[idx]?.name ?? pair?.name ?? "",
          // Prefer existing state, then backend-provided scale/op from the response item, then sensible defaults
          scale: prev[idx]?.scale ?? pair?.scale ?? "",
          op: prev[idx]?.op ?? pair?.op ?? "mul",
        };
      });
      return next;
    });
  }, [namedRegisters]);

  React.useEffect(() => {
    const handleMouseMove = (event) => {
      if (!draggingRef.current) return;
      setInspectorPos({
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y,
      });
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleInspectorMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      dragOffsetRef.current = {
        x: event.clientX - inspectorPos.x,
        y: event.clientY - inspectorPos.y,
      };
      draggingRef.current = true;
    },
    [inspectorPos],
  );

  React.useEffect(() => {
    if (!result?.data) return;
    // Temporary debug log to inspect backend-decoded payload
    // eslint-disable-next-line no-console
    console.log("[CommunicationSetup] Result data from backend:", result.data);
  }, [result]);

  const blockKind = result?.data?.kind || null;
  const blockWidth =
    typeof result?.data?.width === "number" && result.data.width > 0
      ? result.data.width
      : null;

  const anyNamedSelected = React.useMemo(
    () => Object.values(namedRowsState || {}).some((row) => row?.selected),
    [namedRowsState],
  );

  const anyNamedValidSelected = React.useMemo(
    () =>
      Object.values(namedRowsState || {}).some((row) => {
        if (!row?.selected) return false;
        const name = (row?.name || "").trim();
        const scaleStr = (row?.scale ?? "").toString().trim();
        const scaleNumber = Number(scaleStr);
        const hasNumericScale = !Number.isNaN(scaleNumber);
        return Boolean(name) && hasNumericScale;
      }),
    [namedRowsState],
  );

  const handleSaveNamedRegisters = async () => {
    if (!requestContext) return;

    const meter = requestContext.meter || {};
    const connection = requestContext.connection || {};
    const definition = requestContext.definition || {};
    const serial = connection.serial || {};

    // Build mappings from selected named registers
    const mappings = (namedRegisters || [])
      .map((pair, idx) => {
        const rowState = namedRowsState[idx] || {
          selected: true,
          name: pair?.name ?? "",
        };
        const name = (rowState.name || "").trim();
        if (!rowState.selected || !name) return null;

        const address = Number(pair?.start_register ?? definition.address ?? 0);
        const quantity = Number(pair?.size ?? definition.quantity ?? 0);
        const resolvedType =
          pair?.target_data_type ||
          pair?.data_type ||
          definition.valueType ||
          valueType ||
          "none";
        return {
          name,
          fc: 3,
          address: Number.isFinite(address) ? address : 0,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
          type: resolvedType,
        };
      })
      .filter(Boolean)
      .filter((m) => m.quantity > 0);

    const blocks = (() => {
      const baseAddress = Number(definition.address ?? 0);
      const baseQuantity = Number(definition.quantity ?? 0);
      const baseBlock = {
        address: Number.isFinite(baseAddress) ? baseAddress : 0,
        quantity:
          Number.isFinite(baseQuantity) && baseQuantity > 0 ? baseQuantity : 0,
      };

      const extraBlocks = sanitizeSummaryBlocks(definition.blocks);

      const combined = [baseBlock, ...extraBlocks].filter(
        (b) => b.quantity > 0,
      );

      // De-dupe blocks by address+quantity
      const seen = new Set();
      return combined.filter((b) => {
        const key = `${b.address}:${b.quantity}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })();

    if (
      (!mappings || mappings.length === 0) &&
      (!blocks || blocks.length === 0)
    ) {
      toast.error("Nothing to save. Add mappings or blocks first.");
      return;
    }

    const normalizeConnType = (t) => {
      if (!t) return null;
      if (t === "modbus_tcp" || t === "modbus_udp") return "tcp";
      return t; // 'serial_rtu' or 'serial_ascii'
    };

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
        const cr = meta?.modbus?.callRegister;
        const v = cr == null ? "" : String(cr).trim();
        return v || null;
      })(),
      config: {
        scanRateMs: Number(definition.scanRateMs ?? 1000),
        ...(mappings && mappings.length ? { mappings } : {}),
        ...(blocks && blocks.length ? { blocks } : {}),
      },
    };

    // Validate slave_id range (0-247)
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

    if (definition?.bulk) {
      const dt = payload.datatype_if_bulk;
      if (dt != null && String(dt).length > 100) {
        toast.error("Datatype (bulk) must be at most 100 characters");
        return;
      }
    }

    setSavingNamed(true);
    try {
      const res = await createMeterRegistersBulk([payload]);
      // Handle non-OK shape
      if (res && res.ok === false) {
        const backendMsg = res?.message || "";
        const lowerMsg = String(backendMsg).toLowerCase();
        if (
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("duplicate") ||
          lowerMsg.includes("unique")
        ) {
          toast.info(
            `Slave ID id${payload.slave_id} already exists. Skipping duplicate save.`,
          );
        } else {
          toast.error(backendMsg || "Failed to save");
        }
        return;
      }
      // OK branch: use headers data surfaced by API client
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
      // eslint-disable-next-line no-console
      console.error("Failed to save register values", e);
      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.errors?.[0]?.message ||
        e?.message ||
        "";
      const lowerMsg = String(backendMsg).toLowerCase();
      if (
        lowerMsg.includes("already exists") ||
        lowerMsg.includes("duplicate") ||
        lowerMsg.includes("unique")
      ) {
        toast.info(
          `Slave ID id${payload.slave_id} already exists. Skipping duplicate save.`,
        );
      } else {
        toast.error(backendMsg || "Failed to save");
      }
    } finally {
      setSavingNamed(false);
    }
  };

  const inspectorRows = mappedRows.length ? mappedRows : decodedRows;
  const inspectorLabel = mappedRows.length ? "Mapped values" : "Decoded rows";

  if (isLoading) {
    return <ResultLoading />;
  }

  // If not loading and no result yet, render nothing (avoid accessing result fields)
  if (!result) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <ResultHeader
        ok={Boolean(result?.ok)}
        inspectorRowsCount={inspectorRows.length}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((open) => !open)}
      />

      {!result?.ok ? (
        <Box sx={{ mt: 1.5, mb: 1.5 }}>
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {errorKind ? `Read failed (${errorKind})` : "Read failed"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {result?.message || "Request failed"}
            </Typography>
          </Alert>

          {likelyCauses.length ? (
            <Accordion
              elevation={0}
              sx={{
                mt: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Possible causes
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {likelyCauses.map((cause, idx) => (
                    <li key={`${idx}-${String(cause).slice(0, 24)}`}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {String(cause)}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : null}
        </Box>
      ) : null}

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {result?.message || ""}
      </Typography>

      {meta?.modbus ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Read Metadata
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Mode:{" "}
            {(() => {
              const m = meta?.modbus || {};
              const isBulk =
                String(m.call_register || "").toLowerCase() === "bulk" ||
                Boolean(m.bulk);
              return isBulk ? "Bulk" : "Single";
            })()}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Default value type:{" "}
            {String(
              meta?.modbus?.default_value_type ||
                meta?.modbus?.value_type ||
                meta?.modbus?.valueType ||
                "n/a",
            )}
          </Typography>
        </Box>
      ) : null}

      {perBlock.length ? (
        <Box sx={{ mt: 2, overflow: "auto" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Per-block status
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perBlock.map((b, idx) => (
                <TableRow key={`${b.address}-${b.quantity}-${idx}`}>
                  <TableCell>{b.address}</TableCell>
                  <TableCell>{b.quantity}</TableCell>
                  <TableCell>{b.ok ? "OK" : "Error"}</TableCell>
                  <TableCell>{b.message || ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      {namedRegisters.length ? (
        <NamedRegistersTable
          namedRegisters={namedRegisters}
          namedRowsState={namedRowsState}
          saving={savingNamed}
          canSave={anyNamedValidSelected}
          onSave={handleSaveNamedRegisters}
          onRowSelectedChange={(idx, checked) => {
            setNamedRowsState((prev) => ({
              ...prev,
              [idx]: { ...(prev[idx] || {}), selected: checked },
            }));
          }}
          onRowNameChange={(idx, value) => {
            setNamedRowsState((prev) => ({
              ...prev,
              [idx]: { ...(prev[idx] || {}), name: value },
            }));
          }}
          onRowScaleChange={(idx, value) => {
            setNamedRowsState((prev) => ({
              ...prev,
              [idx]: { ...(prev[idx] || {}), scale: value },
            }));
          }}
          onRowOpChange={(idx, value) => {
            setNamedRowsState((prev) => ({
              ...prev,
              [idx]: { ...(prev[idx] || {}), op: value },
            }));
          }}
        />
      ) : null}

      {typeof result.timeTakenMs === "number" && (
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Response time: {result.timeTakenMs} ms
        </Typography>
      )}

      {rawRegisters.length ? (
        <Box sx={{ mt: 3, overflow: "auto" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Raw Registers
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Value (UInt16)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rawRegisters.map((reg) => (
                <TableRow key={reg.address}>
                  <TableCell>{reg.address}</TableCell>
                  <TableCell>{reg.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      {decodedRows.length ? (
        <Box sx={{ mt: 3, overflow: "auto" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Decoded Rows{" "}
            {blockKind
              ? `(${blockKind}${blockWidth ? `, width ${blockWidth}` : ""})`
              : ""}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Save
                  </Typography>
                </TableCell>
                <TableCell>Index</TableCell>
                <TableCell>Register Name</TableCell>
                <TableCell>Scale</TableCell>
                <TableCell>Op</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Raw</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {decodedRows.map((row, idx) => {
                const rowState = decodedSelection[idx] || {
                  selected: true,
                  name: "",
                  scale: "",
                  op: "mul",
                };
                const addr = row?.address ?? row?.start_register ?? "";
                const rawArr = Array.isArray(row?.raw)
                  ? row.raw
                  : Array.isArray(row?.raw_registers)
                    ? row.raw_registers
                    : [];
                return (
                  <TableRow key={`${addr}-${idx}`}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={rowState.selected}
                        onChange={(event) => {
                          const { checked } = event.target;
                          setDecodedSelection((prev) => ({
                            ...prev,
                            [idx]: { ...rowState, selected: checked },
                          }));
                        }}
                      />
                    </TableCell>
                    <TableCell>{idx}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <TextField
                        size="small"
                        disabled={rowState?.name !== "" && rowState?.name !== null}
                        fullWidth
                        placeholder="Register name"
                        value={rowState.name}
                        onChange={(event) => {
                          const { value } = event.target;
                          setDecodedSelection((prev) => ({
                            ...prev,
                            [idx]: { ...rowState, name: value },
                          }));
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        placeholder="Scale"
                        value={rowState.scale}
                        onChange={(event) => {
                          const { value } = event.target;
                          setDecodedSelection((prev) => ({
                            ...prev,
                            [idx]: { ...rowState, scale: value },
                          }));
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 80 }}>
                      <TextField
                        select
                        size="small"
                        value={rowState.op || "mul"}
                        onChange={(event) => {
                          const { value } = event.target;
                          setDecodedSelection((prev) => ({
                            ...prev,
                            [idx]: { ...rowState, op: value },
                          }));
                        }}
                      >
                        <MenuItem value="mul">×</MenuItem>
                        <MenuItem value="div">÷</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>{addr}</TableCell>
                    <TableCell>
                      {rawArr.length ? rawArr.join(", ") : ""}
                    </TableCell>
                    <TableCell>
                      {row.value === null || row.value === undefined
                        ? ""
                        : String(row.value)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      {mappedRows.length ? (
        <Box sx={{ mt: 3, overflow: "auto" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Mapped Values
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Save
                  </Typography>
                </TableCell>
                <TableCell>Index</TableCell>
                <TableCell>Register Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Length</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Raw</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Scale</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappedRows.map((m, idx) => (
                <TableRow key={m.index ?? `${m.address}-${m.type}-${idx}`}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={mappedSelection[idx] ?? true}
                      onChange={(event) => {
                        const { checked } = event.target;
                        setMappedSelection((prev) => ({
                          ...prev,
                          [idx]: checked,
                        }));
                      }}
                    />
                  </TableCell>
                  <TableCell>{idx}</TableCell>
                  <TableCell>{m.name || "-"}</TableCell>
                  <TableCell>{m.address}</TableCell>
                  <TableCell>{m.length}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>
                    {Array.isArray(m.raw) ? m.raw.join(", ") : ""}
                  </TableCell>
                  <TableCell>
                    {m.value === null || m.value === undefined
                      ? ""
                      : String(m.value)}
                  </TableCell>
                  <TableCell>
                    {m.scale === undefined || m.scale === null
                      ? ""
                      : String(m.scale)}
                  </TableCell>
                  <TableCell>{m.unit || ""}</TableCell>
                  <TableCell>{m.ok ? "OK" : m.error || "Error"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      {result?.data?.written ? (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Written registers: {result.data.written}
        </Typography>
      ) : null}

      {result?.data?.info ? (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {result.data.info}
        </Typography>
      ) : null}

      <DataInspector
        open={inspectorOpen}
        rows={inspectorRows}
        label={inspectorLabel}
        pos={inspectorPos}
        onHeaderMouseDown={handleInspectorMouseDown}
        onClose={() => setInspectorOpen(false)}
        blockKind={blockKind}
      />
    </Paper>
  );
}

export default ResultPanel;
