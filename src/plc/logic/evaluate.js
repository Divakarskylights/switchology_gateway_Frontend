export function evaluatePlc(model, runtime) {
  const { inputs, logic, outputs } = model;

  const inputState = {};
  inputs.forEach(i => { inputState[i.id] = !!i.state; });

  const gateState = {};
  const timers = (runtime && runtime.timers) || {};
  const edges = (runtime && runtime.edges) || {};
  const latches = (runtime && runtime.latches) || {};
  const now = Date.now();
  const evalGate = (gateId) => {
    if (gateState.hasOwnProperty(gateId)) return gateState[gateId];
    const gate = logic.find(g => g.id === gateId);
    if (!gate) {
      // Could be a direct reference to an input or another output
      return inputState[gateId] ?? false;
    }
    const vals = (gate.inputs || []).map(ref => gateState.hasOwnProperty(ref)
      ? gateState[ref]
      : (logic.some(g => g.id === ref) ? evalGate(ref) : (inputState[ref] ?? false))
    );

    let result = false;
    switch ((gate.type || '').toUpperCase()) {
      case 'AND':
        result = vals.every(Boolean);
        break;
      case 'OR':
        result = vals.some(Boolean);
        break;
      case 'NOT':
        result = !vals[0];
        break;
      case 'NAND':
        result = !vals.every(Boolean);
        break;
      case 'NOR':
        result = !vals.some(Boolean);
        break;
      case 'XOR':
        result = vals.filter(Boolean).length % 2 === 1;
        break;
      case 'EDGE_RISING': {
        const input = !!vals[0];
        const prev = !!edges[gateId];
        result = input && !prev;
        edges[gateId] = input;
        break;
      }
      case 'EDGE_FALLING': {
        const input = !!vals[0];
        const prev = !!edges[gateId];
        result = !input && prev;
        edges[gateId] = input;
        break;
      }
      case 'SET': {
        const input = !!vals[0];
        const state = latches.hasOwnProperty(gateId) ? !!latches[gateId] : false;
        const next = input ? true : state;
        latches[gateId] = next;
        result = next;
        break;
      }
      case 'RESET': {
        const input = !!vals[0];
        const state = latches.hasOwnProperty(gateId) ? !!latches[gateId] : false;
        const next = input ? false : state;
        latches[gateId] = next;
        result = next;
        break;
      }
      case 'COMPARE': {
        const inputNum = Number(vals[0] ? 1 : 0);
        const op = (gate.params && gate.params.operator) || '==';
        const target = (gate.params && typeof gate.params.value !== 'undefined') ? Number(gate.params.value) : 1;
        switch (op) {
          case '==': result = inputNum === target; break;
          case '!=': result = inputNum !== target; break;
          case '>': result = inputNum > target; break;
          case '<': result = inputNum < target; break;
          case '>=': result = inputNum >= target; break;
          case '<=': result = inputNum <= target; break;
          default: result = false;
        }
        break;
      }
      case 'TON': {
        const input = !!vals[0];
        const delay = (gate.params && typeof gate.params.delay === 'number') ? gate.params.delay : 3000;
        const t = timers[gateId] || { lastInput: false, startTs: null, output: false };
        if (input) {
          if (!t.lastInput) {
            t.startTs = now;
          }
          t.output = now - (t.startTs || now) >= delay;
        } else {
          t.startTs = null;
          t.output = false;
        }
        t.lastInput = input;
        timers[gateId] = t;
        result = t.output;
        break;
      }
      case 'TOF': {
        const input = !!vals[0];
        const delay = (gate.params && typeof gate.params.delay === 'number') ? gate.params.delay : 3000;
        const t = timers[gateId] || { lastInput: false, startTs: null, output: false };
        if (input) {
          t.output = true;
          t.startTs = null;
        } else {
          if (t.lastInput) {
            t.startTs = now;
          }
          if (t.startTs != null) {
            t.output = (now - t.startTs) < delay;
          } else {
            t.output = false;
          }
        }
        t.lastInput = input;
        timers[gateId] = t;
        result = t.output;
        break;
      }
      default:
        result = false;
    }
    gateState[gateId] = result;
    return result;
  };

  // Precompute all logic nodes
  logic.forEach(g => { gateState[g.id] = evalGate(g.id); });

  const outputState = {};
  outputs.forEach(o => {
    if (inputState.hasOwnProperty(o.source)) {
      outputState[o.id] = inputState[o.source];
    } else if (gateState.hasOwnProperty(o.source)) {
      outputState[o.id] = gateState[o.source];
    } else {
      outputState[o.id] = false;
    }
  });

  if (runtime) {
    runtime.timers = timers;
    runtime.edges = edges;
    runtime.latches = latches;
  }
  return { inputState, gateState, outputState };
}
