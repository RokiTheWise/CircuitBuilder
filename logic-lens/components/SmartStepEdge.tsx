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
  const laneX = data?.laneX as number;
  const showDot = data?.hasDot as boolean;

  // CRITICAL FIX: If a lane is specified (like 100 or 160), USE IT.
  // Otherwise, fallback to the calculated midpoint.
  const centerX =
    laneX !== undefined ? laneX : (sourceX + targetX) / 2 + offset;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
    centerX, // Now uses the forced lane
  });

  // Dot Logic: Snap to the calculated wire position
  const dotX = (data?.dotX as number) ?? centerX;
  const dotY = (data?.dotY as number) ?? sourceY;

  const strokeColor = style.stroke || "#334155";

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={7}
        style={{ pointerEvents: "none" }}
      />
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {showDot && (
        <circle cx={dotX} cy={dotY} r={4} fill={strokeColor} stroke="none" />
      )}
    </>
  );
}
