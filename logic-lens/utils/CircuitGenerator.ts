// src/utils/CircuitGenerator.ts
import { Node, Edge } from '@xyflow/react';
import { getPrimeImplicants } from './BooleanSimplifier';

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

  // 1. GET SIMPLIFIED LOGIC TERMS
  const terms = getPrimeImplicants(numInputs, outputs);

  // 2. SETUP INPUT NODES
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

  // EDGE CASE: Constant Output 0 or 1
  if (terms.length === 0) {
    const outId = getId();
    nodes.push({ id: outId, position: { x: 800, y: 50 }, data: { label: 'Q' }, type: 'output', style: { opacity: 0.5 } });
    return { nodes, edges };
  }
  const isAlwaysTrue = terms.length === 1 && terms[0].split('').every(c => c === '-');
  if (isAlwaysTrue) {
     const outId = getId();
     nodes.push({ 
       id: outId, position: { x: 800, y: 50 }, data: { label: 'Q (1)' }, type: 'output', 
       style: { background: '#dcfce7', border: '1px solid #16a34a', color: '#166534' } 
     });
     return { nodes, edges };
  }

  // --- PHASE 3: SHARED INVERTERS ---
  const inverterIds: Record<number, string> = {}; 

  for (let i = 0; i < numInputs; i++) {
    const isNorMulti = mode === 'NOR' && numInputs > 1;
    const targetBit = isNorMulti ? '1' : '0';

    const needsInverter = terms.some(term => term[i] === targetBit);

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

  // --- PHASE 4: GENERATE GATES FROM TERMS ---
  const gateIds: string[] = [];

  terms.forEach((term, idx) => {
    const connectedInputs = term.split('').filter(c => c !== '-');
    const inputCount = connectedInputs.length;
    
    const isNorMulti = mode === 'NOR' && numInputs > 1;

    // LOGIC FIX 1: FORCE GATES
    // In NOR-Multi mode, inputs are pre-inverted (De Morgan). 
    // MUST force the gate to correct it back to A.
    const forceGate = (mode === 'NAND' && terms.length > 1) || isNorMulti;

    if (inputCount === 1 && !forceGate) {
        // Direct wire optimization (Standard Mode or Single-Input NAND)
        const inputIndex = term.split('').findIndex(c => c !== '-');
        const bit = term[inputIndex];
        const targetBit = '0'; // Standard target
        const useInverter = bit === targetBit;
        gateIds.push(useInverter ? inverterIds[inputIndex] : inputIds[inputIndex]);
        return;
    }

    // Create a Gate
    const gateId = getId();
    gateIds.push(gateId);

    let label = 'AND';
    let color = '#dbeafe';
    let border = '#2563eb';

    if (mode === 'NAND') { label = 'NAND'; color = '#f3e8ff'; border = '#9333ea'; }
    if (mode === 'NOR')  { label = 'NOR';  color = '#ffedd5'; border = '#ea580c'; }

    nodes.push({
      id: gateId,
      position: { x: 500, y: idx * 120 + 50 }, 
      data: { label },
      style: { background: color, border: `1px solid ${border}`, borderRadius: '4px' }
    });

    // Connect inputs
    term.split('').forEach((bit, inputIdx) => {
      if (bit === '-') return; 

      const targetBit = isNorMulti ? '1' : '0';
      const useInverter = bit === targetBit;
      
      const sourceId = useInverter ? inverterIds[inputIdx] : inputIds[inputIdx];

      edges.push({
        id: `e-term-${gateId}-in-${inputIdx}`,
        source: sourceId,
        target: gateId,
        style: { stroke: useInverter ? '#ef4444' : '#64748b', strokeWidth: useInverter ? 1.5 : 1 }, 
      });
    });
  });

  // --- PHASE 5: FINAL OUTPUT ---
  const outputNodeId = getId();
  const avgY = terms.length > 0 ? (terms.length * 120) / 2 : 50;

  nodes.push({
    id: outputNodeId,
    position: { x: 1000, y: avgY }, 
    data: { label: 'Q' },
    type: 'output',
    style: { background: '#fff', border: '1px solid #94a3b8', width: 40, fontWeight: 'bold' }
  });

  // SINGLE TERM LOGIC
  if (terms.length === 1) {
    const termId = gateIds[0];
    const term = terms[0];
    const inputCount = term.split('').filter(c => c !== '-').length;

    // LOGIC FIX 2: NO FIXER FOR NOR
    // NAND(A,B) = (AB)'. Needs fixer to be AB.
    // NOR(A',B') = (A'+B')' = AB. Already positive! No fixer needed.
    const needsFixer = (mode === 'NAND' && inputCount > 1);

    if (needsFixer) {
        const fixerId = getId();
        nodes.push({
            id: fixerId, position: { x: 750, y: avgY }, data: { label: 'NAND' }, 
            style: { background: '#f3e8ff', border: '1px solid #9333ea', fontSize: 10, width: 50 }
        });
        edges.push({ id: `e-fix-1`, source: termId, target: fixerId, style: { stroke: '#64748b' } });
        edges.push({ id: `e-fix-2`, source: fixerId, target: outputNodeId, style: { stroke: '#9333ea', strokeWidth: 2 } });
    } else {
        edges.push({
            id: `e-final-direct`, source: termId, target: outputNodeId, style: { stroke: '#2563eb', strokeWidth: 2 },
        });
    }

  } else {
    // MULTIPLE TERMS LOGIC
    const finalId = getId();
    let finalLabel = 'OR';
    let finalColor = '#2563eb';
    let finalBorder = 'transparent';

    if (mode === 'NAND') { finalLabel = 'NAND'; finalColor = '#f3e8ff'; finalBorder = '#9333ea'; }
    if (mode === 'NOR')  { finalLabel = 'NOR';  finalColor = '#ffedd5'; finalBorder = '#ea580c'; }

    nodes.push({
      id: finalId,
      position: { x: 750, y: avgY },
      data: { label: finalLabel },
      style: { background: finalColor, color: mode === 'STANDARD' ? 'white' : 'black', border: mode === 'STANDARD' ? '1px solid transparent' : `1px solid ${finalBorder}` }
    });

    gateIds.forEach((gId) => {
      edges.push({
        id: `e-${gId}-${finalId}`, source: gId, target: finalId, style: { stroke: '#64748b' },
      });
    });

    if (mode === 'NOR') {
        const fixerId = getId();
        nodes.push({
            id: fixerId, position: { x: 900, y: avgY }, data: { label: 'NOR' }, 
            style: { background: '#ffedd5', border: '1px solid #ea580c', fontSize: 10, width: 50 }
        });
        edges.push({ id: `e-mid-fix`, source: finalId, target: fixerId, style: { stroke: '#ea580c' } });
        edges.push({ id: `e-fix-out`, source: fixerId, target: outputNodeId, style: { stroke: '#ea580c', strokeWidth: 2 } });
    } else {
        edges.push({
            id: `e-${finalId}-${outputNodeId}`, source: finalId, target: outputNodeId, style: { stroke: finalColor, strokeWidth: 2 },
        });
    }
  }

  return { nodes, edges };
};