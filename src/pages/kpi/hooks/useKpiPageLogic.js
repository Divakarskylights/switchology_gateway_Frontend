import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { configInit } from "../../../components/layout/globalvariable";
import useAdminPasswordStore from "../../../redux/store/useAdminPasswordStore";

const useKpiPageLogic = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fields, setFields] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogParameters, setDialogParameters] = useState([
    { parameter: "", value: "", unit: "" },
  ]);
  const [unitInfoOpen, setUnitInfoOpen] = useState(false);
  const [kpiData, setKpiData] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRowIdx, setMenuRowIdx] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewRowData, setViewRowData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRowData, setDeleteRowData] = useState(null);
  const [durationUnit, setDurationUnit] = useState("minutes");
  const [deleteParamsDialogOpen, setDeleteParamsDialogOpen] = useState(false);
  const [selectedParamsToDelete, setSelectedParamsToDelete] = useState([]);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingAdminAction, setPendingAdminAction] = useState(null);
  const [pendingActionPayload, setPendingActionPayload] = useState(null);

  const textfieldStyle = useMemo(
    () => ({
      "& .MuiInputBase-root": {
        height: 28,
        fontSize: 12,
        minHeight: 0,
      },
      "& .MuiInputBase-input": {
        py: 0.2,
        fontSize: 12,
      },
    }),
    [],
  );

  const now = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const { adminPassword, fetchAdminPassword } = useAdminPasswordStore();

  useEffect(() => {
    fetchAdminPassword().catch(() => {
      toast.error("Failed to load admin password.");
    });
  }, [fetchAdminPassword]);

  const requestAdminPassword = (action, payload = null) => {
    setPendingAdminAction(action);
    setPendingActionPayload(payload);
    setPasswordInput("");
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordInput("");
    setPendingAdminAction(null);
    setPendingActionPayload(null);
  };

  const executeAdminAction = () => {
    switch (pendingAdminAction) {
      case "addParameter":
        setDialogOpen(true);
        setFromDate("");
        setToDate("");
        break;
      case "bulkDelete":
        setSelectedParamsToDelete([]);
        setDeleteParamsDialogOpen(true);
        break;
      case "rowDelete":
        if (pendingActionPayload) {
          setDeleteRowData(pendingActionPayload);
          setDeleteDialogOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const getActionDescription = () => {
    switch (pendingAdminAction) {
      case "addParameter":
        return "add new KPI parameters";
      case "bulkDelete":
        return "delete selected KPI parameters";
      case "rowDelete":
        return "delete this KPI entry";
      default:
        return "perform this action";
    }
  };

  const handlePasswordConfirm = () => {
    if (!adminPassword) {
      toast.error("Admin password not available.");
      return;
    }
    if (passwordInput === adminPassword) {
      executeAdminAction();
      closePasswordDialog();
    } else {
      toast.error("Incorrect password.");
    }
  };

  const handleFromDateChange = (e) => {
    const newFrom = e.target.value;
    setFromDate(newFrom);

    if (toDate && newFrom && toDate < newFrom) {
      setToDate(newFrom);
    }
  };

  const handleToDateChange = (e) => {
    const newTo = e.target.value;
    if (fromDate && newTo < fromDate) {
      return;
    }
    setToDate(newTo);
  };

  const formatDateTime = (date) => (date ? new Date(date).toLocaleString() : "-");

  const handleFieldChange = (idx, key, value) => {
    setFields((prevFields) =>
      prevFields.map((item, index) => (index === idx ? { ...item, [key]: value } : item)),
    );
  };

  const handleDialogParameterChange = (idx, key, value) => {
    setDialogParameters((prevParams) =>
      prevParams.map((param, index) => (index === idx ? { ...param, [key]: value } : param)),
    );
  };

  const handleDialogParameterNameInput = (idx, value) => {
    const inputValue = value.toUpperCase();
    const existingParameters = kpiData.map((row) => row.parameters).filter(Boolean);
    if (existingParameters.includes(inputValue)) {
      toast.error("Cannot add parameter name that already exists");
      return;
    }
    handleDialogParameterChange(idx, "parameter", inputValue);
  };

  const addDialogParameter = () => {
    if (dialogParameters.length < 10) {
      setDialogParameters((prev) => [...prev, { parameter: "", value: "", unit: "" }]);
    }
  };

  const removeDialogParameter = (idx) => {
    if (dialogParameters.length > 1) {
      setDialogParameters((prev) => prev.filter((_, index) => index !== idx));
    }
  };

  async function deleteField(combineId) {
    try {
      const response = await fetch(
        `${configInit.appBaseUrl}/api/kpi/delete-combineid-added-false/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            combine_id: combineId,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete KPI by combine_id");
      }

      const data = await response.json();
      toast.success("KPI deleted successfully!");
      return data;
    } catch (error) {
      console.error("Delete KPI by combine_id error:", error);
      toast.error(`Failed to delete KPI: ${error.message}`);
      throw error;
    }
  }

  async function multiDeleteAddedTrue(parameterName) {
    try {
      const response = await fetch(
        `${configInit.appBaseUrl}/api/kpi/multi-delete-added-trueorfalse/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parameters: parameterName,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to multi-delete KPI (added=true)");
      }

      const data = await response.json();
      toast.success(`KPI(s) deleted successfully for ${parameterName}!`);
      return data;
    } catch (error) {
      console.error("Multi-delete KPI error:", error);
      toast.error(`Failed to delete KPI(s): ${error.message}`);
      throw error;
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${configInit.appBaseUrl}/api/kpi/list`);
      if (!response.ok) {
        throw new Error("Failed to fetch KPI data");
      }

      const result = await response.json();

      if (result) {
        const data = result || [];

        if (data.length > 0) {
          const addedParameters = data.filter((item) => item.added === true);

          const paramUnitMap = {};
          addedParameters.forEach((item) => {
            paramUnitMap[item.parameters] = item.units;
          });

          const uniqueParameters = [...new Set(addedParameters.map((item) => item.parameters))];

          const uniqueFields = uniqueParameters.map((parameter) => ({
            parameter,
            unit: paramUnitMap[parameter] || "",
            value: "",
          }));

          const latestValues = {};
          data
            .filter((item) => item.added === false)
            .forEach((item) => {
              if (
                !latestValues[item.parameters] ||
                new Date(item.created_date) > new Date(latestValues[item.parameters].created_date)
              ) {
                latestValues[item.parameters] = item;
              }
            });

          const uniqueFieldsWithValues = uniqueFields.map((field) => ({
            ...field,
            value: latestValues[field.parameter]?.values || "",
          }));

          setKpiData(data);
          setFields(uniqueFieldsWithValues);
        } else {
          setKpiData([]);
          setFields([]);
        }
      } else {
        setKpiData([]);
        setFields([]);
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      setKpiData([]);
      setFields([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function createKPI(validParameters, tags = {}, timestamp = null, isAddingParameter = false) {
    try {
      for (const param of validParameters) {
        const numericValue =
          param.value && !isNaN(parseFloat(param.value)) ? parseFloat(param.value) : 0;

        const payload = {
          values: numericValue,
          parameters: param.parameter,
          units: param.unit,
          added: isAddingParameter,
          createdDate: isAddingParameter ? new Date() : param.created_date,
          combine_id: param.combine_id || null,
        };

        const response = await fetch(`${configInit.appBaseUrl}/api/kpi/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to insert KPI data");
        }

        const data = await response.json();
        if (!data) {
          throw new Error("No rows affected during KPI insertion");
        }
      }

      toast.success("KPI data written successfully!");
    } catch (error) {
      console.error("REST KPI insertion error:", error);
      toast.error("Error: " + (error.message || "Failed to insert KPI data"));
      throw error;
    }
  }

  const handleDialogSubmit = async () => {
    const validParameters = dialogParameters.filter(
      (param) => param.parameter.trim() !== "" && param.unit.trim() !== "",
    );

    if (validParameters.length > 0) {
      try {
        await createKPI(validParameters, {}, null, true);
        setDialogOpen(false);
        setDialogParameters([{ parameter: "", value: "", unit: "" }]);
        fetchData();
      } catch (error) {
        toast.error("Failed to save KPI data.");
      }
    } else {
      toast.error("Please fill in at least one parameter completely");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogParameters([{ parameter: "", value: "", unit: "" }]);
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From date and To date");
      return;
    }

    const validParameters = fields
      .filter(
        (param) =>
          param &&
          typeof param.parameter === "string" &&
          param.parameter.trim() !== "" &&
          param.value !== undefined &&
          param.value !== null &&
          String(param.value).trim() !== "",
      )
      .map((param) => ({ ...param }));

    if (validParameters.length > 0) {
      try {
        const fromISO = fromDate ? new Date(fromDate).toISOString() : null;
        const toISO = toDate ? new Date(toDate).toISOString() : null;

        const allRows = validParameters.flatMap((param) => {
          const combineId =
            window.crypto && window.crypto.randomUUID
              ? window.crypto.randomUUID()
              : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          return [
            { ...param, created_date: fromISO, combine_id: combineId },
            { ...param, created_date: toISO, combine_id: combineId },
          ];
        });

        await createKPI(allRows, {}, null, false);
        fetchData();
        setFields((prevFields) => prevFields.map((f) => ({ ...f, value: "" })));
        setFieldsDisabled(true);
        setFromDate("");
        setToDate("");
      } catch (error) {
        toast.error("Failed to save KPI data.");
      }
    } else {
      toast.error("Please fill in at least one parameter completely");
    }
  };

  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRowIdx(idx);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRowIdx(null);
  };

  const handleView = () => {
    if (menuRowIdx !== null && mergedKpiData[menuRowIdx]) {
      setViewRowData(mergedKpiData[menuRowIdx]);
      setViewDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = (row) => {
    handleMenuClose();
    requestAdminPassword("rowDelete", row);
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
    if (!row?.uid) {
      toast.error("Cannot delete: UID is required for deletion.");
      handleDeleteDialogClose();
      return;
    }
    try {
      await deleteField(row.combineId);
      fetchData();
      handleDeleteDialogClose();
    } catch (error) {
      toast.error("Failed to delete KPI row(s).");
    }
  };

  const closeDeleteParamsDialog = () => {
    setDeleteParamsDialogOpen(false);
    setSelectedParamsToDelete([]);
  };

  const handleParamCheckboxChange = (param) => {
    setSelectedParamsToDelete((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param],
    );
  };

  const handleDeleteParamsConfirm = async () => {
    try {
      for (const paramName of selectedParamsToDelete) {
        await multiDeleteAddedTrue(paramName);
      }
      setFields((prevFields) => prevFields.filter((f) => !selectedParamsToDelete.includes(f.parameter)));
      fetchData();
      toast.success("Fields deleted successfully!");
      closeDeleteParamsDialog();
    } catch (error) {
      toast.error("Failed to delete one or more fields.");
    }
  };

  useEffect(() => {
    if (fromDate && toDate) {
      setFieldsDisabled(false);
    }
  }, [fromDate, toDate]);

  const mergedKpiData = useMemo(() => {
    const mergedKpiDataMap = {};

    kpiData
      .filter((row) => row.added === false)
      .forEach((row) => {
        const key = row.combine_id || row.uid;

        if (!mergedKpiDataMap[key]) {
          mergedKpiDataMap[key] = {
            ...row,
            combineId: row.combine_id || row.uid,
            uids: [row.uid],
            values: [row.values],
            createdDates: [row.created_date],
          };
        } else {
          mergedKpiDataMap[key].uids.push(row.uid);
          mergedKpiDataMap[key].values.push(row.values);
          mergedKpiDataMap[key].createdDates.push(row.created_date);
        }
      });

    return Object.values(mergedKpiDataMap).map((group) => {
      const createdDateTimes = group.createdDates
        .map((d) => new Date(d))
        .sort((a, b) => a - b);

      const fromDateTime = createdDateTimes[0];
      const toDateTime = createdDateTimes[createdDateTimes.length - 1];

      let valueDisplay = "-";
      if (group.values?.length > 0) {
        const allSame = group.values.every((v) => v === group.values[0]);
        valueDisplay = allSame ? group.values[0] : group.values.join(", ");
      }

      return {
        combineId: group.combine_id,
        parameters: group.parameters,
        units: group.units,
        updatedDate: group.updatedDate,
        uid: group.uids.join(", "),
        values: valueDisplay,
        createdFromDateTime: fromDateTime,
        createdToDateTime: toDateTime,
      };
    });
  }, [kpiData]);

  useEffect(() => {
    if (mergedKpiData.length > 0 || kpiData.length > 0) {
      console.log("✅ Final KPI Data:", [...mergedKpiData, ...kpiData.filter((row) => row.added === true)]);
    }
  }, [mergedKpiData, kpiData]);

  const durationValue = useMemo(() => {
    if (!fromDate || !toDate) return "";
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffMs = to - from;
    if (diffMs <= 0) return "";
    if (durationUnit === "minutes") return Math.floor(diffMs / (1000 * 60));
    if (durationUnit === "hours") return Math.floor(diffMs / (1000 * 60 * 60));
    if (durationUnit === "days") return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return "";
  }, [fromDate, toDate, durationUnit]);

  const isDialogSubmitDisabled = useMemo(
    () => dialogParameters.some((param) => !param.parameter.trim() || !param.unit.trim()),
    [dialogParameters],
  );

  return {
    fromDate,
    toDate,
    textfieldStyle,
    now,
    requestAdminPassword,
    handleFromDateChange,
    handleToDateChange,
    durationValue,
    durationUnit,
    setDurationUnit,
    fields,
    handleFieldChange,
    fieldsDisabled,
    handleSubmit,
    dialogOpen,
    handleDialogClose,
    dialogParameters,
    handleDialogParameterNameInput,
    handleDialogParameterChange,
    removeDialogParameter,
    addDialogParameter,
    handleDialogSubmit,
    unitInfoOpen,
    setUnitInfoOpen,
    mergedKpiData,
    formatDateTime,
    viewDialogOpen,
    handleViewDialogClose,
    viewRowData,
    deleteDialogOpen,
    handleDeleteDialogClose,
    deleteRowData,
    deleteParamsDialogOpen,
    closeDeleteParamsDialog,
    selectedParamsToDelete,
    handleParamCheckboxChange,
    handleDeleteParamsConfirm,
    menuAnchorEl,
    menuRowIdx,
    handleMenuOpen,
    handleMenuClose,
    handleView,
    handleDelete,
    handleDeleteConfirm,
    passwordDialogOpen,
    closePasswordDialog,
    getActionDescription,
    passwordInput,
    setPasswordInput,
    handlePasswordConfirm,
    isDialogSubmitDisabled,
  };
};

export default useKpiPageLogic;
