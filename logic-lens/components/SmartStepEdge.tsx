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
  const showDot = data?.hasDot as boolean; // Read the flag

  // Calculate the vertical lane
  const centerX = (sourceX + targetX) / 2 + offset;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // Sharp corners
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
          - Drawn on TOP of the wire
          - Uses the wire's color (red for selected, slate for normal)
      */}
      {showDot && (
        <circle
          cx={centerX}
          cy={sourceY}
          r={4}
          fill={strokeColor}
          stroke="none"
        />
      )}
    </>
  );
}
