import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import Toolbar from "./Toolbar";
import Scene from "./Scene";
import { Controls } from "./types";

export default function App() {
  const [controls, setControls] = useState<Controls>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Scene controls={controls} setControls={setControls} />
      </Canvas>
      <Toolbar controls={controls} setControls={setControls} />

      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "11px",
          zIndex: 1001,
        }}
      >
        🖱️ Left Click + Drag: Rotate
        <br />
        🖱️ Right Click + Drag: Move Position
      </div>
    </div>
  );
}
