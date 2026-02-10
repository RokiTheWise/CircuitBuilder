"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import Counter from "@/components/counter";
import StaggeredDropDown from "@/components/StaggeredDropdown";

export type GateMode = "STANDARD" | "NAND" | "NOR";

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});
  const [gateMode, setGateMode] = useState<GateMode>("STANDARD");
  const [equation, setEquation] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg(null);
    }
  }, [numInputs, tableOutputs, gateMode, isTyping]);

  // 2. INPUT HANDLER
  const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEquation(val);
    setIsTyping(true);
    setErrorMsg(null);

    const invalidChars = val
      .toUpperCase()
      .match(/[^A-E0-1\+\'\(\)\s\u2018\u2019`]/g);
    if (invalidChars) {
      setErrorMsg(
        `Invalid character: "${invalidChars[0]}". Only A-E, 0, 1 allowed.`,
      );
    }

    const uniqueVars = new Set(val.toUpperCase().match(/[A-E]/g));
    let requiredInputs = numInputs;

    uniqueVars.forEach((char) => {
      const varIndex = char.charCodeAt(0) - 64;
      if (varIndex > requiredInputs) requiredInputs = varIndex;
    });

    requiredInputs = Math.min(5, requiredInputs);

    if (requiredInputs > numInputs) {
      setNumInputs(requiredInputs);
    }

    const newTable = parseEquationToTable(val, requiredInputs);
    if (newTable) {
      setTableOutputs(newTable);
    } else if (val.trim() !== "") {
      if (!invalidChars)
        setErrorMsg("Invalid syntax. Check parentheses or operators.");
    }
  };

  const handleBlur = () => {
    setIsTyping(false);
    setErrorMsg(null);
    const eq = getSimplifiedEquation(numInputs, tableOutputs);
    setEquation(eq);
  };

  return (
    // FIX 1: Add ID "main-layout" here so we can screenshot the whole app
    <div
      id="main-layout"
      className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans"
    >
      {/* SIDEBAR */}
      <div className="w-[400px] border-r border-slate-200 p-6 flex flex-col gap-6 bg-white h-full overflow-y-auto shadow-xl z-10">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2">
          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <Image
              src="/LogiSketch.png"
              alt="LogiSketch Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Logi<span className="text-blue-600">Sketch</span>
            </h1>
            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">
              Visualize boolean logic
            </p>
          </div>
        </div>

        {/* MODE SELECTOR */}
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
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
              className={`px-3 py-1 rounded shadow-sm text-xs font-bold transition-colors border
                ${
                  numInputs <= 1
                    ? "bg-slate-200 text-slate-400 border-transparent cursor-not-allowed"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
            >
              -
            </button>
            <button
              onClick={() => setNumInputs(Math.min(5, numInputs + 1))}
              disabled={numInputs >= 5}
              className={`px-3 py-1 rounded shadow-sm text-xs font-bold transition-colors
                ${
                  numInputs >= 5
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                }`}
            >
              +
            </button>
          </div>
        </div>

        {/* EQUATION INPUT (FIXED STYLING) */}
        <div
          className={`border rounded-lg p-4 transition-all focus-within:ring-2 
            ${
              errorMsg
                ? "bg-red-50 border-red-200 focus-within:ring-red-300"
                : "bg-blue-50 border-blue-200 focus-within:ring-blue-400"
            }`}
        >
          <div className="flex justify-between items-start mb-1">
            <label
              htmlFor="equation-input"
              className={`text-[10px] font-bold uppercase tracking-wider block
                ${errorMsg ? "text-red-500" : "text-blue-500"}`}
            >
              Boolean Equation
            </label>
            {errorMsg && (
              <span className="text-[9px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                ERROR
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {" "}
            {/* Reduced gap */}
            {/* FIX 2: Matched font style to input (2xl, sans, black) */}
            <span
              className={`text-2xl font-sans font-black select-none ${errorMsg ? "text-red-400" : "text-blue-600"}`}
            >
              Q=
            </span>
            <input
              id="equation-input"
              type="text"
              value={equation}
              onChange={handleEquationChange}
              onBlur={handleBlur}
              placeholder="A'B'..."
              className={`w-full bg-transparent border-none focus:outline-none text-2xl font-sans font-black placeholder-slate-300 uppercase tracking-tight
                ${errorMsg ? "text-red-800" : "text-slate-800"}`}
              autoComplete="off"
            />
          </div>

          <p
            className={`text-[10px] mt-2 transition-colors ${errorMsg ? "text-red-500 font-semibold" : "text-blue-400"}`}
          >
            {errorMsg ||
              "Type equation to update circuit. Supported: A-E, 0, 1, +, ', ()."}
          </p>
        </div>

        <TruthTable
          numInputs={numInputs}
          outputs={tableOutputs}
          setOutputs={setTableOutputs}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 h-full relative bg-slate-50">
        {/* DROPDOWN MENU - With Data Props Passed Down */}
        <StaggeredDropDown
          equation={equation}
          numInputs={numInputs}
          tableOutputs={tableOutputs}
        />

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

// ... (DrawOutlineButton stays the same) ...
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
      className={`group relative flex-1 px-4 py-2 text-xs font-bold transition-colors duration-[400ms]
        ${isActive ? `bg-white ${textColor} shadow-sm` : "text-slate-500 hover:text-slate-700 bg-transparent"}
      `}
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
