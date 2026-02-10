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

  // 1. SETUP INPUTS (We do this FIRST so they exist even if no rows are active)
  const inputIds: string[] = [];
  for (let i = 0; i < numInputs; i++) {
    const id = getId();
    inputIds.push(id);
    nodes.push({
      id,
      position: { x: 50, y: i * 150 + 50 },
      data: { label: getLabel(i) },
      type: 'input',
      style: { background: '#fff', border: '1px solid #94a3b8', width: 40, fontWeight: 'bold' }
    });
  }

  // 2. FILTER & SORT ACTIVE ROWS
  //  strictly filter rows that are valid for the current numInputs to prevent "Ghost Rows"
  const maxRows = Math.pow(2, numInputs);
  const activeRows = Object.keys(outputs)
    .map(Number)
    .filter(idx => idx < maxRows && outputs[idx] === 1)
    .sort((a, b) => a - b);

  // EDGE CASE: NO ACTIVE ROWS (Output is 0)
  //  return just the inputs and a disconnected, grayed-out Output node
  if (activeRows.length === 0) {
    const outId = getId();
    nodes.push({
      id: outId,
      position: { x: 800, y: 50 },
      data: { label: 'Q' },
      type: 'output',
      style: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#94a3b8' }
    });
    return { nodes, edges };
  }

  // --- PHASE 2: SHARED INVERTERS (Column 2) ---
  // If multiple terms need "NOT A", create ONE shared gate here.
  const inverterIds: Record<number, string> = {}; 

  for (let i = 0; i < numInputs; i++) {
    // Check if ANY active row needs a '0' for this input
    const needsInverter = activeRows.some(rowIndex => {
      const binary = rowIndex.toString(2).padStart(numInputs, "0");
      return binary[i] === '0';
    });

    if (needsInverter) {
      const invId = getId();
      inverterIds[i] = invId;

      const label = mode === 'STANDARD' ? 'NOT' : 'NAND';
      const bg = mode === 'STANDARD' ? '#fee2e2' : '#f3e8ff'; 
      const border = mode === 'STANDARD' ? '#dc2626' : '#9333ea';

      nodes.push({
        id: invId,
        position: { x: 200, y: i * 150 + 50 },
        data: { label },
        style: { background: bg, border: `1px solid ${border}`, fontSize: 10, width: 50 }
      });

      edges.push({
        id: `e-in-${i}-inv`,
        source: inputIds[i],
        target: invId,
        style: { stroke: '#64748b' }
      });
    }
  }

  // --- PHASE 3: THE TERMS (Column 3) ---
  const termIds: string[] = [];

  activeRows.forEach((rowIndex, idx) => {
    // OPTIMIZATION: If only 1 input, don't need a gate here.
    // The "Term" is just the source signal (either raw or inverted).
    if (numInputs === 1) {
      const binary = rowIndex.toString(2).padStart(numInputs, "0");
      const isZero = binary[0] === '0';
      termIds.push(isZero ? inverterIds[0] : inputIds[0]);
      return; 
    }

    const gateId = getId();
    termIds.push(gateId);

    const label = mode === 'STANDARD' ? 'AND' : 'NAND';
    const color = mode === 'STANDARD' ? '#dbeafe' : '#f3e8ff';
    const border = mode === 'STANDARD' ? '#2563eb' : '#9333ea';

    nodes.push({
      id: gateId,
      position: { x: 450, y: idx * 120 + 50 }, 
      data: { label },
      style: { background: color, border: `1px solid ${border}`, borderRadius: '4px' }
    });

    // Connect Inputs -> Gate
    const binary = rowIndex.toString(2).padStart(numInputs, "0");
    binary.split("").forEach((bit, inputIdx) => {
      const isZero = bit === "0";
      const sourceId = isZero ? inverterIds[inputIdx] : inputIds[inputIdx];

      edges.push({
        id: `e-term-${gateId}-in-${inputIdx}`,
        source: sourceId,
        target: gateId,
        // Visual polish: Red wire if coming from inverter, Gray if direct
        style: { stroke: isZero ? '#ef4444' : '#64748b', strokeWidth: isZero ? 1.5 : 1 }, 
      });
    });
  });

  // --- PHASE 4: FINAL OUTPUT (Column 4) ---
  const outputNodeId = getId();
  const avgY = activeRows.length > 0 ? (activeRows.length * 120) / 2 : 50;

  nodes.push({
    id: outputNodeId,
    position: { x: 900, y: avgY }, 
    data: { label: 'Q' },
    type: 'output',
    style: { background: '#fff', border: '1px solid #94a3b8', width: 40, fontWeight: 'bold' }
  });

  // LOGIC: SINGLE TERM
  if (termIds.length === 1) {
    const termId = termIds[0];

    // EDGE CASE: NAND Mode with >1 inputs needs a second inversion!
    // Why? Because Phase 3 gate output is ~(AB). We want AB.
    // So add a "Fixer NAND" to invert it back: ~~AB = AB.
    if (mode === 'NAND' && numInputs > 1) {
        const fixerId = getId();
        nodes.push({
            id: fixerId,
            position: { x: 650, y: avgY },
            data: { label: 'NAND' }, // Acts as Inverter
            style: { background: '#f3e8ff', border: '1px solid #9333ea', fontSize: 10, width: 50 }
        });

        edges.push({ id: `e-fix-1`, source: termId, target: fixerId, style: { stroke: '#64748b' } });
        edges.push({ id: `e-fix-2`, source: fixerId, target: outputNodeId, style: { stroke: '#9333ea', strokeWidth: 2 } });
    } else {
        // Standard Mode (or 1 input) -> Direct Connect
        edges.push({
            id: `e-final-direct`,
            source: termId,
            target: outputNodeId,
            style: { stroke: '#2563eb', strokeWidth: 2 },
        });
    }

  } else {
    // LOGIC: MULTIPLE TERMS
    // Math Note: OR(A,B) is equivalent to NAND( ~A, ~B ).
    // Since our terms in NAND mode are ALREADY inverted (they are NANDs), 
    // feeding them into a final NAND perfectly recreates the OR function!
    const finalId = getId();
    const finalLabel = mode === 'STANDARD' ? 'OR' : 'NAND';
    const finalColor = mode === 'STANDARD' ? '#2563eb' : '#9333ea';

    nodes.push({
      id: finalId,
      position: { x: 700, y: avgY },
      data: { label: finalLabel },
      style: { background: finalColor, color: 'white', border: '1px solid transparent' }
    });

    termIds.forEach((termId) => {
      edges.push({
        id: `e-${termId}-${finalId}`,
        source: termId,
        target: finalId,
        style: { stroke: '#64748b' },
      });
    });

    edges.push({
      id: `e-${finalId}-${outputNodeId}`,
      source: finalId,
      target: outputNodeId,
      style: { stroke: finalColor, strokeWidth: 2 },
    });
  }

  return { nodes, edges };
};