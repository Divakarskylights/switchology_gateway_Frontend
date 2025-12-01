import React, { useMemo, useRef, useEffect } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useDrop } from 'react-dnd';
import DndPalette, { ItemTypes } from './components/DndPalette';

function colorForState(state) {
  return state ? '#4caf50' : '#e0e0e0';
}

export default function PLCDiagram({ inputs, logic, outputs, states, onModelChange, nodeDataArrayOverride, linkDataArrayOverride, onNodeDoubleClick, inputCount = 7, outputCount = 7, inputPins, outputPins, isReadOnly = false }) {
  const { inputState = {}, gateState = {}, outputState = {} } = states || {};
  const diagramRef = useRef(null);
  const diagramDivRef = useRef(null);

  const modelData = useMemo(() => {
    if (nodeDataArrayOverride && linkDataArrayOverride) {
      const coloredNodes = nodeDataArrayOverride.map(n => {
        let color = '#e0e0e0';
        if (n.category === 'io') {
          if (n.ioType === 'input') color = colorForState(inputState[n.key]);
          if (n.ioType === 'output') color = colorForState(outputState[n.key]);
        } else if (n.category === 'gate') {
          color = colorForState(gateState[n.key]);
        }
        return { ...n, color };
      });
      const linksWithKeys = linkDataArrayOverride.map((l, idx) => ({ ...l, key: l.key ?? `UL_${idx}` }));
      return { nodeDataArray: coloredNodes, linkDataArray: linksWithKeys };
    }
    const nodeDataArray = [];
    const linkDataArray = [];

    // Positioning
    const inputX = 0;
    const gateX = 200;
    const outputX = 400;
    const vGap = 80;

    inputs.forEach((i, idx) => {
      nodeDataArray.push({ key: i.id, category: 'io', ioType: 'input', name: i.name || i.id, color: colorForState(inputState[i.id]), loc: `${inputX} ${idx * vGap}` });
    });

    logic.forEach((g, idx) => {
      nodeDataArray.push({ key: g.id, category: 'gate', gateType: g.type, name: g.type, color: colorForState(gateState[g.id]), loc: `${gateX} ${idx * vGap}` });
      (g.inputs || []).forEach((inp, iidx) => {
        const lkey = `L_${inp}_${g.id}_${iidx}`;
        linkDataArray.push({ key: lkey, from: inp, to: g.id });
      });
    });

    outputs.forEach((o, idx) => {
      nodeDataArray.push({ key: o.id, category: 'io', ioType: 'output', name: o.id, color: colorForState(outputState[o.id]), loc: `${outputX} ${idx * vGap}` });
      const lkey = `L_${o.source}_${o.id}`;
      linkDataArray.push({ key: lkey, from: o.source, to: o.id });
    });

    return { nodeDataArray, linkDataArray };
  }, [inputs, logic, outputs, inputState, gateState, outputState]);

  const initDiagram = () => {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      'undoManager.isEnabled': false,
      isReadOnly: isReadOnly,
      initialContentAlignment: go.Spot.Center,
      allowDrop: !isReadOnly,
      allowMove: !isReadOnly,
      initialAutoScale: go.AutoScale.Uniform,
    });
    diagramRef.current = diagram;

    diagram.grid = $(go.Panel, 'Grid',
      $(go.Shape, 'LineH', { stroke: '#eeeeee', strokeWidth: 1, interval: 1 }),
      $(go.Shape, 'LineV', { stroke: '#eeeeee', strokeWidth: 1, interval: 1 }),
      $(go.Shape, 'LineH', { stroke: '#dddddd', strokeWidth: 1, interval: 5 }),
      $(go.Shape, 'LineV', { stroke: '#dddddd', strokeWidth: 1, interval: 5 })
    );
    diagram.grid.gridCellSize = new go.Size(10, 10);
    diagram.grid.visible = true;
    diagram.toolManager.draggingTool.isGridSnapEnabled = true;

    // Ensure the underlying model used by gojs-react has link keys configured
    const model = new go.GraphLinksModel();
    model.linkKeyProperty = 'key';
    model.linkFromPortIdProperty = 'fromPort';
    model.linkToPortIdProperty = 'toPort';
    // Unique key generators
    model.makeUniqueKeyFunction = (m, data) => {
      let k = data.key || 1;
      while (m.findNodeDataForKey(k)) k++;
      return k;
    };

    model.makeUniqueLinkKeyFunction = (m, data) => {
      let k = data && data.key ? data.key : 1;
      while (m.findLinkDataForKey(k)) k++;
      return k;
    };
    diagram.model = model;

    diagram.nodeTemplateMap.add('io',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, selectable: true, movable: true },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        // Body (not a port) so dragging moves the node
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle', { strokeWidth: 0 }, new go.Binding('fill', 'color')),
          $(go.TextBlock, { margin: 8, font: '12px sans-serif' }, new go.Binding('text', 'name'))
        ),
        // Small port for linking: right for input (output port), left for output (input port)
        $(go.Shape, 'Circle',
          {
            name: 'PORT',
            desiredSize: new go.Size(8, 8),
            fill: '#9e9e9e', stroke: null,
            alignment: go.Spot.Right,
            portId: 'out', fromLinkable: true, toLinkable: false, cursor: 'pointer'
          },
          new go.Binding('visible', 'ioType', t => t === 'input')
        ),
        $(go.Shape, 'Circle',
          {
            name: 'PORTIN',
            desiredSize: new go.Size(8, 8),
            fill: '#9e9e9e', stroke: null,
            alignment: go.Spot.Left,
            portId: 'in', fromLinkable: false, toLinkable: true, cursor: 'pointer'
          },
          new go.Binding('visible', 'ioType', t => t === 'output')
        )
      )
    );

    diagram.nodeTemplateMap.add('gate',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center, selectable: true, movable: true, doubleClick: (e, node) => { if (onNodeDoubleClick) onNodeDoubleClick(node.data); } },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        // Body (not a port)
        $(go.Panel, 'Auto',
          $(go.Shape, 'Rectangle', { strokeWidth: 0 }, new go.Binding('fill', 'color')),
          $(go.TextBlock, { margin: 8, font: '12px sans-serif' }, new go.Binding('text', 'name'))
        ),
        // Ports: left input, right output
        $(go.Shape, 'Circle', { desiredSize: new go.Size(8, 8), fill: '#9e9e9e', stroke: null, alignment: go.Spot.Left,
          portId: 'in', fromLinkable: false, toLinkable: true, cursor: 'pointer' }),
        $(go.Shape, 'Circle', { desiredSize: new go.Size(8, 8), fill: '#9e9e9e', stroke: null, alignment: go.Spot.Right,
          portId: 'out', fromLinkable: true, toLinkable: false, cursor: 'pointer' })
      )
    );

    diagram.linkTemplate =
      $(go.Link, { routing: go.Link.AvoidsNodes, curve: go.Link.Bezier },
        $(go.Shape, { stroke: '#9e9e9e' }),
        $(go.Shape, { toArrow: 'Standard', stroke: '#9e9e9e', fill: '#9e9e9e' })
      );

    // Enforce single instance per IO when dropping from palette
    diagram.addDiagramListener('ExternalObjectsDropped', (e) => {
      const toRemove = [];
      e.subject.each(p => {
        const d = p && p.data;
        if (d && d.category === 'io' && d.key != null) {
          const count = (diagram.model.nodeDataArray || []).filter(nd => nd.key === d.key).length;
          if (count > 1) toRemove.push(d);
        }
      });
      if (toRemove.length) {
        diagram.model.startTransaction('remove-duplicate-io');
        toRemove.forEach(d => diagram.model.removeNodeData(d));
        diagram.model.commitTransaction('remove-duplicate-io');
      }
    });

    // Notify external on transactions end with full arrays (including loc)
    if (onModelChange) {
      diagram.addModelChangedListener(e => {
        if (e.isTransactionFinished) {
          const m = diagram.model;
          const nodes = (m.nodeDataArray || []).map(n => ({
            key: n.key,
            category: n.category,
            gateType: n.gateType,
            ioType: n.ioType,
            name: n.name,
            loc: n.loc,
            params: n.params
          }));
          const links = (m.linkDataArray || []).map(l => ({ key: l.key, from: l.from, to: l.to }));
          const firstSel = diagram.selection.first();
          const selectedKey = firstSel && firstSel.data ? firstSel.data.key : null;
          onModelChange({ nodeDataArray: nodes, linkDataArray: links, selectedKey });
        }
      });
    }

    return diagram;
  };

  useEffect(() => {
    const d = diagramRef.current;
    if (d) {
      d.isReadOnly = isReadOnly;
      d.allowMove = !isReadOnly;
      d.allowDrop = !isReadOnly;
      d.allowSelect = !isReadOnly;
      d.allowCopy = !isReadOnly;
      d.allowDelete = !isReadOnly;
      d.allowLink = !isReadOnly;
      d.allowRelink = !isReadOnly;
      d.allowTextEdit = !isReadOnly;
      if (d.toolManager) {
        if (d.toolManager.draggingTool) d.toolManager.draggingTool.isEnabled = !isReadOnly;
        if (d.toolManager.linkingTool) d.toolManager.linkingTool.isEnabled = !isReadOnly;
        if (d.toolManager.relinkingTool) d.toolManager.relinkingTool.isEnabled = !isReadOnly;
        if (d.toolManager.dragSelectingTool) d.toolManager.dragSelectingTool.isEnabled = !isReadOnly;
      }
    }
  }, [isReadOnly]);

  // React DnD drop target over the diagram
  const [, dropRef] = useDrop(
    () => ({
      accept: ItemTypes.PALETTE_ITEM,
      drop: (item, monitor) => {
        if (isReadOnly) return;
        const client = monitor.getClientOffset();
        const div = diagramDivRef.current;
        const diagram = diagramRef.current;
        if (!client || !div || !diagram) return;
        const rect = div.getBoundingClientRect();
        const viewPt = new go.Point(client.x - rect.left, client.y - rect.top);
        const docPt = diagram.transformViewToDoc(viewPt);
        const cell = diagram.grid ? diagram.grid.gridCellSize : new go.Size(20, 20);
        const snapped = new go.Point(
          Math.round(docPt.x / cell.width) * cell.width,
          Math.round(docPt.y / cell.height) * cell.height
        );
        const m = diagram.model;

        // Prevent duplicate IOs
        if (item.category === 'io') {
          const key = item.key;
          if (m.findNodeDataForKey(key)) return;
          const data = { key, category: 'io', ioType: item.ioType, name: item.name, loc: `${snapped.x} ${snapped.y}` };
          diagram.startTransaction('add-io');
          m.addNodeData(data);
          diagram.commitTransaction('add-io');
          return;
        }
        if (item.category === 'gate') {
          const data = { key: undefined, category: 'gate', gateType: item.gateType, name: item.name, params: item.params || {}, loc: `${snapped.x} ${snapped.y}` };
          diagram.startTransaction('add-gate');
          m.addNodeData(data);
          diagram.commitTransaction('add-gate');
        }
      }
    }),
    [isReadOnly]
  );

  const model = useMemo(() => {
    const m = new go.GraphLinksModel();
    m.linkFromPortIdProperty = 'fromPort';
    m.linkToPortIdProperty = 'toPort';
    m.linkKeyProperty = 'key';
    m.nodeDataArray = modelData.nodeDataArray;
    m.linkDataArray = modelData.linkDataArray;
    return m;
  }, [modelData]);

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {!isReadOnly && (
        <DndPalette inputCount={inputCount} outputCount={outputCount} inputPins={inputPins} outputPins={outputPins} />
      )}
      <div ref={node => { diagramDivRef.current = node; dropRef(node); }} style={{ flex: 1, height: '100vh', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <ReactDiagram
          initDiagram={initDiagram}
          divClassName="plc-diagram"
          style={{ width: '100%', height: '100%' }}
          nodeDataArray={model.nodeDataArray}
          linkDataArray={model.linkDataArray}
          onModelChange={onModelChange}
        />
      </div>
    </div>
  );
}