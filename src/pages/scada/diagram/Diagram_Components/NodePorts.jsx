
// This is for the circle port through which the link is created (used for both generic and meter nodes)
function makePort($, goInstance, name, spot, isEditModeFromTemplate) {
    return $(goInstance.Shape, "Circle",
        {
            fill: "transparent",
            stroke: isEditModeFromTemplate ? "darkgray" : "transparent",
            strokeWidth: 1,
            desiredSize: new goInstance.Size(8, 8),
            alignment: spot,
            alignmentFocus: spot,
            portId: name,
            fromSpot: spot,
            toSpot: spot,
            fromLinkable: isEditModeFromTemplate,
            toLinkable: isEditModeFromTemplate,
            cursor: isEditModeFromTemplate ? "pointer" : "default",
            mouseEnter: (e, port) => {
                if (isEditModeFromTemplate && port.part.diagram && !port.part.diagram.isReadOnly) {
                    port.stroke = "dodgerblue";
                }
            },
            mouseLeave: (e, port) => {
                if (isEditModeFromTemplate) {
                    port.stroke = "darkgray";
                }
            }
        }
    );
}

// Function to create all ports for a node
export function createNodePorts($, goInstance, isEditModeFromTemplate) {
    // Create ports for all sides
    return [
        makePort($, goInstance, "T", goInstance.Spot.Top, isEditModeFromTemplate),
        makePort($, goInstance, "B", goInstance.Spot.Bottom, isEditModeFromTemplate),
        makePort($, goInstance, "L", goInstance.Spot.Left, isEditModeFromTemplate),
        makePort($, goInstance, "R", goInstance.Spot.Right, isEditModeFromTemplate)
    ];
} 