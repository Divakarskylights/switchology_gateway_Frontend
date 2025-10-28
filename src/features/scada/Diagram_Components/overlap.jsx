export function isUnoccupied(r, node) {
    const diagram = node.diagram;
  
    function navig(obj) {
      const part = obj.part;
      if (part === node) return null;
      if (part instanceof go.Link) return null;
      if (part.isMemberOf(node)) return null;
      if (node.isMemberOf(part)) return null;
      return part;
    }
  
    const lit = diagram.layers;
    while (lit.next()) {
      const lay = lit.value;
      if (lay.isTemporary) continue;
      if (lay.findObjectsIn(r, navig, null, true).count > 0) return false;
    }
    return true;
  }
  
  export function avoidNodeOverlap(node, pt, gridpt) {
    if (node.diagram instanceof go.Palette) return gridpt;
  
    const bnds = node.actualBounds;
    const loc = node.location;
  
    const r = new go.Rect(gridpt.x - (loc.x - bnds.x), gridpt.y - (loc.y - bnds.y), bnds.width, bnds.height);
    r.inflate(-0.5, -0.5);
  
    if (!(node.diagram.currentTool instanceof go.DraggingTool) && (!node._temp || !node.layer.isTemporary)) {
      node._temp = true;
      while (!isUnoccupied(r, node)) {
        r.x += 10;
        r.y += 2;
      }
      r.inflate(0.5, 0.5);
      return new go.Point(r.x - (loc.x - bnds.x), r.y - (loc.y - bnds.y));
    }
  
    if (isUnoccupied(r, node)) return gridpt;
    return loc;
  }
  