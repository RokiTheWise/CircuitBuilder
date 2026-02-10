"use client";
import React, { useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { generateCircuit } from "@/utils/CircuitGenerator";
import { useNodesState, useEdgesState } from "@xyflow/react"; // Import hooks

import TruthTable from "@/components/truthtable";

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});

  // React Flow State Helpers
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleGenerate = () => {
    const { nodes: newNodes, edges: newEdges } = generateCircuit(
      numInputs,
      tableOutputs,
    );
    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-[400px] border-r border-slate-200 p-6 flex flex-col gap-6 bg-white h-full overflow-y-auto shadow-xl z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Logic<span className="text-blue-600">Lens</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Truth Table to Circuit Generator
          </p>
        </div>

        {/* Input Controls */}
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200">
          <span className="text-sm font-semibold text-slate-600">
            Inputs: {numInputs}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setNumInputs(Math.max(1, numInputs - 1))}
              className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded shadow-sm text-xs font-bold text-slate-600 transition-all"
            >
              -
            </button>
            <button
              onClick={() => setNumInputs(Math.min(5, numInputs + 1))}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm shadow-blue-200 text-xs font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>

        <TruthTable
          numInputs={numInputs}
          outputs={tableOutputs}
          setOutputs={setTableOutputs}
        />

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
        >
          Generate Circuit
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 h-full relative bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          colorMode="light"
          fitView
        >
          <Background color="#cbd5e1" gap={25} size={1} />
          <Controls className="bg-white border-slate-200 shadow-sm fill-slate-600" />
        </ReactFlow>
      </div>
    </div>
  );
}
