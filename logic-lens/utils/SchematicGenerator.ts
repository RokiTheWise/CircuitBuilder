import { Node, Edge } from '@xyflow/react';
import { getPrimeImplicants } from './BooleanSimplifier';

const getLabel = (i: number) => String.fromCharCode(65 + i);

export const generateSchematic = (
  numInputs: number,
  outputs: Record<number, number>,
  gateMode: 'STANDARD' | 'NAND' | 'NOR' = 'STANDARD'
): { nodes: Node[]; edges: Edge[] } => {
  
  // --- CONFIGURATION ---
  const BUS_WIDTH_PER_INPUT = 60; 
  const SPACING = {
    inputsX: 100,      
    notX: 400,         
    stage1X: 600 + (numInputs * BUS_WIDTH_PER_INPUT), 
    stage2X: 1000 + (numInputs * BUS_WIDTH_PER_INPUT),     
    outputX: 1300 + (numInputs * BUS_WIDTH_PER_INPUT),     
    rowHeight: 180,    
  };

  const MAIN_BUS_X = (SPACING.notX + SPACING.stage1X) / 2; 

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 1;
  const getId = () => `sch-${nodeId++}`; 

  // --- SMART OFFSET HELPERS ---
  let inputEdgeCounter = 0;
  
  // Returns [offset, absoluteLaneX]
  const calculateBusOffset = (sourceX: number, targetX: number): [number, number] => {
    const count = inputEdgeCounter++;
    const base = 25; 
    const multiplier = Math.ceil(count / 2);
    const sign = count % 2 === 0 ? 1 : -1;
    const spread = multiplier * base * sign;
    const targetLane = MAIN_BUS_X + spread;
    const offset = targetLane - (sourceX + targetX) / 2;
    return [offset, targetLane];
  };

  const calculateStageOffset = (sourceX: number, targetX: number, targetIndex: number, totalInputs: number): [number, number] => {
      const spacing = 15;
      const start = -((totalInputs - 1) * spacing) / 2; 
      const spread = start + (targetIndex * spacing);
      const midpoint = (sourceX + targetX) / 2;
      const offset = spread;
      const laneX = midpoint + offset;
      return [offset, laneX];
  };

  // --- FACTORIES ---
  const createNode = (id: string, pos: { x: number; y: number }, label: string, symbolType: string, extra: any = {}): Node => ({
      id, position: pos, type: 'schematic',
      data: { label, symbolType, ...extra },
      style: { background: 'transparent', border: 'none', width: 60, height: 50 },
  });

  const createInputEdge = (source: string, target: string, isInv: boolean, sourceHandle: string, targetHandle: string, sourceX: number, targetX: number): Edge => {
      const [offset, laneX] = calculateBusOffset(sourceX, targetX);
      return {
          id: `e-in-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
          source, target, sourceHandle, targetHandle,
          type: 'smart', 
          // IMPORTANT: Store sourceX/laneX for post-processing
          data: { offset, laneX, sourceX, hasDot: false }, 
          style: { stroke: isInv ? '#ef4444' : '#334155', strokeWidth: 2 },
      };
  };

  const createStageEdge = (source: string, target: string, sourceHandle: string, targetHandle: string, targetIndex: number, totalInputs: number, sourceX: number, targetX: number): Edge => {
      const [offset, laneX] = calculateStageOffset(sourceX, targetX, targetIndex, totalInputs);
      return {
          id: `e-stg-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
          source, target, sourceHandle, targetHandle,
          type: 'smart',
          data: { offset, laneX, sourceX, hasDot: false },
          style: { stroke: '#334155', strokeWidth: 2 },
      };
  };

  const getY = (idx: number) => idx * SPACING.rowHeight + 50;
  const terms = getPrimeImplicants(numInputs, outputs);

  // 1. BATTERY & SWITCHES
  const batteryId = getId();
  const centerY = ((numInputs - 1) * SPACING.rowHeight) / 2 + 50;
  nodes.push(createNode(batteryId, { x: 50, y: centerY }, '5V', 'BATTERY'));

  const inputIds: string[] = [];
  for (let i = 0; i < numInputs; i++) {
    const id = getId();
    inputIds.push(id);
    const yPos = getY(i);
    nodes.push(createNode(id, { x: SPACING.inputsX, y: yPos }, getLabel(i), 'SWITCH'));
    
    // Battery Wire
    edges.push({
      id: `e-bat-${id}`, source: batteryId, target: id, sourceHandle: 'top', targetHandle: 'top',
      type: 'smoothstep', style: { stroke: '#334155', strokeWidth: 2 }, data: { offset: 0, hasDot: false }
    });
  }

  // 2. INVERTERS
  const inverterIds: Record<number, string> = {};
  for (let i = 0; i < numInputs; i++) {
    const isNorMulti = gateMode === 'NOR' && numInputs > 1;
    const targetBit = isNorMulti ? '1' : '0';

    if (terms.some(term => term[i] === targetBit)) {
      const invId = getId();
      inverterIds[i] = invId;
      const label = gateMode === 'STANDARD' ? 'NOT' : gateMode;
      nodes.push(createNode(invId, { x: SPACING.notX, y: getY(i) + 60 }, label, label, { inputCount: 1 }));
      
      edges.push({
        id: `e-in-${i}-inv`, source: inputIds[i], target: invId, sourceHandle: 'out', targetHandle: 'in',
        type: 'smart', 
        data: { offset: 0, laneX: (SPACING.inputsX + SPACING.notX)/2, sourceX: SPACING.inputsX, hasDot: false }, 
        style: { stroke: '#334155', strokeWidth: 2 }
      });
    }
  }

  // 3. GATES
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
    const gateY = terms.length > 1 ? getY(idx) : centerY;
    nodes.push(createNode(gateId, { x: SPACING.stage1X, y: gateY }, label, label, { inputCount }));

    let handleIdx = 0;
    term.split('').forEach((bit, inputIdx) => {
      if (bit === '-') return;
      const targetBit = isNorMulti ? '1' : '0';
      const useInverter = bit === targetBit;
      const sourceId = useInverter ? inverterIds[inputIdx] : inputIds[inputIdx];
      if (sourceId) {
        const srcX = useInverter ? SPACING.notX : SPACING.inputsX;
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

  // 4. OUTPUT
  const outputNodeId = getId();
  nodes.push(createNode(outputNodeId, { x: SPACING.outputX, y: centerY }, 'Q', 'VOLTMETER', { inputCount: 1 }));
  edges.push({
    id: `e-out-loop`, source: outputNodeId, target: batteryId, sourceHandle: 'bot', targetHandle: 'bot',
    type: 'smoothstep', data: { offset: 0, hasDot: false }, style: { stroke: '#334155', strokeWidth: 2 }
  });

  if (terms.length === 1) {
    const termId = gateIds[0];
    edges.push(createStageEdge(termId, outputNodeId, 'out', 'in', 0, 1, SPACING.stage1X, SPACING.outputX));
  } else {
    const finalId = getId();
    let label = gateMode === 'STANDARD' ? 'OR' : gateMode;
    const finalGateInputs = gateIds.length;
    nodes.push(createNode(finalId, { x: SPACING.stage2X, y: centerY }, label, label, { inputCount: finalGateInputs }));

    gateIds.forEach((gId, index) => {
       edges.push(createStageEdge(
           gId, 
           finalId, 
           'out', 
           `in-${index}`,
           index,
           finalGateInputs,
           SPACING.stage1X,
           SPACING.stage2X
       ));
    });

    if (gateMode === 'NOR') {
        const fixerId = getId();
        nodes.push(createNode(fixerId, { x: SPACING.stage2X + 200, y: centerY }, 'NOR', 'NOR', { inputCount: 1 }));
        edges.push({ id: 'fix-1', source: finalId, target: fixerId, sourceHandle: 'out', targetHandle: 'in-0', type: 'smoothstep', data: { hasDot: false }, style: { stroke: '#334155', strokeWidth: 2 }});
        edges.push({ id: 'fix-2', source: fixerId, target: outputNodeId, sourceHandle: 'out', targetHandle: 'in', type: 'smoothstep', data: { hasDot: false }, style: { stroke: '#334155', strokeWidth: 2 }});
    } else {
        edges.push({ id: 'final-out', source: finalId, target: outputNodeId, sourceHandle: 'out', targetHandle: 'in', type: 'smoothstep', data: { hasDot: false }, style: { stroke: '#334155', strokeWidth: 2 }});
    }
  }

  // --- 5. JUNCTION DOT LOGIC (Robust Method) ---
  const edgeGroups = new Map<string, Edge[]>();
  
  edges.forEach(edge => {
    if (edge.type === 'smart') {
      const key = `${edge.source}:${edge.sourceHandle}`;
      if (!edgeGroups.has(key)) edgeGroups.set(key, []);
      edgeGroups.get(key)!.push(edge);
    }
  });

  edgeGroups.forEach((groupEdges) => {
      // If >1 wires leave a pin, it's a branch.
      if (groupEdges.length > 1) {
          
          // 1. Calculate distances for all edges in this group
          // We assume "length" is the horizontal distance to the turn (laneX)
          const rankedEdges = groupEdges.map(e => {
             const laneX = e.data?.laneX as number || 0;
             const srcX = e.data?.sourceX as number || 0;
             const dist = Math.abs(laneX - srcX);
             return { edge: e, dist };
          });

          // 2. Sort by Distance Ascending (Shortest -> Longest)
          rankedEdges.sort((a, b) => a.dist - b.dist);

          // 3. Mark all as Dots EXCEPT the last one (Furthest)
          rankedEdges.forEach((item, index) => {
              const isLast = index === rankedEdges.length - 1;
              // Must clone data to trigger React update
              item.edge.data = { 
                  ...item.edge.data, 
                  hasDot: !isLast 
              };
          });
      }
  });

  // --- 6. RENDER ORDER SORT (CRITICAL FIX) ---
  // Ensure Long wires (Trunks) are drawn FIRST (Background).
  // Ensure Short wires (Taps with dots) are drawn LAST (Foreground).
  // This prevents the Trunk's white Halo from erasing the Tap's black Dot.
  edges.sort((a, b) => {
      // Calculate length (approximate)
      const distA = Math.abs((a.data?.laneX as number || 0) - (a.data?.sourceX as number || 0));
      const distB = Math.abs((b.data?.laneX as number || 0) - (b.data?.sourceX as number || 0));
      
      // Sort Descending: Longest Dist -> Shortest Dist
      return distB - distA; 
  });

  return { nodes, edges };
};