import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

const PATHS = {
  // Shifted paths slightly to make room for leads
  AND: "M15,5 V45 H35 A20,20 0 0,0 35,5 Z",
  OR: "M15,5 C25,15 25,35 15,45 C40,45 55,35 55,25 C55,15 40,5 15,5 Z",
  NOT: "M15,5 V45 L45,25 Z",
  SWITCH: "M25,0 V15 M25,15 L40,10 M25,35 V50",
  BATTERY: "M10,10 H50 M20,40 H40 M30,10 V0 M30,40 V50",
  VOLT: "M30,5 A20,20 0 1,1 30,45 A20,20 0 1,1 30,5 Z",
  GND: "M15,10 H45 M20,20 H40 M25,30 H35 M30,0 V10",
  NOT_BUBBLE: { cx: 49, cy: 25 },
  GATE_BUBBLE: { cx: 59, cy: 25 },
};

const SchematicNode = ({ data }: NodeProps) => {
  const type = data.symbolType as string;
  const label = data.label as string;

  // Default to 1 input if not specified (safe fallback)
  const inputCount = (data.inputCount as number) || 1;

  const isGate = ["AND", "NAND", "OR", "NOR", "XOR"].includes(type);
  const isMultiInput = isGate && inputCount > 1;

  // Helper to generate dynamic handle positions
  const renderInputHandles = () => {
    // If it's a NOT gate or Voltmeter, just use one center handle
    if (!isMultiInput) {
      return (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={{ top: "50%", left: 0, opacity: 0, background: "blue" }}
        />
      );
    }

    // For multi-input gates, generate handles evenly spaced
    return Array.from({ length: inputCount }).map((_, i) => {
      // Calculate percentage: e.g. for 2 inputs -> 33% and 66%
      // e.g. for 3 inputs -> 25%, 50%, 75%
      const topPos = ((i + 1) / (inputCount + 1)) * 100;
      return (
        <Handle
          key={i}
          type="target"
          position={Position.Left}
          id={`in-${i}`} // Important: IDs must match what Generator produces
          style={{ top: `${topPos}%`, left: 0, opacity: 0, background: "blue" }}
        />
      );
    });
  };

  return (
    <div className="relative group w-[60px] h-[50px] flex items-center justify-center">
      {/* 1. TOP HANDLE (Power/GND) */}
      {(type === "SWITCH" || type === "GND" || type === "BATTERY") && (
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ opacity: 0, top: 0 }}
        />
      )}

      {/* 2. DYNAMIC INPUT HANDLES */}
      {(isGate || type === "NOT" || type === "VOLTMETER") &&
        renderInputHandles()}

      {/* 3. SVG GRAPHICS */}
      <svg
        width="60"
        height="50"
        viewBox="0 0 60 50"
        className="stroke-slate-900 stroke-2 fill-white overflow-visible"
      >
        {/* Draw "Leads" for every input handle */}
        {isMultiInput &&
          Array.from({ length: inputCount }).map((_, i) => {
            // Must match the % calculation above: 50 * percentage
            const yPos = 50 * ((i + 1) / (inputCount + 1));
            return (
              <path key={i} d={`M0,${yPos} H15`} strokeWidth="2" fill="none" />
            );
          })}

        {/* Single input lead (NOT gate / Voltmeter) */}
        {!isMultiInput && (type === "NOT" || isGate) && (
          <path d="M0,25 H15" strokeWidth="2" fill="none" />
        )}

        {/* Symbols */}
        {(type === "AND" || type === "NAND") && <path d={PATHS.AND} />}
        {(type === "OR" || type === "NOR") && <path d={PATHS.OR} />}
        {type === "NOT" && <path d={PATHS.NOT} />}
        {type === "SWITCH" && <path d={PATHS.SWITCH} fill="none" />}
        {type === "BATTERY" && <path d={PATHS.BATTERY} strokeWidth="3" />}
        {type === "VOLTMETER" && <path d={PATHS.VOLT} />}
        {type === "GND" && <path d={PATHS.GND} />}

        {/* Bubbles */}
        {type === "NOT" && (
          <circle
            cx={PATHS.NOT_BUBBLE.cx}
            cy={PATHS.NOT_BUBBLE.cy}
            r="4"
            className="fill-white stroke-inherit"
          />
        )}
        {(type === "NAND" || type === "NOR") && (
          <circle
            cx={PATHS.GATE_BUBBLE.cx}
            cy={PATHS.GATE_BUBBLE.cy}
            r="4"
            className="fill-white stroke-inherit"
          />
        )}

        {/* Text Labels */}
        {type === "SWITCH" && (
          <>
            <circle cx="25" cy="15" r="3" className="fill-black stroke-none" />
            <text
              x="-15"
              y="30"
              fontSize="12"
              fontWeight="bold"
              className="fill-slate-600 stroke-none"
            >
              {label}
            </text>
          </>
        )}
        {type === "BATTERY" && (
          <text
            x="-25"
            y="25"
            fontSize="12"
            className="fill-slate-500 stroke-none"
          >
            5V
          </text>
        )}
        {type === "VOLTMETER" && (
          <text
            x="30"
            y="32"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            className="fill-slate-900 stroke-none"
          >
            V
          </text>
        )}
      </svg>

      {/* 4. OUTPUT HANDLES */}
      {(type === "BATTERY" || type === "VOLTMETER") && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bot"
          style={{ opacity: 0, bottom: 0 }}
        />
      )}
      {type !== "BATTERY" && type !== "VOLTMETER" && type !== "GND" && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{ opacity: 0, right: 0, top: "50%" }}
        />
      )}
    </div>
  );
};

export default memo(SchematicNode);
