import React from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";

export default function SmartStepEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const offset = (data?.offset as number) || 0;

  // FIX: Read 'hasDot' instead of 'isBranching' to match the generator
  const showDot = data?.hasDot as boolean;

  const centerX = (sourceX + targetX) / 2 + offset;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // Keep sharp corners for precision
    centerX,
  });

  const strokeColor = style.stroke || "#334155";

  return (
    <>
      {/* 1. HALO (Bridge effect) */}
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={7}
        style={{ pointerEvents: "none" }}
      />

      {/* 2. WIRE */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* 3. JUNCTION DOT 
          Only renders if 'hasDot' is true (calculated by generator).
          Places a solder dot exactly at the T-junction corner.
      */}
      {showDot && (
        <circle
          cx={centerX}
          cy={sourceY}
          r={3.5}
          fill={strokeColor}
          stroke="none"
        />
      )}
    </>
  );
}
