import { GlobalDiagram } from "../GlobalDiagram";

export const GroupInsideTemplate = ($, go) => {
    return $(go.Group, "Vertical", {
        resizable: true,
        selectionAdorned: false,
        resizeObjectName: "PANEL",
        resizeAdornmentTemplate: baseFrameResizeAdornment($, go),
        computesBoundsAfterDrag: true,
        handlesDragDropForMembers: true,
        mouseDrop: finishDrop,
        mouseDragEnter: (e, grp, prev) => { grp.isHighlighted = true; },
        mouseDragLeave: (e, grp, prev) => { grp.isHighlighted = false; },
    },
        // First panel - Main frame (Rectangle)
        $(go.Panel, "Auto", {
            name: "PANEL",
            width: GlobalDiagram.InsideTemplate.minWidth,
            height: GlobalDiagram.InsideTemplate.minHeight
        },
            $(go.Shape, "Rectangle", {
                fill: "rgba(255,255,255,0.2)",
                stroke: "black",
                strokeWidth: 1,
                parameter1: 14,
            })
        ),

        // Second panel - TextBlock and Shapes (Circles)
        $(go.Panel, "Auto", { stretch: go.Stretch.Horizontal },
            $(go.TextBlock, {
                name: "TEXTBLOCK",
                background: 'black',
                stroke: 'white',
                stretch: go.Stretch.Horizontal,
                textAlign: 'center',
                verticalAlignment: go.Spot.Center,
                minSize: new go.Size(GlobalDiagram.InsideTemplate.minWidth, 100),
                font: 'bold 40px sans-serif',
            },
                new go.Binding("text", "key", (key) => `Base Frame ${key}`).ofObject()
            ),
            $(go.Shape, "Circle", {
                desiredSize: new go.Size(30, 30),
                fill: "white",
                margin: new go.Margin(0, 10, 30, 15),
                alignment: go.Spot.BottomLeft,
            }),
            $(go.Shape, "Circle", {
                desiredSize: new go.Size(30, 30),
                fill: "white",
                margin: new go.Margin(0, 10, 30, 15), //top right bottom left
                alignment: go.Spot.BottomRight,
            })
        ),

        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    );
};
function finishDrop(e, grp) {  
    const diagram = grp.diagram;
    if (!diagram) return;
    diagram.commit(d => {
        e.diagram.selection.each(part => {
            if (part instanceof go.Node) {
                if (part.containingGroup !== grp) {
                    grp.addMembers([part]); // ✅ Ensures node stays inside
                }
            }
        });
    }, "Move node into group");
}
const baseFrameResizeAdornment = ($, go) => {
    let resizeHandleSize = 35;

    return $(
        go.Adornment,
        "Spot",
        $(go.Placeholder),

        // Top middle resize handle
        $(go.Panel, "Vertical",
            { alignment: go.Spot.Top, alignmentFocus: new go.Spot(0.5, 0.85) },
            $(go.TextBlock,
                {
                    font: "bold 40px sans-serif",
                    alignment: go.Spot.Bottom,
                    stroke: "blue",
                    alignmentFocus: go.Spot.Top,
                },
                new go.Binding("text", "", function (ad) {
                    const width = ad.adornedPart.resizeObject.width;
                    return width;
                }).ofObject()
            ),
            $(go.Shape, "RoundedRectangle", {
                desiredSize: new go.Size(resizeHandleSize, resizeHandleSize),
                fill: "black",
                stroke: "dodgerblue",
                cursor: "n-resize",
                width: 20,
                height: 20,
            })
        ),

        // Right middle resize handle
        $(go.Panel, "Horizontal",
            { alignment: go.Spot.Right, alignmentFocus: new go.Spot(0.10, 0.5) }, // alignment focuse must be in center but if i put center here its not sitting properly
            $(go.Shape, "RoundedRectangle", {
                desiredSize: new go.Size(resizeHandleSize, resizeHandleSize),
                fill: "black",
                stroke: "dodgerblue",
                cursor: "e-resize",
                width: 20,
                height: 20,
            }),

            $(go.TextBlock,
                {
                    font: "bold 40px sans-serif",
                    alignment: go.Spot.Top,
                    stroke: "red",
                    alignmentFocus: go.Spot.Bottom,
                },
                new go.Binding("text", "", function (ad) {
                    const height = ad.adornedPart.resizeObject.height;
                    // Adjust for multiples of 60
                    // this is added because it was showing total of 1200 + 60 including the Base frame(60) in the bottom 
                    return height;
                }).ofObject()
            )
        ),
    );
};
