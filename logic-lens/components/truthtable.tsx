"use client";
import React from "react";

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
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 border-r border-slate-200 font-semibold"
              >
                {h}
              </th>
            ))}
            <th className="px-3 py-2 text-center text-blue-600 bg-blue-50/50">
              OUT
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }).map((_, rowIndex) => {
            const binary = rowIndex.toString(2).padStart(numInputs, "0");
            const isHigh = outputs[rowIndex] === 1;

            return (
              <tr
                key={rowIndex}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {binary.split("").map((bit, i) => (
                  <td
                    key={i}
                    className="px-3 py-2 border-r border-slate-100 font-mono text-slate-500"
                  >
                    {bit}
                  </td>
                ))}
                <td
                  onClick={() => toggleOutput(rowIndex)}
                  className={`px-3 py-2 text-center cursor-pointer font-bold select-none transition-all
                    ${
                      isHigh
                        ? "bg-blue-100 text-blue-700 shadow-inner"
                        : "text-slate-300 hover:text-slate-400 hover:bg-slate-50"
                    }`}
                >
                  {isHigh ? 1 : 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
