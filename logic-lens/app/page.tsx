"use client";
import React, { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Import your Generator and the new Simplifier
import { generateCircuit } from "@/utils/CircuitGenerator";
import { getSimplifiedEquation } from "@/utils/BooleanSimplifier";
import TruthTable from "@/components/truthtable";

// Define the available modes
export type GateMode = "STANDARD" | "NAND" | "NOR";

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});

  // State for the Gate Mode
  const [gateMode, setGateMode] = useState<GateMode>("STANDARD");

  // NEW: State for the simplified equation text
  const [equation, setEquation] = useState<string>("");

  // React Flow State Helpers
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleGenerate = () => {
    // 1. Generate the Visual Circuit
    const { nodes: newNodes, edges: newEdges } = generateCircuit(
      numInputs,
      tableOutputs,
      gateMode,
    );
    setNodes(newNodes);
    setEdges(newEdges);

    // 2. Generate the Mathematical Equation (Standard Sum-of-Products)
    // Note: We always show the standard equation (e.g. A + B) even in NAND/NOR mode
    // because that's what the logic represents mathematically.
    const eq = getSimplifiedEquation(numInputs, tableOutputs);
    setEquation(eq);
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

        {/* Gate Mode Selector UI */}
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Implementation Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setGateMode("STANDARD")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                ${
                  gateMode === "STANDARD"
                    ? "bg-white border-blue-500 text-blue-600 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-slate-200"
                }`}
            >
              Standard
            </button>
            <button
              onClick={() => setGateMode("NAND")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                ${
                  gateMode === "NAND"
                    ? "bg-white border-purple-500 text-purple-600 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-slate-200"
                }`}
            >
              NAND
            </button>
            <button
              onClick={() => setGateMode("NOR")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all
                ${
                  gateMode === "NOR"
                    ? "bg-white border-orange-500 text-orange-600 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-slate-200"
                }`}
            >
              NOR
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-tight">
            {gateMode === "STANDARD"
              ? "Sum-of-Products using AND, OR, NOT."
              : gateMode === "NAND"
                ? "Universal logic using only NAND gates."
                : "Universal logic using only NOR gates."}
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

        {/* NEW: Equation Display Box */}
        {equation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">
              Minimized Equation
            </span>
            <code className="text-lg font-mono font-bold text-slate-800 break-words">
              Q = {equation}
            </code>
          </div>
        )}

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
