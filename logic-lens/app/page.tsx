"use client";
import React, { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { generateCircuit } from "@/utils/CircuitGenerator";
import { getSimplifiedEquation } from "@/utils/BooleanSimplifier";
import { parseEquationToTable } from "@/utils/EquationParser";
import TruthTable from "@/components/truthtable";

export type GateMode = "STANDARD" | "NAND" | "NOR";

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});
  const [gateMode, setGateMode] = useState<GateMode>("STANDARD");
  const [equation, setEquation] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 1. AUTO-GENERATOR
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateCircuit(
      numInputs,
      tableOutputs,
      gateMode,
    );
    setNodes(newNodes);
    setEdges(newEdges);

    if (!isTyping) {
      const eq = getSimplifiedEquation(numInputs, tableOutputs);
      setEquation(eq);
    }
  }, [numInputs, tableOutputs, gateMode, isTyping]);

  // 2. INPUT HANDLER
  const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEquation(val);
    setIsTyping(true);

    const newTable = parseEquationToTable(val, numInputs);
    if (newTable) {
      setTableOutputs(newTable);
    }
  };

  // 3. BLUR HANDLER
  const handleBlur = () => {
    setIsTyping(false);
    const eq = getSimplifiedEquation(numInputs, tableOutputs);
    setEquation(eq);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      <div className="w-[400px] border-r border-slate-200 p-6 flex flex-col gap-6 bg-white h-full overflow-y-auto shadow-xl z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Logic<span className="text-blue-600">Lens</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Truth Table to Circuit Generator
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Implementation Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setGateMode("STANDARD")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${gateMode === "STANDARD" ? "bg-white border-blue-500 text-blue-600 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-200"}`}
            >
              Standard
            </button>
            <button
              onClick={() => setGateMode("NAND")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${gateMode === "NAND" ? "bg-white border-purple-500 text-purple-600 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-200"}`}
            >
              NAND
            </button>
            <button
              onClick={() => setGateMode("NOR")}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${gateMode === "NOR" ? "bg-white border-orange-500 text-orange-600 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-200"}`}
            >
              NOR
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200">
          <span className="text-sm font-semibold text-slate-600">
            Inputs: {numInputs}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setNumInputs(Math.max(1, numInputs - 1))}
              className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-sm text-xs font-bold text-slate-600"
            >
              -
            </button>
            <button
              onClick={() => setNumInputs(Math.min(5, numInputs + 1))}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm shadow-blue-200 text-xs font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Equation Input */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all focus-within:ring-2 focus-within:ring-blue-400">
          <label
            htmlFor="equation-input"
            className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1"
          >
            Boolean Equation
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-slate-400 select-none">
              Q =
            </span>
            <input
              id="equation-input"
              type="text"
              value={equation}
              onChange={handleEquationChange}
              onBlur={handleBlur}
              placeholder="e.g. AB + C'"
              // UPDATED STYLING: Sans-serif, bold, tighter tracking for professional math look
              className="w-full bg-transparent border-none focus:outline-none text-2xl font-sans font-black text-slate-800 placeholder-slate-300 uppercase tracking-tight"
              autoComplete="off"
            />
          </div>
          <p className="text-[10px] text-blue-400 mt-2">
            Type equation to update circuit. Supported: A, B, +, '
          </p>
        </div>

        <TruthTable
          numInputs={numInputs}
          outputs={tableOutputs}
          setOutputs={setTableOutputs}
        />
      </div>

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
