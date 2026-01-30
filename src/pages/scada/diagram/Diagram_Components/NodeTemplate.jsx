
import { GlobalDiagram } from "../GlobalDiagram.jsx";
import { createMeterNodeTemplate } from "./MeterNodeTemplate.jsx";
import { createGenericNodeTemplate } from "./GenericNodeTemplate.jsx";

export function addNodeTemplates(
  $,
  goInstance,
  myDiagram,
  onShapeDoubleClickCallback, // Expects (nodeKey, currentOutputRelay, currentInputRelay)
  onNodeMouseEnter,
  onNodeMouseLeave,
  isEditModeFromTemplate,
  handleToggleDevice // For output toggle
) {
  if (!myDiagram) {
    console.error("NodeTemplate.jsx: addNodeTemplates - myDiagram instance is null or undefined.");
    return;
  }

  if (myDiagram.nodeTemplateMap) {
    myDiagram.nodeTemplateMap.clear();
  } else {
    myDiagram.nodeTemplateMap = new goInstance.Map();
  }

  // Register MeterNode Template
  const meterNodeConfig = GlobalDiagram.nodeDefinitions?.meters?.[0];
  if (meterNodeConfig && meterNodeConfig.category === 'MeterNode') {
    console.log("MeterNode Template registration started.", myDiagram.nodeDataArray);
    const meterTemplate = createMeterNodeTemplate(
        $, 
        goInstance, 
        onNodeMouseEnter, 
        onNodeMouseLeave, 
        isEditModeFromTemplate
    );
    if (meterTemplate) {
      console.log("MeterNode Template created successfully.", meterTemplate, meterNodeConfig);
      myDiagram.nodeTemplateMap.add('MeterNode', meterTemplate);
    } else {
      console.error("NodeTemplate.jsx: createMeterNodeTemplate() returned null or undefined.");
    }
  }

  // Register Generic Shape Templates
  if (GlobalDiagram.nodeDefinitions && Array.isArray(GlobalDiagram.nodeDefinitions.shapes)) {
    GlobalDiagram.nodeDefinitions.shapes.forEach((nodeConfig) => {
      if (!nodeConfig) return;
      const { category, shape,  img } = nodeConfig;

      if (!category || typeof category !== 'string') return;
      if (category === 'MeterNode') return; // Already handled

      if (shape && typeof shape === 'string') {
        const genericTemplate = createGenericNodeTemplate(
          shape,
          category,
          $,
          goInstance,
          onShapeDoubleClickCallback, // Passed directly
          onNodeMouseEnter,
          onNodeMouseLeave,
          img,
          isEditModeFromTemplate,
          handleToggleDevice // Passed directly for output toggle
        );

        if (genericTemplate) {
          myDiagram.nodeTemplateMap.add(category, genericTemplate);
        } else {
          console.error(`NodeTemplate.jsx: createGenericNodeTemplate() returned null for category '${category}'.`);
        }
      }
    });
  }
}
