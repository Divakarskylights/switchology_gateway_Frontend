import { configInit } from '../../../components/layout/globalvariable';
import grafData from '../../../config/dashboardData.json'

// Utility to generate a UID
const generateUID = () => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const random = Math.random().toString(36).substring(2, 6); // Get 4 random characters
  return (timestamp + random).substring(0, 10); // Combine and ensure 10 characters
};

const generateJsonConfig = (meter, intervalVal, setOriginalJsonConfig) => {
  if (!meter) return {};

  const getMeterName = `${meter.device}_id${meter.meter_no}`;
  // Store original config for change tracking
  if (setOriginalJsonConfig) setOriginalJsonConfig(JSON.stringify(grafData));

  // Create a deep copy of grafData to avoid modifying the original
  const newJsonConfig = JSON.parse(JSON.stringify(grafData));

  // Update the JSON configuration with meter-specific values
  newJsonConfig.uid = generateUID();
  newJsonConfig.title = getMeterName;

  // Update tags array if it exists
  if (Array.isArray(newJsonConfig.tags)) {
    newJsonConfig.tags = ['VIEW'];
  }

  // Update panels
  if (Array.isArray(newJsonConfig.panels)) {
    newJsonConfig.panels = newJsonConfig.panels.map((panel) => {
      if (panel.options?.content?.includes('switchologyTranspWhiteLttr.png') && panel.options?.mode === 'html') {
        // Extract meter ID from getMeterName (everything after _)
        const meterId = getMeterName.split('_')[1] || '';
        return {
          ...panel,
          options: {
            ...panel.options,
            content: `<img src="https://skylightsenergy.s3.ap-south-1.amazonaws.com/switchologyTranspWhiteLttr.png" alt="skylights" style="width:210px;height:70px"><br>\r\nENERGY MANAGEMENT SOLUTIONS, <BR>\r\nMETER NAME: ${getMeterName}<BR>\r\nMETER ID: ${meterId}, SAMPLING INTERVAL: ${intervalVal} <BR>\r\nCLIENT : ${configInit.orgName}</b>`,
            mode: 'html'
          }
        };
      }
      if (panel.title === "DEVICE STATUS" && panel.transformations) {
        return {
          ...panel,
          title: panel.title ? panel.title.replace(/SKYMTR/g, meter?.label) : panel.title,
          description: panel.description ? panel.description.replace(/SKYMTR/g, meter?.label) : panel.description,
          transformations: panel.transformations.map(transform => ({
            ...transform,
            options: {
              ...transform.options,
              binary: {
                ...transform.options.binary,
                left: `${getMeterName}.last`,
                right: `${getMeterName}.last`
              }
            }
          })),
          targets: panel.targets?.map((target) => ({
            ...target,
            measurement: getMeterName,
            alias: target.alias ? target.alias.replace(/SKYMTR/g, meter?.label) : target.alias
          }))
        };
      }
      return {
        ...panel,
        title: panel.title ? panel.title.replace(/SKYMTR/g, meter?.label) : panel.title,
        description: panel.description ? panel.description.replace(/SKYMTR/g, meter?.label) : panel.description,
        targets: panel.targets?.map((target) => ({
          ...target,
          measurement: getMeterName,
          alias: target.alias ? target.alias.replace(/SKYMTR/g, meter?.label) : target.alias
        }))
      };
    });
  }

  return newJsonConfig;
};

export default generateJsonConfig;
