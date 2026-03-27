"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FiPlay,
  FiMaximize,
  FiMinus,
  FiPlus,
  FiDownload,
  FiGithub,
  FiInfo,
  FiGrid,
} from "react-icons/fi";
import { toPng, toJpeg } from "html-to-image";

import { generateCircuit } from "@/utils/CircuitGenerator";
import { generateSchematic } from "@/utils/SchematicGenerator";
import { getSimplifiedEquation } from "@/utils/BooleanSimplifier";
import { parseEquationToTable } from "@/utils/EquationParser";
import TruthTable from "@/components/truthtable";
import SchematicNode from "@/components/SchematicNode";
import SmartStepEdge from "@/components/SmartStepEdge";

export type GateMode = "STANDARD" | "NAND" | "NOR";
export type DisplayStyle = "BLOCK" | "SCHEMATIC";

function ModernControls() {
  const { fitView } = useReactFlow();

  return (
    <Panel
      position="bottom-right"
      className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-full flex items-center p-1 mb-4 mr-4 lg:mb-8 lg:mr-8 z-50"
    >
      <button
        onClick={() => fitView({ duration: 500, padding: 0.2 })}
        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-all"
        title="Fit to View"
      >
        <FiMaximize className="text-base" />
      </button>
    </Panel>
  );
}

export default function LogicLens() {
  const [numInputs, setNumInputs] = useState(3);
  const [tableOutputs, setTableOutputs] = useState<Record<number, number>>({});
  const [gateMode, setGateMode] = useState<GateMode>("STANDARD");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("SCHEMATIC");
  const [isInteractive] = useState(true);
  const [draftEquation, setDraftEquation] = useState<string>("");
  const [activeEquation, setActiveEquation] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ schematic: SchematicNode }), []);
  const edgeTypes = useMemo(() => ({ smart: SmartStepEdge }), []);

  useEffect(() => {
    let result;
    if (displayStyle === "SCHEMATIC") {
      result = generateSchematic(numInputs, tableOutputs, gateMode);
    } else {
      result = generateCircuit(numInputs, tableOutputs, gateMode);
    }
    setNodes(result.nodes);
    setEdges(result.edges);

    const simplified = getSimplifiedEquation(numInputs, tableOutputs);
    setActiveEquation(simplified);

    const currentDraftTable = parseEquationToTable(draftEquation, numInputs);
    const isDraftEquivalent =
      currentDraftTable &&
      Object.keys(tableOutputs).every(
        (key) => currentDraftTable[Number(key)] === tableOutputs[Number(key)],
      );

    if (!isDraftEquivalent) {
      setDraftEquation(simplified);
    }

    setErrorMsg(null);
  }, [numInputs, tableOutputs, gateMode, displayStyle]);

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftEquation(e.target.value);
    setErrorMsg(null);
  };

  const handleGenerate = () => {
    const val = draftEquation.toUpperCase();

    const invalidChars = val.match(/[^A-E0-1\+\'\(\)\s\u2018\u2019`]/g);
    if (invalidChars) {
      setErrorMsg(`Invalid: "${invalidChars[0]}"`);
      return;
    }

    const uniqueVars = new Set(val.match(/[A-E]/g));
    let requiredInputs = numInputs;
    uniqueVars.forEach((char) => {
      const varIndex = char.charCodeAt(0) - 64;
      if (varIndex > requiredInputs) requiredInputs = varIndex;
    });
    requiredInputs = Math.min(5, requiredInputs);

    if (requiredInputs > numInputs) setNumInputs(requiredInputs);

    const newTable = parseEquationToTable(val, requiredInputs);
    if (newTable) {
      setTableOutputs(newTable);
      setErrorMsg(null);
    } else if (val.trim() !== "") {
      setErrorMsg("Invalid syntax");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate();
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const circuitElement = document.querySelector(
        ".react-flow__renderer",
      ) as HTMLElement;
      if (!circuitElement) return;

      await new Promise((resolve) => setTimeout(resolve, 300));

      const circuitImgData = await toJpeg(circuitElement, {
        quality: 0.9,
        backgroundColor: "#ffffff",
        width: circuitElement.offsetWidth,
        height: circuitElement.offsetHeight,
        pixelRatio: 1,
        cacheBust: true,
      });

      const reportContainer = document.createElement("div");
      reportContainer.style.cssText =
        "position:fixed;top:0;left:0;z-index:-100;width:800px;padding:40px;background:#ffffff;font-family:sans-serif;color:#0f172a;";

      let tableRows = "";
      const maxRows = Math.pow(2, numInputs);
      const headers = Array.from({ length: numInputs }, (_, i) =>
        String.fromCharCode(65 + i),
      ).join("</th><th>");

      for (let i = 0; i < maxRows; i++) {
        const binary = i.toString(2).padStart(numInputs, "0");
        const cols = binary
          .split("")
          .map((bit) => `<td style="padding:4px;">${bit}</td>`)
          .join("");
        const out = tableOutputs[i] === 1 ? 1 : 0;
        const color =
          out === 1 ? "color:#2563eb;font-weight:bold;" : "color:#94a3b8;";
        tableRows += `<tr style="border-bottom:1px solid #e2e8f0;text-align:center;height:30px;">${cols}<td style="${color}padding:4px;">${out}</td></tr>`;
      }

      reportContainer.innerHTML = `
        <div style="display:flex;align-items:center;gap:15px;margin-bottom:30px;border-bottom:2px solid #e2e8f0;padding-bottom:20px;">
          <h1 style="margin:0;font-size:32px;font-weight:900;">Logi<span style="color:#2563eb">Sketch</span> Report</h1>
        </div>
        <div style="margin-bottom:30px;">
          <h3 style="font-size:14px;text-transform:uppercase;color:#64748b;font-weight:bold;margin-bottom:5px;">Boolean Equation</h3>
          <div style="font-size:36px;font-weight:900;color:#0f172a;">Q = ${activeEquation || "?"}</div>
        </div>
        <div style="display:flex;gap:40px;align-items:flex-start;">
          <div style="flex:0 0 200px;">
            <h3 style="font-size:14px;text-transform:uppercase;color:#64748b;font-weight:bold;margin-bottom:10px;">Truth Table</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead><tr style="background:#f1f5f9;height:35px;"><th>${headers}</th><th style="color:#2563eb;">OUT</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
          <div style="flex:1;">
            <h3 style="font-size:14px;text-transform:uppercase;color:#64748b;font-weight:bold;margin-bottom:10px;">Logic Circuit</h3>
            <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);">
              <img src="${circuitImgData}" style="width:100%;display:block;" />
            </div>
          </div>
        </div>
        <div style="margin-top:40px;text-align:right;font-size:12px;color:#94a3b8;">Generated with LogiSketch</div>
      `;

      document.body.appendChild(reportContainer);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalReportUrl = await toPng(reportContainer, {
        cacheBust: true,
        pixelRatio: 1.5,
      });

      document.body.removeChild(reportContainer);

      const a = document.createElement("a");
      a.setAttribute("download", "logisketch-report.png");
      a.setAttribute("href", finalReportUrl);
      a.click();
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const showSimplified =
    activeEquation &&
    activeEquation.replace(/\s+/g, "") !==
      draftEquation.toUpperCase().replace(/\s+/g, "");

  const gateModes = [
    {
      mode: "STANDARD" as GateMode,
      label: "Standard",
      activeClass: "bg-blue-600 shadow-blue-900/40 text-white",
    },
    {
      mode: "NAND" as GateMode,
      label: "NAND",
      activeClass: "bg-purple-600 shadow-purple-900/40 text-white",
    },
    {
      mode: "NOR" as GateMode,
      label: "NOR",
      activeClass: "bg-orange-500 shadow-orange-900/40 text-white",
    },
  ];

  return (
    <div className="h-[100dvh] w-screen flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="order-last lg:order-first w-full lg:w-[400px] flex-none bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-800 h-full z-10 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-700 shrink-0">
              <Image
                src="/LogiSketch.png"
                alt="LogiSketch Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Logi<span className="text-blue-400">Sketch</span>
              </h1>
              <p className="text-slate-500 text-[9px] mt-0.5 font-semibold uppercase tracking-widest">
                Boolean Logic Visualizer
              </p>
            </div>
          </div>

          {/* Action icon buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              title={isGenerating ? "Generating…" : "Download Report"}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiDownload className="text-sm" />
            </button>
            <button
              onClick={() =>
                window.open(
                  "https://github.com/RokiTheWise/CircuitBuilder",
                  "_blank",
                )
              }
              title="View Source"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiGithub className="text-sm" />
            </button>
            <button
              onClick={() =>
                window.open("https://djenriquez.dev/", "_blank")
              }
              title="View Portfolio"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiGrid className="text-sm" />
            </button>
            <button
              onClick={() => (window.location.href = "/how-it-works")}
              title="How It Works"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiInfo className="text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-5 flex flex-col gap-5">
          {/* Gate Mode */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
              Gate Mode
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {gateModes.map(({ mode, label, activeClass }) => (
                <button
                  key={mode}
                  onClick={() => setGateMode(mode)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    gateMode === mode
                      ? `${activeClass} shadow-lg`
                      : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Display Style + Inputs row */}
          <div className="flex gap-3">
            {/* Display Style */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Display
              </p>
              <div className="bg-slate-800 rounded-xl p-1 flex relative h-[42px]">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-600 rounded-lg transition-all duration-300 ${
                    displayStyle === "BLOCK" ? "left-1" : "left-[calc(50%+0px)]"
                  }`}
                />
                <button
                  onClick={() => setDisplayStyle("BLOCK")}
                  className={`flex-1 relative z-10 text-[11px] font-bold rounded-lg transition-colors ${
                    displayStyle === "BLOCK"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Blocks
                </button>
                <button
                  onClick={() => setDisplayStyle("SCHEMATIC")}
                  className={`flex-1 relative z-10 text-[11px] font-bold rounded-lg transition-colors ${
                    displayStyle === "SCHEMATIC"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Schematic
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="w-[120px]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Inputs
              </p>
              <div className="bg-slate-800 rounded-xl px-2 flex items-center justify-between h-[42px]">
                <button
                  onClick={() => setNumInputs(Math.max(1, numInputs - 1))}
                  disabled={numInputs <= 1}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all ${
                    numInputs <= 1
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <FiMinus />
                </button>
                <span className="text-white font-black text-xl tabular-nums w-5 text-center">
                  {numInputs}
                </span>
                <button
                  onClick={() => setNumInputs(Math.min(5, numInputs + 1))}
                  disabled={numInputs >= 5}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all ${
                    numInputs >= 5
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>

          {/* Equation Input */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Equation
              </p>
              {errorMsg && (
                <span className="text-[9px] font-bold text-red-400 bg-red-900/30 border border-red-800/50 px-2 py-0.5 rounded-full animate-pulse">
                  {errorMsg}
                </span>
              )}
            </div>

            <div
              className={`rounded-xl border transition-all ${
                errorMsg
                  ? "border-red-700/60 bg-red-950/20"
                  : "border-slate-700 bg-slate-800 focus-within:border-blue-500/60"
              }`}
            >
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                <span
                  className={`text-2xl font-black select-none shrink-0 ${errorMsg ? "text-red-500" : "text-blue-400"}`}
                >
                  Q =
                </span>
                <input
                  id="equation-input"
                  type="text"
                  value={draftEquation}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  placeholder="AB + C'"
                  className={`w-full bg-transparent border-none focus:outline-none text-2xl font-black font-mono placeholder-slate-700 uppercase tracking-tight ${
                    errorMsg ? "text-red-300" : "text-slate-100"
                  }`}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="flex items-center justify-between px-4 pb-3 gap-3">
                <div className="flex-1 min-w-0">
                  {showSimplified ? (
                    <button
                      onClick={() => setDraftEquation(activeEquation)}
                      className="flex items-center gap-1.5 group"
                    >
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
                        Simplified →
                      </span>
                      <span className="text-xs font-black text-blue-400 group-hover:text-blue-300 transition-colors font-mono truncate">
                        {activeEquation}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-700">
                      ↵ Enter to run
                    </span>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-blue-900/50 transition-all active:scale-95 shrink-0"
                >
                  <FiPlay className="text-xs" />
                  <span>Run</span>
                </button>
              </div>
            </div>
          </div>

          {/* Truth Table */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
              Truth Table
            </p>
            <TruthTable
              dark
              numInputs={numInputs}
              outputs={tableOutputs}
              setOutputs={setTableOutputs}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-800">
          <p className="text-[10px] font-semibold text-slate-600 text-center">
            Made by{" "}
            <a
              href="https://djenriquez.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 transition-colors"
            >
              Dexter Jethro Enriquez
            </a>
          </p>
        </div>
      </div>

      {/* CANVAS */}
      <div className="order-first lg:order-last w-full lg:flex-1 h-[40vh] lg:h-full relative bg-slate-50 shrink-0 min-h-[300px] touch-none">
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
          panOnDrag={isInteractive}
          zoomOnScroll={isInteractive}
          zoomOnPinch={isInteractive}
          zoomOnDoubleClick={isInteractive}
          nodesConnectable={isInteractive}
          nodesDraggable={isInteractive}
          elementsSelectable={isInteractive}
        >
          <Background variant={BackgroundVariant.Dots} color="#d1d5db" gap={20} size={1.5} />
          <ModernControls />
        </ReactFlow>
      </div>

      {/* SEO-focused Semantic Content (Visually Hidden) */}
      <section className="sr-only">
        <h2>LogiSketch: The Professional Logic Circuit Simulator</h2>
        <p>
          LogiSketch is a comprehensive digital logic tool designed for students
          and engineers to visualize boolean algebra and design complex circuits
          instantly. Our boolean expression to circuit generator simplifies the
          process of converting truth tables to logic diagrams.
        </p>
        <ul>
          <li>
            <strong>Boolean Equation to Circuit:</strong> Input any boolean
            expression using variables A-E and watch it transform into a
            professional schematic.
          </li>
          <li>
            <strong>Truth Table Generator:</strong> Automatically generate truth
            tables for any logic circuit and toggle outputs to synthesize new
            equations.
          </li>
          <li>
            <strong>Logic Simplification:</strong> Built-in Quine-McCluskey
            algorithm (QMC) for instant boolean reduction and optimization.
          </li>
          <li>
            <strong>Universal Logic:</strong> Support for Standard, NAND-only,
            and NOR-only gate implementations.
          </li>
          <li>
            <strong>Educational Resource:</strong> Perfect for computer science
            students learning digital electronics, Karnaugh maps, and De
            Morgan&apos;s laws.
          </li>
        </ul>
        <p>
          Whether you need a truth table to logic diagram solver or an
          interactive logic gate simulator, LogiSketch provides the most
          intuitive online experience for digital circuit design.
        </p>
      </section>
    </div>
  );
}
