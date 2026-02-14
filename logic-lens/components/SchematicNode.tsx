import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

const PATHS = {
  AND: "M15,5 V45 H35 A20,20 0 0,0 35,5 Z",
  OR: "M15,5 C25,15 25,35 15,45 C40,45 55,35 55,25 C55,15 40,5 15,5 Z",
  NOT: "M15,5 V45 L45,25 Z",

  // Triangle Switch
  SWITCH_LEVER: "M20,25 L45,15",
  SWITCH_VCC_WIRE: "M0,25 L20,25",
  SWITCH_OUT_WIRE: "M45,15 L60,25",
  // Ground Path: Down to 45, then Left to edge (0,45)
  SWITCH_GND_WIRE: "M45,35 V45 H0",

  BATTERY: "M30,0 V15 M10,15 H50 M20,22 H40 M10,29 H50 M20,36 H40 M30,36 V50",
  VOLT: "M30,5 A20,20 0 1,1 30,45 A20,20 0 1,1 30,5 Z",
  GND: "M30,0 V15 M15,15 H45 M20,25 H40 M25,35 H35",
  NOT_BUBBLE: { cx: 49, cy: 25 },
  GATE_BUBBLE: { cx: 59, cy: 25 },
};

const SchematicNode = ({ data }: NodeProps) => {
  const type = data.symbolType as string;
  const label = data.label as string;
  const inputCount = (data.inputCount as number) || 1;
  const isGate = ["AND", "NAND", "OR", "NOR", "XOR"].includes(type);
  const isMultiInput = isGate && inputCount > 1;

  const renderInputHandles = () => {
    if (!isMultiInput)
      return (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={{ top: "50%", left: 0, opacity: 0 }}
        />
      );
    return Array.from({ length: inputCount }).map((_, i) => (
      <Handle
        key={i}
        type="target"
        position={Position.Left}
        id={`in-${i}`}
        style={{
          top: `${((i + 1) / (inputCount + 1)) * 100}%`,
          left: 0,
          opacity: 0,
        }}
      />
    ));
  };

  return (
    <div className="relative group w-[60px] h-[50px] flex items-center justify-center">
      {type === "SWITCH" && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="vcc"
            style={{ opacity: 0, left: 0, top: "50%" }}
          />
          {/* Ground Handle: Left side, near bottom (90%) */}
          <Handle
            type="source"
            position={Position.Left}
            id="gnd"
            style={{ opacity: 0, left: 0, top: "90%" }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="out"
            style={{ opacity: 0, right: 0, top: "50%" }}
          />
        </>
      )}

      {(type === "GND" || type === "BATTERY") && (
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ opacity: 0, top: 0 }}
        />
      )}
      {type === "BATTERY" && (
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          style={{ opacity: 0, top: 0 }}
        />
      )}
      {(isGate || type === "NOT" || type === "VOLTMETER") &&
        renderInputHandles()}
      {type === "GND" && (
        <Handle
          type="target"
          position={Position.Right}
          id="right-in"
          style={{ opacity: 0, right: 0, top: 0 }}
        />
      )}

      <svg
        width="60"
        height="50"
        viewBox="0 0 60 50"
        className="stroke-slate-900 stroke-2 fill-white overflow-visible"
      >
        {/* Leads and Standard Components */}
        {isMultiInput
          ? Array.from({ length: inputCount }).map((_, i) => (
              <path
                key={i}
                d={`M0,${50 * ((i + 1) / (inputCount + 1))} H15`}
                strokeWidth="2"
                fill="none"
              />
            ))
          : (type === "NOT" || isGate) && (
              <path d="M0,25 H15" strokeWidth="2" fill="none" />
            )}
        {(type === "AND" || type === "NAND") && (
          <path d="M35,25 H60" strokeWidth="2" fill="none" />
        )}
        {type === "NOT" && <path d="M45,25 H60" strokeWidth="2" fill="none" />}
        {(type === "OR" || type === "NOR") && (
          <path d="M55,25 H60" strokeWidth="2" fill="none" />
        )}
        {(type === "AND" || type === "NAND") && <path d={PATHS.AND} />}
        {(type === "OR" || type === "NOR") && <path d={PATHS.OR} />}
        {type === "NOT" && <path d={PATHS.NOT} />}

        {type === "SWITCH" && (
          <>
            <path d={PATHS.SWITCH_VCC_WIRE} strokeWidth="2" fill="none" />
            <path d={PATHS.SWITCH_OUT_WIRE} strokeWidth="2" fill="none" />
            <path d={PATHS.SWITCH_GND_WIRE} strokeWidth="2" fill="none" />
            <circle
              cx="20"
              cy="25"
              r="3"
              className="fill-white stroke-inherit stroke-2"
            />
            <circle
              cx="45"
              cy="15"
              r="3"
              className="fill-white stroke-inherit stroke-2"
            />
            <circle
              cx="45"
              cy="35"
              r="3"
              className="fill-white stroke-inherit stroke-2"
            />
            <path
              d={PATHS.SWITCH_LEVER}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {type === "BATTERY" && <path d={PATHS.BATTERY} strokeWidth="2" />}
        {type === "VOLTMETER" && <path d={PATHS.VOLT} />}
        {type === "GND" && (
          <>
            <path d={PATHS.GND} />
            <path d="M60,0 L30,0" strokeWidth="2" fill="none" />
            <circle
              cx="30"
              cy="0"
              r="3"
              className="fill-slate-900 stroke-none"
            />
          </>
        )}
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

        {/* SWITCH LABEL - Adjusted y from 30 to 20 to clear the wire */}
        {type === "SWITCH" && (
          <text
            x="-15"
            y="20"
            fontSize="14"
            fontWeight="bold"
            className="fill-slate-600 stroke-none"
          >
            {label}
          </text>
        )}
        {type === "BATTERY" && (
          <>
            <text
              x="-15"
              y="15"
              fontSize="14"
              className="fill-red-500 stroke-none font-bold"
            >
              +
            </text>
            <text
              x="-15"
              y="45"
              fontSize="14"
              className="fill-slate-700 stroke-none font-bold"
            >
              -
            </text>
          </>
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

      {(type === "BATTERY" || type === "VOLTMETER") && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bot"
          style={{ opacity: 0, bottom: 0 }}
        />
      )}
      {(isGate || type === "NOT") && (
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
