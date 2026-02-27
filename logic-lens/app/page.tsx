"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FiPlay } from "react-icons/fi";

// 1. IMPORT BOTH GENERATORS
import { generateCircuit } from "@/utils/CircuitGenerator";
import { generateSchematic } from "@/utils/SchematicGenerator";

import { getSimplifiedEquation } from "@/utils/BooleanSimplifier";
import { parseEquationToTable } from "@/utils/EquationParser";
import TruthTable from "@/components/truthtable";
import Counter from "@/components/counter";
import StaggeredDropDown from "@/components/StaggeredDropdown";

// 2. IMPORT CUSTOM NODES & EDGES
import SchematicNode from "@/components/SchematicNode";
import SmartStepEdge from "@/components/SmartStepEdge";

export type GateMode = "STANDARD" | "NAND" | "NOR";
export type DisplayStyle = "BLOCK" | "SCHEMATIC";

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});
  const [gateMode, setGateMode] = useState<GateMode>("STANDARD");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("BLOCK");

  // NEW STATE LOGIC: Split Draft vs Active
  const [draftEquation, setDraftEquation] = useState<string>("");
  const [activeEquation, setActiveEquation] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 3. REGISTER NODE TYPES
  const nodeTypes = useMemo(
    () => ({
      schematic: SchematicNode,
    }),
    [],
  );

  // 4. REGISTER EDGE TYPES
  const edgeTypes = useMemo(
    () => ({
      smart: SmartStepEdge,
    }),
    [],
  );

  // 5. MAIN EFFECT LOOP - Depends on activeEquation logic now
  useEffect(() => {
    let result;

    if (displayStyle === "SCHEMATIC") {
      result = generateSchematic(numInputs, tableOutputs, gateMode);
    } else {
      result = generateCircuit(numInputs, tableOutputs, gateMode);
    }

    setNodes(result.nodes);
    setEdges(result.edges);

    // Auto-update the draft box if the user changes the truth table directly
    const eq = getSimplifiedEquation(numInputs, tableOutputs);
    setActiveEquation(eq);
    setDraftEquation(eq);
    setErrorMsg(null);
  }, [numInputs, tableOutputs, gateMode, displayStyle]);

  // --- HANDLERS ---
  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDraftEquation(val);
    setErrorMsg(null); // Clear error while typing
  };

  const handleGenerate = () => {
    const val = draftEquation.toUpperCase();

    // Validation
    const invalidChars = val.match(/[^A-E0-1\+\'\(\)\s\u2018\u2019`]/g);
    if (invalidChars) {
      setErrorMsg(
        `Invalid character: "${invalidChars[0]}". Only A-E, 0, 1 allowed.`,
      );
      return;
    }

    // Input Scaling
    const uniqueVars = new Set(val.match(/[A-E]/g));
    let requiredInputs = numInputs;
    uniqueVars.forEach((char) => {
      const varIndex = char.charCodeAt(0) - 64;
      if (varIndex > requiredInputs) requiredInputs = varIndex;
    });
    requiredInputs = Math.min(5, requiredInputs);

    if (requiredInputs > numInputs) {
      setNumInputs(requiredInputs);
    }

    // Parsing
    const newTable = parseEquationToTable(val, requiredInputs);
    if (newTable) {
      setTableOutputs(newTable);
      setActiveEquation(val);
      setErrorMsg(null);
    } else if (val.trim() !== "") {
      setErrorMsg("Invalid syntax. Check parentheses or operators.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="order-last lg:order-first w-full lg:w-[400px] flex-1 lg:flex-none border-t lg:border-t-0 lg:border-r border-slate-200 bg-white h-full overflow-y-auto shadow-xl z-10">
        <div className="p-4 lg:p-6 flex flex-col gap-6 min-h-full">
          {/* LOGO */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <Image
                src="/LogiSketch.png"
                alt="LogiSketch Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Logi<span className="text-blue-600">Sketch</span>
              </h1>
              <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">
                Visualize boolean logic
              </p>
            </div>
          </div>

          {/* MODE SELECTOR */}
          <div className="bg-slate-100 p-3 lg:p-4 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Implementation Mode
            </label>
            <div className="flex gap-2">
              <DrawOutlineButton
                isActive={gateMode === "STANDARD"}
                onClick={() => setGateMode("STANDARD")}
                lineColor="bg-blue-500"
                textColor="text-blue-600"
              >
                Standard
              </DrawOutlineButton>
              <DrawOutlineButton
                isActive={gateMode === "NAND"}
                onClick={() => setGateMode("NAND")}
                lineColor="bg-purple-500"
                textColor="text-purple-600"
              >
                NAND
              </DrawOutlineButton>
              <DrawOutlineButton
                isActive={gateMode === "NOR"}
                onClick={() => setGateMode("NOR")}
                lineColor="bg-orange-500"
                textColor="text-orange-600"
              >
                NOR
              </DrawOutlineButton>
            </div>
          </div>

          {/* DISPLAY STYLE SELECTOR */}
          <div className="bg-slate-100 p-3 lg:p-4 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Display Style
            </label>
            <div className="flex bg-slate-200 rounded-lg p-1 relative">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-300 ${displayStyle === "BLOCK" ? "left-1" : "left-[calc(50%+0px)]"}`}
              />
              <button
                onClick={() => setDisplayStyle("BLOCK")}
                className={`flex-1 relative z-10 text-xs font-bold py-2 rounded-md transition-colors ${displayStyle === "BLOCK" ? "text-slate-800" : "text-slate-500"}`}
              >
                Blocks
              </button>
              <button
                onClick={() => setDisplayStyle("SCHEMATIC")}
                className={`flex-1 relative z-10 text-xs font-bold py-2 rounded-md transition-colors ${displayStyle === "SCHEMATIC" ? "text-slate-800" : "text-slate-500"}`}
              >
                Schematic
              </button>
            </div>
          </div>

          {/* INPUTS CONTROL */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">
                Inputs:
              </span>
              <div className="bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
                <Counter
                  value={numInputs}
                  places={[1]}
                  className="text-slate-700 font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNumInputs(Math.max(1, numInputs - 1))}
                disabled={numInputs <= 1}
                className={`px-3 py-1 rounded shadow-sm text-xs font-bold transition-colors border ${numInputs <= 1 ? "bg-slate-200 text-slate-400 border-transparent cursor-not-allowed" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"}`}
              >
                -
              </button>
              <button
                onClick={() => setNumInputs(Math.min(5, numInputs + 1))}
                disabled={numInputs >= 5}
                className={`px-3 py-1 rounded shadow-sm text-xs font-bold transition-colors ${numInputs >= 5 ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"}`}
              >
                +
              </button>
            </div>
          </div>

          {/* EQUATION INPUT WITH GENERATE BUTTON */}
          <div
            className={`border rounded-xl p-4 transition-all focus-within:ring-2 shadow-sm ${errorMsg ? "bg-red-50 border-red-200 focus-within:ring-red-300" : "bg-white border-blue-200 focus-within:ring-blue-400"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <label
                htmlFor="equation-input"
                className={`text-[10px] font-bold uppercase tracking-wider block ${errorMsg ? "text-red-500" : "text-blue-600"}`}
              >
                Boolean Equation
              </label>
              {errorMsg && (
                <span className="text-[9px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                  {errorMsg}
                </span>
              )}
            </div>

            <div className="flex items-stretch gap-2">
              <div className="flex items-center bg-slate-50 rounded-lg px-3 border border-slate-200 flex-1 focus-within:border-blue-400 transition-colors">
                <span
                  className={`text-xl font-black select-none mr-2 ${errorMsg ? "text-red-400" : "text-blue-600"}`}
                >
                  Q=
                </span>
                <input
                  id="equation-input"
                  type="text"
                  value={draftEquation}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. AB + C'"
                  className={`w-full bg-transparent border-none focus:outline-none text-xl lg:text-2xl font-sans font-black placeholder-slate-300 uppercase tracking-tight py-2 ${errorMsg ? "text-red-800" : "text-slate-800"}`}
                  autoComplete="off"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
                title="Generate Circuit"
              >
                <FiPlay className="text-xl" />
              </button>
            </div>
          </div>

          <TruthTable
            numInputs={numInputs}
            outputs={tableOutputs}
            setOutputs={setTableOutputs}
          />

          <div className="mt-auto pt-6 border-t border-slate-100 text-center pb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Made by Dexter Jethro Enriquez
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Canvas) */}
      <div className="order-first lg:order-last w-full lg:flex-1 h-[40vh] lg:h-full relative bg-slate-50 shrink-0 min-h-[300px] touch-none">
        <StaggeredDropDown
          equation={activeEquation} // Pass active equation to export
          numInputs={numInputs}
          tableOutputs={tableOutputs}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode="light"
          fitView
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={25} size={1} />
          <Controls className="bg-white border-slate-200 shadow-sm fill-slate-600" />
        </ReactFlow>
      </div>
    </div>
  );
}

// ... DrawOutlineButton logic ...
interface DrawOutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isActive: boolean;
  lineColor: string;
  textColor: string;
}

const DrawOutlineButton = ({
  children,
  isActive,
  lineColor,
  textColor,
  ...rest
}: DrawOutlineButtonProps) => {
  return (
    <button
      {...rest}
      className={`group relative flex-1 px-4 py-2 text-xs font-bold transition-colors duration-[400ms] ${isActive ? `bg-white ${textColor} shadow-sm` : "text-slate-500 hover:text-slate-700 bg-transparent"}`}
    >
      <span className="relative z-10">{children}</span>
      <span
        className={`absolute left-0 top-0 h-[2px] ${lineColor} transition-all duration-100 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
      />
      <span
        className={`absolute right-0 top-0 w-[2px] ${lineColor} transition-all delay-100 duration-100 ${isActive ? "h-full" : "h-0 group-hover:h-full"}`}
      />
      <span
        className={`absolute bottom-0 right-0 h-[2px] ${lineColor} transition-all delay-200 duration-100 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
      />
      <span
        className={`absolute bottom-0 left-0 w-[2px] ${lineColor} transition-all delay-300 duration-100 ${isActive ? "h-full" : "h-0 group-hover:h-full"}`}
      />
    </button>
  );
};
