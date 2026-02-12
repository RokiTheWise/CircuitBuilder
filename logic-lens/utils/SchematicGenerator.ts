import { Node, Edge, MarkerType } from '@xyflow/react';
import { getPrimeImplicants } from './BooleanSimplifier';

const getLabel = (i: number) => String.fromCharCode(65 + i);

export const generateSchematic = (
  numInputs: number,
  outputs: Record<number, number>,
  gateMode: 'STANDARD' | 'NAND' | 'NOR' = 'STANDARD'
): { nodes: Node[]; edges: Edge[] } => {
  
  // --- DYNAMIC CONFIGURATION ---
  const BASE_WIDTH = 200;
  const BUS_WIDTH_PER_INPUT = 60; 
  
  const SPACING = {
    inputsX: 100,      
    notX: 400,         
    // Dynamic X-positions
    stage1X: 600 + (numInputs * BUS_WIDTH_PER_INPUT), 
    stage2X: 1000 + (numInputs * BUS_WIDTH_PER_INPUT),     
    outputX: 1300 + (numInputs * BUS_WIDTH_PER_INPUT),     
    rowHeight: 180,    
  };

  // Center of the vertical input bus
  const MAIN_BUS_X = (SPACING.notX + SPACING.stage1X) / 2; 

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 1;
  const getId = () => `sch-${nodeId++}`; 

  // --- 1. SMART OFFSET CALCULATORS ---

  // A. For Input Bus (Switches/Inverters -> Gates)
  // Uses a global counter to fan out wires so they don't overlap vertically.
  let inputEdgeCounter = 0;
  const getInputBusOffset = (sourceX: number, targetX: number) => {
    const count = inputEdgeCounter++;
    const base = 25; 
    const multiplier = Math.ceil(count / 2);
    const sign = count % 2 === 0 ? 1 : -1;
    const spread = multiplier * base * sign;

    // Target a specific vertical lane
    const targetLane = MAIN_BUS_X + spread;
    const currentMidpoint = (sourceX + targetX) / 2;
    return targetLane - currentMidpoint;
  };

  // B. For Inter-Stage (AND -> OR) [NEW LOGIC]
  // Instead of random alternating, we map the offset to the Target Input Index.
  // This ensures wire 0 stays high, wire 1 goes middle, wire 2 goes low, etc.
  const getStageOffset = (targetIndex: number, totalInputs: number) => {
      // Create a "Fan" effect.
      // e.g. if 3 inputs: offsets might be -20, 0, +20
      const spacing = 15;
      // Center the block of wires around 0
      const start = -((totalInputs - 1) * spacing) / 2; 
      return start + (targetIndex * spacing);
  };

  // --- NODE & EDGE FACTORIES ---

  const createNode = (id: string, pos: { x: number; y: number }, label: string, symbolType: string, extra: any = {}): Node => ({
      id, position: pos, type: 'schematic',
      data: { label, symbolType, ...extra },
      style: { background: 'transparent', border: 'none', width: 60, height: 50 },
  });

  const createInputEdge = (source: string, target: string, isInv: boolean, sourceHandle: string, targetHandle: string, sourceX: number, targetX: number): Edge => ({
      id: `e-in-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
      source, target, sourceHandle, targetHandle,
      type: 'smart', 
      data: { offset: getInputBusOffset(sourceX, targetX) }, // Use Bus Logic
      style: { stroke: isInv ? '#ef4444' : '#334155', strokeWidth: 2 },
  });

  const createStageEdge = (source: string, target: string, sourceHandle: string, targetHandle: string, targetIndex: number, totalInputs: number): Edge => ({
      id: `e-stg-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
      source, target, sourceHandle, targetHandle,
      type: 'smart',
      data: { offset: getStageOffset(targetIndex, totalInputs) }, // Use Index Logic
      style: { stroke: '#334155', strokeWidth: 2 },
  });

  const terms = getPrimeImplicants(numInputs, outputs);

  // --- 1. BATTERY & SWITCHES ---
  const batteryId = getId();
  const centerY = ((numInputs - 1) * SPACING.rowHeight) / 2 + 50;
  nodes.push(createNode(batteryId, { x: 50, y: centerY }, '5V', 'BATTERY'));

  const inputIds: string[] = [];
  for (let i = 0; i < numInputs; i++) {
    const id = getId();
    inputIds.push(id);
    const yPos = i * SPACING.rowHeight + 50;
    nodes.push(createNode(id, { x: SPACING.inputsX, y: yPos }, getLabel(i), 'SWITCH'));
    
    // Battery Wire
    edges.push({
      id: `e-bat-${id}`, source: batteryId, target: id, sourceHandle: 'top', targetHandle: 'top',
      type: 'smoothstep', style: { stroke: '#334155', strokeWidth: 2 }, data: { offset: 0 }
    });
  }

  // --- 2. INVERTERS (STAGGERED) ---
  const inverterIds: Record<number, string> = {};
  for (let i = 0; i < numInputs; i++) {
    const isNorMulti = gateMode === 'NOR' && numInputs > 1;
    const targetBit = isNorMulti ? '1' : '0';

    if (terms.some(term => term[i] === targetBit)) {
      const invId = getId();
      inverterIds[i] = invId;
      const label = gateMode === 'STANDARD' ? 'NOT' : gateMode;
      const staggerY = 60; 
      
      nodes.push(createNode(invId, { x: SPACING.notX, y: (i * SPACING.rowHeight + 50) + staggerY }, label, label, { inputCount: 1 }));
      
      edges.push({
        id: `e-in-${i}-inv`, source: inputIds[i], target: invId, sourceHandle: 'out', targetHandle: 'in',
        type: 'smart', data: { offset: 0 }, style: { stroke: '#334155', strokeWidth: 2 }
      });
    }
  }

  // --- 3. LOGIC GATES ---
  const gateIds: string[] = [];
  terms.forEach((term, idx) => {
    const connectedInputs = term.split('').filter(c => c !== '-');
    const inputCount = connectedInputs.length;
    const isNorMulti = gateMode === 'NOR' && numInputs > 1;
    const forceGate = (gateMode === 'NAND' && terms.length > 1) || isNorMulti;

    if (inputCount === 1 && !forceGate) {
        const inputIndex = term.split('').findIndex(c => c !== '-');
        const useInverter = term[inputIndex] === '0';
        gateIds.push(useInverter ? inverterIds[inputIndex] : inputIds[inputIndex]);
        return;
    }

    const gateId = getId();
    gateIds.push(gateId);
    let label = gateMode === 'NAND' ? 'NAND' : (gateMode === 'NOR' ? 'NOR' : 'AND');

    // Vertical Positioning
    const gateY = terms.length > 1 ? (idx * SPACING.rowHeight + 50) : centerY;
    nodes.push(createNode(gateId, { x: SPACING.stage1X, y: gateY }, label, label, { inputCount }));

    let handleIdx = 0;
    term.split('').forEach((bit, inputIdx) => {
      if (bit === '-') return;
      
      const targetBit = isNorMulti ? '1' : '0';
      const useInverter = bit === targetBit;
      const sourceId = useInverter ? inverterIds[inputIdx] : inputIds[inputIdx];

      if (sourceId) {
        const srcX = useInverter ? SPACING.notX : SPACING.inputsX;
        
        // Use Input Bus Edge Factory
        edges.push(createInputEdge(
            sourceId, 
            gateId, 
            useInverter, 
            'out', 
            `in-${handleIdx}`, 
            srcX,           
            SPACING.stage1X 
        ));
        handleIdx++;
      }
    });
  });

  // --- 4. OUTPUT ---
  const outputNodeId = getId();
  nodes.push(createNode(outputNodeId, { x: SPACING.outputX, y: centerY }, 'Q', 'VOLTMETER', { inputCount: 1 }));
  
  edges.push({
      id: `e-out-loop`, source: outputNodeId, target: batteryId, sourceHandle: 'bot', targetHandle: 'bot',
      type: 'smoothstep', data: { offset: 0 }, style: { stroke: '#334155', strokeWidth: 2 }
  });

  if (terms.length === 1) {
    const termId = gateIds[0];
    edges.push(createStageEdge(termId, outputNodeId, 'out', 'in', 0, 1));
  } else {
    const finalId = getId();
    let label = gateMode === 'STANDARD' ? 'OR' : gateMode;
    const finalGateInputs = gateIds.length;
    
    nodes.push(createNode(finalId, { x: SPACING.stage2X, y: centerY }, label, label, { inputCount: finalGateInputs }));

    gateIds.forEach((gId, index) => {
       // Use Stage Edge Factory
       // index = target Index (0, 1, 2...)
       // finalGateInputs = total inputs to calculate spread
       edges.push(createStageEdge(
           gId, 
           finalId, 
           'out', 
           `in-${index}`,
           index,
           finalGateInputs
       ));
    });

    if (gateMode === 'NOR') {
        const fixerId = getId();
        nodes.push(createNode(fixerId, { x: SPACING.stage2X + 200, y: centerY }, 'NOR', 'NOR', { inputCount: 1 }));
        edges.push({ id: 'fix-1', source: finalId, target: fixerId, sourceHandle: 'out', targetHandle: 'in-0', type: 'smoothstep', style: { stroke: '#334155', strokeWidth: 2 }});
        edges.push({ id: 'fix-2', source: fixerId, target: outputNodeId, sourceHandle: 'out', targetHandle: 'in', type: 'smoothstep', style: { stroke: '#334155', strokeWidth: 2 }});
    } else {
        edges.push({ id: 'final-out', source: finalId, target: outputNodeId, sourceHandle: 'out', targetHandle: 'in', type: 'smoothstep', style: { stroke: '#334155', strokeWidth: 2 }});
    }
  }

  return { nodes, edges };
};