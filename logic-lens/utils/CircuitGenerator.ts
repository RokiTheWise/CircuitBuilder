import { Node, Edge } from '@xyflow/react';

// Helper to get letter for index (0 -> "A", 1 -> "B", etc.)
const getLabel = (i: number) => String.fromCharCode(65 + i);

export const generateCircuit = (
  numInputs: number, 
  outputs: Record<number, number>
): { nodes: Node[], edges: Edge[] } => {
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  let nodeId = 1;
  const getId = () => `${nodeId++}`;

  // 1. Identify "Active Rows" (rows where Output is 1)
  const activeRows = Object.keys(outputs)
    .map(Number)
    .filter(idx => outputs[idx] === 1);

  if (activeRows.length === 0) return { nodes: [], edges: [] };

  // --- COLUMN 1: INPUT NODES (A, B, C...) ---
  const inputNodes: Record<number, string> = {}; // Map index -> Node ID
  
  for (let i = 0; i < numInputs; i++) {
    const id = getId();
    inputNodes[i] = id;
    nodes.push({
      id,
      position: { x: 50, y: i * 100 + 50 },
      data: { label: getLabel(i) },
      type: 'input',
      style: { background: '#fff', border: '1px solid #777', width: 50 }
    });
  }

  // --- COLUMN 2: THE AND GATES (One for each Active Row) ---
  const andGateIds: string[] = [];

  activeRows.forEach((rowIndex, idx) => {
    const binary = rowIndex.toString(2).padStart(numInputs, "0");
    const andId = getId();
    andGateIds.push(andId);

    // Position AND gates in a vertical stack
    nodes.push({
      id: andId,
      position: { x: 300, y: idx * 100 + 50 }, 
      data: { label: 'AND' },
      style: { background: '#dbeafe', border: '1px solid #2563eb' } // Light blue
    });

    // Connect Inputs to this AND gate
    binary.split("").forEach((bit, inputIdx) => {
      const isInverted = bit === "0";
      const sourceId = inputNodes[inputIdx];
      

      edges.push({
        id: `e-${sourceId}-${andId}`,
        source: sourceId,
        target: andId,
        label: isInverted ? 'NOT' : '',
        style: { stroke: isInverted ? '#ef4444' : '#333' }, // Red wire = Inverted
        animated: true,
      });
    });
  });

  // --- COLUMN 3: THE FINAL OR GATE ---
  const orId = getId();
  
  // Center the OR gate relative to the AND gates
  const avgY = (activeRows.length * 100) / 2;
  
  nodes.push({
    id: orId,
    position: { x: 550, y: avgY },
    data: { label: 'OR' },
    style: { background: '#2563eb', color: 'white', border: '1px solid #1e40af' } // Dark blue
  });

  // Connect all AND gates to the OR gate
  andGateIds.forEach((andId) => {
    edges.push({
      id: `e-${andId}-${orId}`,
      source: andId,
      target: orId,
      style: { stroke: '#333' },
    });
  });

  // --- COLUMN 4: FINAL OUTPUT ---
  const finalId = getId();
  nodes.push({
    id: finalId,
    position: { x: 750, y: avgY },
    data: { label: 'Q' }, 
    type: 'output',
    style: { background: '#fff', border: '1px solid #777', width: 50 }
  });

  edges.push({
    id: `e-${orId}-${finalId}`,
    source: orId,
    target: finalId,
    style: { stroke: '#2563eb', strokeWidth: 2 },
  });

  return { nodes, edges };
};