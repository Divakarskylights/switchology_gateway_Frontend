import * as go from "gojs";

export function createPalette(diagram) {
    const shapeConfigurations = {
        Rectangle1: createNodeTemplate("ACB Compartment"),
        Rectangle2: createNodeTemplate("Stand-Alone Sec. Compartment"),
        Rectangle3: createNodeTemplate("Hinged Door (For Distribution Section Compartment)"),
        Rectangle4: createNodeTemplate("Bolted Cover (For Distribution Section Compartment)"),
        Rectangle5: createNodeTemplate("Distribution Sec. Compartment"),
        Rectangle6: createNodeTemplate("Busbar Compartment"),
        HorizontalLine: createNodeTemplate("Horizontal Busbar System"),
        VerticalLine: createNodeTemplate("Vertical Busbar System"),
        Rectangle7: createNodeTemplate("Cable Compartment"),
        Rectangle8: createNodeTemplate("Adapter Cubicle"),
        InsideTemplate: createNodeTemplate("Base Frame"),
    };

    // Function to create node templates
    function createNodeTemplate(text) {
        return new go.Node('Auto')
            .add(
                new go.Panel("Auto", { width: 200, height: 60, margin: new go.Margin(2) })
                    .add(
                        new go.Shape("RoundedRectangle", {
                            fill: "	#FFFFF0",
                            strokeWidth: 0,
                            spot1: go.Spot.TopLeft,
                            spot2: go.Spot.BottomRight,
                            parameter1: 10
                        }),
                        new go.TextBlock(text, {
                            font: "bold 10pt Roboto",
                            margin: new go.Margin(0, 0, 0, 10),
                            alignment: go.Spot.Left,
                            stroke: 'black',
                            width: 200
                        })
                    )
            );
    }


    const myPalette = new go.Palette('myPaletteDiv', {
        nodeTemplateMap: diagram.nodeTemplateMap, // Using the diagram's node template map
        groupTemplateMap: diagram.groupTemplateMap,
        scale: 0.9,
    });

    // Add all templates to nodeTemplateMap
    Object.entries(shapeConfigurations).forEach(([key, template]) => {
        myPalette.nodeTemplateMap.add(key, template);
    });

    // Define the model for the palette
    myPalette.model = new go.GraphLinksModel([
        { isGroup: true, text: 'H Group', horiz: true },
        { isGroup: true, text: 'V Group', horiz: false },
        { category: "Rectangle6", text: "Busbar Compartment" },
        { category: "Rectangle1", text: "ACB Compartment" },
        { category: "Rectangle2", text: "Stand-Alone Sec. Compartment" },
        { category: "Rectangle5", text: "Distribution Sec. Compartment" },
        { category: "Rectangle3", text: "Hinged Door" },
        { category: "Rectangle4", text: "Bolted Cover" },
        { category: "Rectangle7", text: "Cable Compartment" },
        { category: "HorizontalLine", text: "Horizontal Busbar System" },
        { category: "VerticalLine", text: "Vertical Busbar System" },
        { category: "Rectangle8", text: "Adapter Cubicle" },
        { category: "InsideTemplate", text: "Base Frame" }
    ]);

    return myPalette;
}

// 🔹 Export Diagram Template Map (DIFFERENT SHAPES when dropped)
export function createDiagramTemplateMap() {
    const diagramTemplateMap = new go.Map("string", go.Node);
    diagramTemplateMap.add("Rectangle1", createHexagonNode("ACB Compartment"));
    diagramTemplateMap.add("Rectangle2", createTriangleNode("Stand-Alone Sec. Compartment"));
    diagramTemplateMap.add("Rectangle3", createEllipseNode("Hinged Door"));
    diagramTemplateMap.add("Rectangle4", createRoundedRectangleNode("Bolted Cover"));
    diagramTemplateMap.add("Rectangle5", createRectangleNode("Distribution Sec. Compartment"));
    diagramTemplateMap.add("Rectangle6", createEllipseNode("Busbar Compartment"));
    diagramTemplateMap.add("Rectangle7", createHexagonNode("Cable Compartment"));
    diagramTemplateMap.add("HorizontalLine", createRectangleNode("Horizontal Busbar System"));
    diagramTemplateMap.add("VerticalLine", createRoundedRectangleNode("Vertical Busbar System"));
    diagramTemplateMap.add("Rectangle8", createHexagonNode("Adapter Cubicle"));
    diagramTemplateMap.add("InsideTemplate", createTriangleNode("Base Frame"));

    return diagramTemplateMap;
}
