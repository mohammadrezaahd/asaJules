import React from "react";

import { Controls } from "./types";

interface ToolbarProps {
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
  lightingConfig?: {
    ambientIntensity?: number;
    directionalIntensity?: number;
    lightColor?: string;
  };
  backgroundColor?: string;
  materialMode?: 'solid' | 'wireframe';
  shadows?: boolean;
  cameraMode?: 'perspective' | 'orthographic';
  onLightingChange?: (config: {
    ambientIntensity: number;
    directionalIntensity: number;
    lightColor: string;
  }) => void;
  onBackgroundChange?: (color: string) => void;
  onMaterialModeChange?: (mode: 'solid' | 'wireframe') => void;
  onShadowsChange?: (enabled: boolean) => void;
  onCameraModeChange?: (mode: 'perspective' | 'orthographic') => void;
}

export default function Toolbar({ 
  controls, 
  setControls,
  lightingConfig = { ambientIntensity: 0.5, directionalIntensity: 1, lightColor: '#ffffff' },
  backgroundColor = '#f0f0f0',
  materialMode = 'solid',
  shadows = true,
  cameraMode = 'perspective',
  onLightingChange,
  onBackgroundChange,
  onMaterialModeChange,
  onShadowsChange,
  onCameraModeChange
}: ToolbarProps) {
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

  const handleScaleChange = (value: string) => {
    const newScale = parseFloat(value);
    setControls((prev) => ({
      ...prev,
      scale: newScale,
    }));
  };

  const handleLightingChange = (property: 'ambientIntensity' | 'directionalIntensity' | 'lightColor', value: string | number) => {
    if (onLightingChange) {
      onLightingChange({
        ambientIntensity: lightingConfig.ambientIntensity ?? 0.5,
        directionalIntensity: lightingConfig.directionalIntensity ?? 1,
        lightColor: lightingConfig.lightColor ?? '#ffffff',
        [property]: value,
      });
    }
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
    minWidth: "280px",
    maxHeight: "85vh",
    overflowY: "auto",
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

      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Scale</div>
        <div>
          <label>Scale: </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={controls.scale.toFixed(1)}
            onChange={(e) => handleScaleChange(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <button
        onClick={() =>
          setControls({ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 })
        }
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: "11px",
          marginBottom: "10px",
        }}
      >
        Reset Transform
      </button>

      {/* Lighting Controls */}
      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Lighting</div>
        <div style={{ marginBottom: "8px" }}>
          <label>Ambient: </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={lightingConfig.ambientIntensity}
            onChange={(e) => handleLightingChange('ambientIntensity', parseFloat(e.target.value))}
            style={{ width: "100px", marginRight: "8px" }}
          />
          <span style={{ fontSize: "10px" }}>{lightingConfig.ambientIntensity?.toFixed(1)}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label>Directional: </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={lightingConfig.directionalIntensity}
            onChange={(e) => handleLightingChange('directionalIntensity', parseFloat(e.target.value))}
            style={{ width: "100px", marginRight: "8px" }}
          />
          <span style={{ fontSize: "10px" }}>{lightingConfig.directionalIntensity?.toFixed(1)}</span>
        </div>
        <div>
          <label>Color: </label>
          <input
            type="color"
            value={lightingConfig.lightColor}
            onChange={(e) => handleLightingChange('lightColor', e.target.value)}
            style={{ width: "50px", height: "25px", border: "none", borderRadius: "3px" }}
          />
        </div>
      </div>

      {/* Background Color */}
      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Background</div>
        <div>
          <label>Color: </label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundChange && onBackgroundChange(e.target.value)}
            style={{ width: "50px", height: "25px", border: "none", borderRadius: "3px", marginRight: "8px" }}
          />
          <span style={{ fontSize: "10px" }}>{backgroundColor}</span>
        </div>
      </div>

      {/* Material Mode */}
      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Material</div>
        <div>
          <label>
            <input
              type="radio"
              name="materialMode"
              checked={materialMode === 'solid'}
              onChange={() => onMaterialModeChange && onMaterialModeChange('solid')}
              style={{ marginRight: "5px" }}
            />
            Solid
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              name="materialMode"
              checked={materialMode === 'wireframe'}
              onChange={() => onMaterialModeChange && onMaterialModeChange('wireframe')}
              style={{ marginRight: "5px" }}
            />
            Wireframe
          </label>
        </div>
      </div>

      {/* Shadows */}
      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Shadows</div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={shadows}
              onChange={(e) => onShadowsChange && onShadowsChange(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            Enable Shadows
          </label>
        </div>
      </div>

      {/* Camera Mode */}
      <div style={groupStyle}>
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>Camera</div>
        <div>
          <label>
            <input
              type="radio"
              name="cameraMode"
              checked={cameraMode === 'perspective'}
              onChange={() => onCameraModeChange && onCameraModeChange('perspective')}
              style={{ marginRight: "5px" }}
            />
            Perspective
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              name="cameraMode"
              checked={cameraMode === 'orthographic'}
              onChange={() => onCameraModeChange && onCameraModeChange('orthographic')}
              style={{ marginRight: "5px" }}
            />
            Orthographic
          </label>
        </div>
      </div>
    </div>
  );
}
