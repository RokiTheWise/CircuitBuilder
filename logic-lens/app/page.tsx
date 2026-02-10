"use client";
import React, { useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function LogicLens() {
  const [nodes, setNodes] = useState([
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Input A' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: 'Input B' } },
  ]);


  const [edges, setEdges] = useState([]);

  return (
    <div className="h-screen w-screen bg-neutral-900 text-white flex">
      <div className="w-1/3 border-r border-neutral-700 p-6 flex flex-col gap-4 z-10 bg-neutral-950">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          LogicLens
        </h1>
        <p className="text-neutral-400 text-sm">
          Configure your truth table to generate a circuit.
        </p>
        
        <div className="p-4 border border-dashed border-neutral-700 rounded-lg text-center text-neutral-500">
          [Truth Table Component Will Go Here]
        </div>
      </div>


      <div className="flex-1 h-full bg-neutral-900">
        <ReactFlow nodes={nodes} edges={edges} colorMode="dark">
          <Background color="#444" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}