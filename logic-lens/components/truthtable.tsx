"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";

interface TruthTableProps {
  numInputs: number;
  outputs: Record<number, number>;
  setOutputs: (outputs: Record<number, number>) => void;
  dark?: boolean;
}

export default function TruthTable({
  numInputs,
  outputs,
  setOutputs,
  dark = false,
}: TruthTableProps) {
  const totalRows = Math.pow(2, numInputs);
  const headers = Array.from({ length: numInputs }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  const toggleOutput = (rowIndex: number) => {
    const newVal = outputs[rowIndex] === 1 ? 0 : 1;
    setOutputs({ ...outputs, [rowIndex]: newVal });
  };

  return (
    <div
      className={`border rounded-xl flex flex-col max-h-[320px] overflow-hidden ${
        dark
          ? "border-slate-700 bg-slate-800/30"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="overflow-auto w-full">
        <table className="w-full text-sm text-left relative border-collapse">
          <thead className="text-[10px] uppercase sticky top-0 z-10">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className={`px-3 py-2.5 border-r text-center font-bold ${
                    dark
                      ? "bg-slate-800 text-slate-500 border-slate-700"
                      : "bg-slate-50 text-slate-400 border-slate-100"
                  }`}
                >
                  {h}
                </th>
              ))}
              <th
                className={`px-3 py-2.5 text-center font-black border-b ${
                  dark
                    ? "bg-blue-950/40 text-blue-400 border-blue-900/30"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                OUT
              </th>
            </tr>
          </thead>

          <tbody
            className={`divide-y ${dark ? "divide-slate-800" : "divide-slate-50"}`}
          >
            {Array.from({ length: totalRows }).map((_, rowIndex) => {
              const binary = rowIndex.toString(2).padStart(numInputs, "0");
              const isHigh = outputs[rowIndex] === 1;

              return (
                <tr
                  key={rowIndex}
                  className={`group transition-colors ${
                    dark ? "hover:bg-slate-700/30" : "hover:bg-slate-50/50"
                  }`}
                >
                  {binary.split("").map((bit, i) => (
                    <td
                      key={i}
                      className={`px-3 py-2 border-r font-mono text-center transition-colors ${
                        dark
                          ? "border-slate-800 text-slate-600 group-hover:text-slate-400"
                          : "border-slate-50 text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {bit}
                    </td>
                  ))}

                  {/* INTERACTIVE CELL */}
                  <td
                    onClick={() => toggleOutput(rowIndex)}
                    className="p-1 text-center cursor-pointer select-none relative"
                  >
                    <div
                      className={`mx-auto w-full max-w-[50px] py-1 rounded-md font-black text-xs transition-all duration-200 flex items-center justify-center gap-1 ${
                        isHigh
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 scale-100"
                          : dark
                            ? "bg-slate-700 text-slate-500 hover:bg-slate-600 scale-95 hover:scale-100"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200 scale-95 hover:scale-100"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isHigh ? "1" : "0"}
                          initial={{ y: -5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 5, opacity: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          {isHigh ? 1 : 0}
                        </motion.span>
                      </AnimatePresence>

                      <FiRefreshCw className="text-[10px] opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
