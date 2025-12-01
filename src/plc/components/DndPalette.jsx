import React from 'react';
import { useDrag } from 'react-dnd';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip } from '@mui/material';

const ItemTypes = {
  PALETTE_ITEM: 'PALETTE_ITEM'
};

function PaletteItem({ item }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PALETTE_ITEM,
    item,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [item]);
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab', padding: 3, border: '1px solid #e0e0e0', borderRadius: 6, marginBottom: 1, background: '#fafafa' }}>
      {item.name}
    </div>
  );
}

export default function DndPalette({ inputCount = 7, outputCount = 7, inputPins, outputPins }) {

  const gates = [
    { category: 'gate', gateType: 'AND', name: 'AND',help: 'True only if all inputs are true' },
    { category: 'gate', gateType: 'OR', name: 'OR',help: 'True if at least one input is true' },
    { category: 'gate', gateType: 'NOT', name: 'NOT',help: 'Inverts the input signal' },
    { category: 'gate', gateType: 'NOR', name: 'NOR',help: 'True if no inputs are true (NOT-OR)' },
    { category: 'gate', gateType: 'XOR', name: 'XOR',help: 'True if an odd number of inputs are true' },
    { category: 'gate', gateType: 'TON', name: 'TON', params: { delay: 3000 },help: 'On-delay timer: output turns true after a delay when input stays true' },
    { category: 'gate', gateType: 'TOF', name: 'TOF', params: { delay: 3000 },help: 'Off-delay timer: output remains true for a delay after input turns false' },
    { category: 'gate', gateType: 'SET', name: 'SET',help: 'Latch output to true when triggered' },
    { category: 'gate', gateType: 'RESET', name: 'RESET',help: 'Reset a latched output to false' },
    { category: 'gate', gateType: 'EDGE_RISING', name: 'EDGE_RISING',help: 'Detect rising edge (false → true) of a signal' },
    { category: 'gate', gateType: 'EDGE_FALLING', name: 'EDGE_FALLING',help: 'Detect falling edge (true → false) of a signal' },
    { category: 'gate', gateType: 'COMPARE', name: 'COMPARE', params: { operator: '==', value: 1 },help: 'Compare two values with an operator (==, >, <, etc.)' },
  ];
  const inputs = (Array.isArray(inputPins) && inputPins.length > 0)
    ? inputPins.map(pin => ({ key: `IN${pin}`, category: 'io', ioType: 'input', name: `IN${pin}` }))
    : Array.from({ length: inputCount }, (_, i) => ({ key: `IN${i+1}`, category: 'io', ioType: 'input', name: `IN${i+1}` }));
  const outputs = (Array.isArray(outputPins) && outputPins.length > 0)
    ? outputPins.map(pin => ({ key: `OUT${pin}`, category: 'io', ioType: 'output', name: `OUT${pin}` }))
    : Array.from({ length: outputCount }, (_, i) => ({ key: `OUT${i+1}`, category: 'io', ioType: 'output', name: `OUT${i+1}` }));

  return (
    <div style={{ width: '15%', height: '100vh',overflow: 'auto' }}>
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary sx={{ p: 0 }} expandIcon={<span style={{ fontSize: 14 }}>▼</span>}>
          <Typography fontWeight={600}>Gates</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {gates.map((g, idx) => (
            <Tooltip key={`G_${idx}`} title={g.help || g.name} arrow placement="right">
              <div>
                <PaletteItem item={g} />
              </div>
            </Tooltip>
          ))}
        </AccordionDetails>
      </Accordion>
      <Divider sx={{ my: 1 }} />
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary sx={{ p: 0 }} expandIcon={<span style={{ fontSize: 14 }}>▼</span>}>
          <Typography fontWeight={600}>Inputs</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {inputs.map((i) => (
            <PaletteItem key={i.key} item={i} />
          ))}
        </AccordionDetails>
      </Accordion>
      <Divider sx={{ my: 1 }} />
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary sx={{ p: 0 }} expandIcon={<span style={{ fontSize: 14 }}>▼</span>}>
          <Typography fontWeight={600}>Outputs</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {outputs.map((o) => (
            <PaletteItem key={o.key} item={o} />
          ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export { ItemTypes };
