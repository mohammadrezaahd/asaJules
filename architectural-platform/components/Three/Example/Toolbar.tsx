import React from "react";

// Define types for controls
interface Controls {
  position: [number, number, number];
  rotation: [number, number, number];
}

interface ToolbarProps {
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
}

export default function Toolbar({ controls, setControls }: ToolbarProps) {
  const handlePositionChange = (axis: number, value: string) => {
    const newPosition: [number, number, number] = [...controls.position];
    newPosition[axis] = parseFloat(value);
    setControls((prev) => ({
      ...prev,
      position: newPosition,
    }));
  };

  const handleRotationChange = (axis: number, value: string) => {
    const newRotation: [number, number, number] = [...controls.rotation];
    newRotation[axis] = parseFloat(value);
    setControls((prev) => ({
      ...prev,
      rotation: newRotation,
    }));
  };

  const toolbarStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "15px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "12px",
    zIndex: 1000,
    minWidth: "250px",
  };

  const groupStyle: React.CSSProperties = {
    marginBottom: "10px",
    padding: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
  };

  const inputStyle: React.CSSProperties = {
    width: "60px",
    padding: "2px 4px",
    margin: "0 5px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "3px",
  };

  return (
    <div style={toolbarStyle}>
      <h4 style={{ margin: "0 0 10px 0", color: "#fff" }}>Controls</h4>

      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Position</div>
        <div>
          <label>X: </label>
          <input
            type="number"
            step="0.1"
            value={controls.position[0].toFixed(1)}
            onChange={(e) => handlePositionChange(0, e.target.value)}
            style={inputStyle}
          />
          <label>Y: </label>
          <input
            type="number"
            step="0.1"
            value={controls.position[1].toFixed(1)}
            onChange={(e) => handlePositionChange(1, e.target.value)}
            style={inputStyle}
          />
          <label>Z: </label>
          <input
            type="number"
            step="0.1"
            value={controls.position[2].toFixed(1)}
            onChange={(e) => handlePositionChange(2, e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
          Rotation (radians)
        </div>
        <div>
          <label>X: </label>
          <input
            type="number"
            step="0.1"
            value={controls.rotation[0].toFixed(2)}
            onChange={(e) => handleRotationChange(0, e.target.value)}
            style={inputStyle}
          />
          <label>Y: </label>
          <input
            type="number"
            step="0.1"
            value={controls.rotation[1].toFixed(2)}
            onChange={(e) => handleRotationChange(1, e.target.value)}
            style={inputStyle}
          />
          <label>Z: </label>
          <input
            type="number"
            step="0.1"
            value={controls.rotation[2].toFixed(2)}
            onChange={(e) => handleRotationChange(2, e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <button
        onClick={() =>
          setControls({ position: [0, 0, 0], rotation: [0, 0, 0] })
        }
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: "11px",
        }}
      >
        Reset
      </button>
    </div>
  );
}
