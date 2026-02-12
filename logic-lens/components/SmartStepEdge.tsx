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

  // Calculate the vertical lane (centerX).
  // Standard SmoothStep uses 50% ((sX+tX)/2).
  // We apply the offset relative to that midpoint.
  const centerX = (sourceX + targetX) / 2 + offset;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15, // Increased radius for smoother, less "robotic" turns
    centerX,
  });

  const strokeColor = style.stroke || "#334155";

  return (
    <>
      {/* 1. THE HALO (Background Bridge) */}
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={7} // Slightly thicker halo for better separation
        style={{ pointerEvents: "none" }}
      />

      {/* 2. THE WIRE */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* 3. JUNCTION DOT */}
      <circle cx={sourceX} cy={sourceY} r={3} fill={strokeColor} />
    </>
  );
}
