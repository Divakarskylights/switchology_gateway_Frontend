export const calculateNextPosition = (newNode, group, diagram) => {
    if (!group) return { x: 0, y: 0 };

    const groupBounds = group.actualBounds;
    const groupX = groupBounds.x;
    const groupY = groupBounds.y;
    const groupHeight = groupBounds.height; // Get the height limit of the group

    // Get all nodes inside the group
    const groupNodes = diagram.model.nodeDataArray.filter(node => node.group === group.key);

    if (groupNodes.length === 0) {
        // First node in the group → start from top-left
        return { x: groupX, y: groupY };
    }

    // Sort nodes by X first (left to right), then by Y (top to bottom)
    groupNodes.sort((a, b) => {
        const [ax, ay] = a.loc.split(" ").map(parseFloat);
        const [bx, by] = b.loc.split(" ").map(parseFloat);

        if (ax !== bx) return ax - bx; // Sort left-to-right
        return ay - by; // Sort top-to-bottom if same column
    });
        
    const lastNode = groupNodes[groupNodes.length - 1];
    const [lastX, lastY] = lastNode.loc.split(" ").map(parseFloat);

    // Get the latest width and height from the existing nodes
    const lastNodeData = diagram.findNodeForKey(lastNode.key);
    const nodeWidth = lastNodeData ? lastNodeData.actualBounds.width : parseFloat(newNode.minWidth);
    const nodeHeight = lastNodeData ? lastNodeData.actualBounds.height : parseFloat(newNode.minHeight);

    // Determine next position
    let newX = lastX;
    let newY = lastY + nodeHeight; // Move down first
    // console.log("sdjhjs",lastY ,nodeHeight,  lastNodeData.actualBounds.height, parseFloat(newNode.minHeight));

    if (newY + nodeHeight > groupY + groupHeight) {
        // If bottom is reached, move to next column
        newY = groupY;
        newX += nodeWidth;
    }

    return { x: newX, y: newY };
};
