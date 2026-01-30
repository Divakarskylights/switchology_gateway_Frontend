import { useState, useEffect, useCallback, useMemo } from "react";
import { graphqlClient } from "../../../services/client";
import {
  GET_METER_INFO,
  GET_SINGLE_SCADA_DIAGRAM_MODEL,
  SINGLE_SCADA_DIAGRAM_NAME,
} from "../../../services/query";
import { toast } from "react-toastify";
import { configInit } from "../../../components/layout/globalvariable";
import { getMeterRegisters } from "../../../features/communicationSetup/services/communicationApi";

export const useScadaDataFetching = () => {
  const [configuredMeters, setConfiguredMeters] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [initialNodeDataArray, setInitialNodeDataArray] = useState([]);
  const [initialLinkDataArray, setInitialLinkDataArray] = useState([]);
  const [initialModelDataState, setInitialModelDataState] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [initialDiagramDescription, setInitialDiagramDescription] =
    useState("");
  const [loadingInitialDiagram, setLoadingInitialDiagram] = useState(true);

  // Fetch Meter Configurations
  useEffect(() => {
    const fetchMeters = async () => {
      setLoadingMeters(true);
      try {
        // const { allMeterConfigrations } =
        //   await graphqlClient.request(GET_METER_INFO);
        // const meters = allMeterConfigrations?.nodes || [];
        // const validPaletteMeters = meters.filter(
        //   (m) => m.meterNo != null && m.label,
        // );
        const res = await getMeterRegisters({ limit: 500 });
        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        console.log("meterRegisters", res, rows);
        // console.log("allMeterConfigrations", meters, validPaletteMeters);
        setConfiguredMeters(rows);
      } catch (err) {
        console.error("ScadaPage: Error fetching meter configurations:", err);
        toast.error("Failed to fetch meter configurations.");
      } finally {
        setLoadingMeters(false);
      }
    };
    fetchMeters();
  }, []);

  // Fetch Initial SCADA Diagram Model
  const fetchInitialDiagram = useCallback(async () => {
    console.log("fetchInitialDiagram: Starting fetch...");
    setLoadingInitialDiagram(true);
    try {
      // Use the correct query structure based on your database schema
      const response = await fetch(
        `${configInit.appBaseUrl}/api/scada-diagrams`,
      ).then((r) => r.json());
      console.log("fetchInitialDiagram: Raw response:", response);

      // ✅ REST API returns an array
      let dbDiagramData = null;

      if (Array.isArray(response) && response.length > 0) {
        dbDiagramData =
          response.find(
            (diagram) => diagram.name === configInit.single_scada_diagram_name,
          ) || response[0]; // fallback to first
      }

      console.log("fetchInitialDiagram: Found diagram data:", dbDiagramData);

      if (dbDiagramData && dbDiagramData.diagram_model_json) {
        try {
          const parsedModel = dbDiagramData.diagram_model_json;

          console.log("fetchInitialDiagram: Parsed model:", parsedModel);

          const newNodeDataArray = parsedModel.nodeDataArray || [];
          const newLinkDataArray = parsedModel.linkDataArray || [];

          const newModelData = {
            id: dbDiagramData.id,
            name: dbDiagramData.name || configInit.single_scada_diagram_name,
            description:
              parsedModel.modelData?.description ||
              dbDiagramData.description ||
              "",
          };

          const newDescription =
            parsedModel.modelData?.description ||
            dbDiagramData.description ||
            "";

          console.log("fetchInitialDiagram: Setting new data:", {
            nodeCount: newNodeDataArray.length,
            linkCount: newLinkDataArray.length,
            modelData: newModelData,
          });

          setInitialNodeDataArray(newNodeDataArray);
          setInitialLinkDataArray(newLinkDataArray);
          setInitialModelDataState(newModelData);
          setInitialDiagramDescription(newDescription);
        } catch (parseError) {
          console.error(
            "ScadaPage: Error parsing diagram model JSON:",
            parseError,
          );
          toast.error("Failed to parse diagram data.");
          resetToEmptyState();
        }
      } else {
        console.log(
          "fetchInitialDiagram: No diagram data found, setting empty state",
        );
        resetToEmptyState();
      }
    } catch (error) {
      console.error("ScadaPage: Error fetching initial diagram:", error);
      console.error("Error details:", error.response?.errors || error);
      toast.error(
        "Failed to fetch diagram data: " +
          (error.response?.errors?.[0]?.message || error.message),
      );
      resetToEmptyState();
    } finally {
      setLoadingInitialDiagram(false);
      console.log("fetchInitialDiagram: Fetch completed");
    }
  }, []); // Remove SINGLE_SCADA_DIAGRAM_NAME from dependencies since it's imported

  // Helper function to reset to empty state
  const resetToEmptyState = useCallback(() => {
    setInitialNodeDataArray([]);
    setInitialLinkDataArray([]);
    setInitialModelDataState({
      id: null,
      name: configInit.single_scada_diagram_name,
      description: "",
    });
    setInitialDiagramDescription("");
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInitialDiagram();
  }, [fetchInitialDiagram]);

  // Memoize initialModelData to prevent unnecessary re-renders
  const initialModelData = useMemo(
    () => ({
      id: initialModelDataState.id,
      name: initialModelDataState.name,
      description: initialModelDataState.description,
    }),
    [
      initialModelDataState.id,
      initialModelDataState.name,
      initialModelDataState.description,
    ],
  );

  // Debug logging for state changes
  useEffect(() => {
    console.log("useScadaDataFetching: State updated:", {
      nodeCount: initialNodeDataArray.length,
      linkCount: initialLinkDataArray.length,
      modelData: initialModelDataState,
      loading: loadingInitialDiagram,
    });
  }, [
    initialNodeDataArray,
    initialLinkDataArray,
    initialModelDataState,
    loadingInitialDiagram,
  ]);

  return {
    configuredMeters,
    loadingMeters,
    initialNodeDataArray,
    initialLinkDataArray,
    initialModelData,
    initialDiagramDescription,
    loadingInitialDiagram,
    fetchInitialDiagram,
  };
};
