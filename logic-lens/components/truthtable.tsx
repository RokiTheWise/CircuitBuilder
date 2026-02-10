"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi"; // Simple toggle icon

interface TruthTableProps {
  numInputs: number;
  outputs: Record<number, number>;
  setOutputs: (outputs: Record<number, number>) => void;
}

export default function TruthTable({
  numInputs,
  outputs,
  setOutputs,
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
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col max-h-[400px] overflow-hidden">
      <div className="overflow-auto w-full">
        <table className="w-full text-sm text-left text-slate-600 relative border-collapse">
          <thead className="text-[10px] text-slate-400 uppercase sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 border-r border-slate-100 bg-slate-50 font-bold text-center"
                >
                  {h}
                </th>
              ))}
              <th className="px-3 py-3 text-center text-blue-600 bg-blue-50 font-black border-b border-blue-100">
                OUT
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {Array.from({ length: totalRows }).map((_, rowIndex) => {
              const binary = rowIndex.toString(2).padStart(numInputs, "0");
              const isHigh = outputs[rowIndex] === 1;

              return (
                <tr
                  key={rowIndex}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  {binary.split("").map((bit, i) => (
                    <td
                      key={i}
                      className="px-3 py-2 border-r border-slate-50 font-mono text-center text-slate-400 group-hover:text-slate-600 transition-colors"
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
                      className={`
                      mx-auto w-full max-w-[50px] py-1 rounded-md font-black text-xs transition-all duration-200 flex items-center justify-center gap-1
                      ${
                        isHigh
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100 scale-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 scale-95 hover:scale-100"
                      }
                    `}
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

                      {/* Suble icon that appears on row hover to signal "change" */}
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
