import { Node, Edge } from '@xyflow/react';

const getLabel = (i: number) => String.fromCharCode(65 + i);

export const generateCircuit = (
  numInputs: number, 
  outputs: Record<number, number>,
  mode: 'STANDARD' | 'NAND' = 'STANDARD'
): { nodes: Node[], edges: Edge[] } => {
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 1;
  const getId = () => `${nodeId++}`;

  // 1. Identify Active Rows
  const activeRows = Object.keys(outputs)
    .map(Number)
    .filter(idx => outputs[idx] === 1);

  if (activeRows.length === 0) return { nodes: [], edges: [] };

  // --- COLUMN 1: INPUT NODES ---
  const inputIds: string[] = [];
  for (let i = 0; i < numInputs; i++) {
    const id = getId();
    inputIds.push(id);
    nodes.push({
      id,
      position: { x: 50, y: i * 100 + 50 },
      data: { label: getLabel(i) },
      type: 'input',
      style: { background: '#fff', border: '1px solid #94a3b8', width: 40, fontWeight: 'bold' }
    });
  }

  // --- COLUMN 2: FIRST LAYER GATES (AND / NAND) ---
  const layer2Ids: string[] = [];

  activeRows.forEach((rowIndex, idx) => {
    const binary = rowIndex.toString(2).padStart(numInputs, "0");
    const gateId = getId();
    layer2Ids.push(gateId);

    // If Mode is STANDARD, this is an AND gate.
    // If Mode is NAND, this is a NAND gate.
    const label = mode === 'STANDARD' ? 'AND' : 'NAND';
    const color = mode === 'STANDARD' ? '#dbeafe' : '#f3e8ff'; // Blue vs Purple
    const border = mode === 'STANDARD' ? '#2563eb' : '#9333ea';

    nodes.push({
      id: gateId,
      position: { x: 350, y: idx * 120 + 50 }, 
      data: { label },
      style: { background: color, border: `1px solid ${border}`, borderRadius: '4px' }
    });

    // Connect Inputs
    binary.split("").forEach((bit, inputIdx) => {
      const isZero = bit === "0";
      const sourceId = inputIds[inputIdx];
      
      // LOGIC: Handling Inversions (NOT)
      if (isZero) {
        // If it's a 0, we need to invert the signal.
        if (mode === 'STANDARD') {
           // Standard: Just draw a red line (representing a NOT bubble)
           edges.push({
             id: `e-${sourceId}-${gateId}`,
             source: sourceId,
             target: gateId,
             label: 'NOT',
             style: { stroke: '#ef4444', strokeWidth: 2 },
             labelStyle: { fill: '#ef4444', fontWeight: 700 }
           });
        } else {
           // NAND Mode: A NOT gate is a NAND with joined inputs.
           // We insert a mini NAND gate in between.
           const notGateId = getId();
           nodes.push({
             id: notGateId,
             position: { x: 200, y: (idx * 120) + (inputIdx * 20) + 50 }, // Position in between
             data: { label: 'NAND' },
             style: { width: 50, fontSize: 10, background: '#f3e8ff', border: '1px solid #9333ea' }
           });
           
           // Input -> Mini NAND
           edges.push({ id: `e-${sourceId}-${notGateId}`, source: sourceId, target: notGateId });
           // Mini NAND -> Main NAND
           edges.push({ id: `e-${notGateId}-${gateId}`, source: notGateId, target: gateId });
        }
      } else {
        // Direct connection (1)
        edges.push({
          id: `e-${sourceId}-${gateId}`,
          source: sourceId,
          target: gateId,
          style: { stroke: '#64748b' },
        });
      }
    });
  });

  // --- COLUMN 3: FINAL GATE (OR / NAND) ---
  const finalId = getId();
  const avgY = (activeRows.length * 120) / 2;
  
  // STANDARD: The outputs of ANDs go into an OR.
  // NAND: The outputs of NANDs go into a NAND.
  const finalLabel = mode === 'STANDARD' ? 'OR' : 'NAND';
  const finalColor = mode === 'STANDARD' ? '#2563eb' : '#9333ea';

  nodes.push({
    id: finalId,
    position: { x: 600, y: avgY },
    data: { label: finalLabel },
    style: { background: finalColor, color: 'white', border: '1px solid transparent' }
  });

  layer2Ids.forEach((id) => {
    edges.push({
      id: `e-${id}-${finalId}`,
      source: id,
      target: finalId,
      style: { stroke: '#64748b' },
    });
  });

  // --- OUTPUT NODE ---
  const outputId = getId();
  nodes.push({
    id: outputId,
    position: { x: 750, y: avgY },
    data: { label: 'Q' },
    type: 'output',
    style: { background: '#fff', border: '1px solid #94a3b8', width: 40 }
  });

  edges.push({
    id: `e-${finalId}-${outputId}`,
    source: finalId,
    target: outputId,
    style: { stroke: finalColor, strokeWidth: 2 },
  });

  return { nodes, edges };
};