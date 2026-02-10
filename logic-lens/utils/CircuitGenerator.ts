import { Node, Edge } from '@xyflow/react';

const getLabel = (i: number) => String.fromCharCode(65 + i);

export const generateCircuit = (
  numInputs: number, 
  outputs: Record<number, number>,
  mode: 'STANDARD' | 'NAND' | 'NOR' = 'STANDARD'
): { nodes: Node[], edges: Edge[] } => {
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 1;
  const getId = () => `${nodeId++}`;

  // 1. SETUP INPUTS
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
  const maxRows = Math.pow(2, numInputs);
  const activeRows = Object.keys(outputs)
    .map(Number)
    .filter(idx => idx < maxRows && outputs[idx] === 1)
    .sort((a, b) => a - b);

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

  // --- PHASE 2: SHARED INVERTERS ---
  const inverterIds: Record<number, string> = {}; 

  for (let i = 0; i < numInputs; i++) {
    // LOGIC:
    // Standard/NAND: Invert '0's.
    // NOR (Multi-Input): Invert '1's (De Morgan).
    // NOR (Single-Input): Invert '0's (Standard NOT behavior).
    const isNorMulti = mode === 'NOR' && numInputs > 1;
    const targetBit = isNorMulti ? '1' : '0';

    const needsInverter = activeRows.some(rowIndex => {
      const binary = rowIndex.toString(2).padStart(numInputs, "0");
      return binary[i] === targetBit;
    });

    if (needsInverter) {
      const invId = getId();
      inverterIds[i] = invId;

      let label = 'NOT';
      let bg = '#fee2e2';
      let border = '#dc2626';

      if (mode === 'NAND') { label = 'NAND'; bg = '#f3e8ff'; border = '#9333ea'; }
      if (mode === 'NOR')  { label = 'NOR';  bg = '#ffedd5'; border = '#ea580c'; }

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

  // --- PHASE 3: THE TERMS ---
  const termIds: string[] = [];

  activeRows.forEach((rowIndex, idx) => {
    // OPTIMIZATION: Single Input -> Pass signal through
    if (numInputs === 1) {
      const binary = rowIndex.toString(2).padStart(numInputs, "0");
      // FIX: Ensure we select the Inverter only if one was actually created!
      // For Single Input NOR (NOT gate), targetBit was '0'. 
      // Row 0 has '0'. Inverter WAS created.
      const isZero = binary[0] === '0';
      termIds.push(isZero ? inverterIds[0] : inputIds[0]);
      return; 
    }

    const gateId = getId();
    termIds.push(gateId);

    let label = 'AND';
    let color = '#dbeafe';
    let border = '#2563eb';

    if (mode === 'NAND') { label = 'NAND'; color = '#f3e8ff'; border = '#9333ea'; }
    if (mode === 'NOR')  { label = 'NOR';  color = '#ffedd5'; border = '#ea580c'; }

    nodes.push({
      id: gateId,
      position: { x: 450, y: idx * 120 + 50 }, 
      data: { label },
      style: { background: color, border: `1px solid ${border}`, borderRadius: '4px' }
    });

    // Connect Inputs -> Gate
    const binary = rowIndex.toString(2).padStart(numInputs, "0");
    binary.split("").forEach((bit, inputIdx) => {
      // LOGIC FIX: Match Phase 2 logic exactly
      const isNorMulti = mode === 'NOR' && numInputs > 1;
      const targetBit = isNorMulti ? '1' : '0';
      const needsInversion = bit === targetBit;
      
      const sourceId = needsInversion ? inverterIds[inputIdx] : inputIds[inputIdx];

      edges.push({
        id: `e-term-${gateId}-in-${inputIdx}`,
        source: sourceId,
        target: gateId,
        style: { stroke: needsInversion ? '#ef4444' : '#64748b', strokeWidth: needsInversion ? 1.5 : 1 }, 
      });
    });
  });

  // --- PHASE 4: FINAL OUTPUT ---
  const outputNodeId = getId();
  const avgY = activeRows.length > 0 ? (activeRows.length * 120) / 2 : 50;

  nodes.push({
    id: outputNodeId,
    position: { x: 950, y: avgY }, 
    data: { label: 'Q' },
    type: 'output',
    style: { background: '#fff', border: '1px solid #94a3b8', width: 40, fontWeight: 'bold' }
  });

  // LOGIC: SINGLE TERM
  if (termIds.length === 1) {
    const termId = termIds[0];

    // NAND needs fixer (AB)' -> AB
    if (mode === 'NAND' && numInputs > 1) {
        const fixerId = getId();
        nodes.push({
            id: fixerId,
            position: { x: 700, y: avgY },
            data: { label: 'NAND' }, 
            style: { background: '#f3e8ff', border: '1px solid #9333ea', fontSize: 10, width: 50 }
        });
        edges.push({ id: `e-fix-1`, source: termId, target: fixerId, style: { stroke: '#64748b' } });
        edges.push({ id: `e-fix-2`, source: fixerId, target: outputNodeId, style: { stroke: '#9333ea', strokeWidth: 2 } });
    } else {
        // Standard / NOR / Single Input -> Direct Connect
        // (NOR Single Input Inverter is already handled in Phase 2)
        edges.push({
            id: `e-final-direct`,
            source: termId,
            target: outputNodeId,
            style: { stroke: '#2563eb', strokeWidth: 2 },
        });
    }

  } else {
    // LOGIC: MULTIPLE TERMS
    const finalId = getId();
    let finalLabel = 'OR';
    let finalColor = '#2563eb';
    let finalBorder = 'transparent';

    // UNIFIED COLORS: No more "Highlighted" gate confusion
    if (mode === 'NAND') { finalLabel = 'NAND'; finalColor = '#f3e8ff'; finalBorder = '#9333ea'; }
    if (mode === 'NOR')  { finalLabel = 'NOR';  finalColor = '#ffedd5'; finalBorder = '#ea580c'; }

    nodes.push({
      id: finalId,
      position: { x: 700, y: avgY },
      data: { label: finalLabel },
      // Use the same style as other gates (Light bg, Dark border) if in NAND/NOR mode
      style: { 
          background: finalColor, 
          color: mode === 'STANDARD' ? 'white' : 'black', 
          border: mode === 'STANDARD' ? '1px solid transparent' : `1px solid ${finalBorder}` 
      }
    });

    termIds.forEach((termId) => {
      edges.push({
        id: `e-${termId}-${finalId}`,
        source: termId,
        target: finalId,
        style: { stroke: '#64748b' },
      });
    });

    // NOR FIXER: (A+B)' -> A+B
    if (mode === 'NOR') {
        const fixerId = getId();
        nodes.push({
            id: fixerId,
            position: { x: 850, y: avgY },
            data: { label: 'NOR' }, 
            style: { background: '#ffedd5', border: '1px solid #ea580c', fontSize: 10, width: 50 }
        });
        edges.push({ id: `e-mid-fix`, source: finalId, target: fixerId, style: { stroke: '#ea580c' } });
        edges.push({ id: `e-fix-out`, source: fixerId, target: outputNodeId, style: { stroke: '#ea580c', strokeWidth: 2 } });
    } else {
        edges.push({
            id: `e-${finalId}-${outputNodeId}`,
            source: finalId,
            target: outputNodeId,
            style: { stroke: finalColor, strokeWidth: 2 },
        });
    }
  }

  return { nodes, edges };
};