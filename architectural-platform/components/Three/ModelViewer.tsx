import { Canvas } from "@react-three/fiber";
import React, { useState, useRef, useEffect } from "react";
import Toolbar from "./Toolbar";
import Scene from "./Scene";
import { Controls } from "@/types/interfaces/model.interface";

interface IExAppProps {
  modelUrl: string;
  initialConfig?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    ambientIntensity?: number;
    directionalIntensity?: number;
    lightColor?: string;
    backgroundColor?: string;
    materialMode?: "solid" | "wireframe";
    shadows?: boolean;
    cameraMode?: "perspective" | "orthographic";
  };
  onConfigChange?: (config: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    ambientIntensity?: number;
    directionalIntensity?: number;
    lightColor?: string;
    backgroundColor?: string;
    materialMode?: "solid" | "wireframe";
    shadows?: boolean;
    cameraMode?: "perspective" | "orthographic";
  }) => void;
  isAdmin?: boolean;
}

const ModelViewer: React.FC<IExAppProps> = ({
  modelUrl,
  initialConfig,
  onConfigChange,
  isAdmin = false,
}) => {
  console.log("ExampleApp received modelUrl:", modelUrl);
  console.log("ExampleApp received initialConfig:", initialConfig);
  console.log("ExampleApp isAdmin mode:", isAdmin);

  const [controls, setControls] = useState<Controls>({
    position: initialConfig?.position ?? [0, 0, 0],
    rotation: initialConfig?.rotation ?? [0, 0, 0],
    scale: initialConfig?.scale ?? 1,
  });

  const [lightingConfig, setLightingConfig] = useState({
    ambientIntensity: initialConfig?.ambientIntensity ?? 0.5,
    directionalIntensity: initialConfig?.directionalIntensity ?? 1,
    lightColor: initialConfig?.lightColor ?? "#ffffff",
  });

  const [backgroundColor, setBackgroundColor] = useState(
    initialConfig?.backgroundColor ?? "#f0f0f0"
  );
  const [materialMode, setMaterialMode] = useState<"solid" | "wireframe">(
    initialConfig?.materialMode ?? "solid"
  );
  const [shadows, setShadows] = useState(initialConfig?.shadows ?? true);
  const [cameraMode, setCameraMode] = useState<"perspective" | "orthographic">(
    initialConfig?.cameraMode ?? "perspective"
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseOverRef = useRef(false);

  // Handle mouse enter/leave to track when cursor is over container
  const handleMouseEnter = () => {
    isMouseOverRef.current = true;
  };

  const handleMouseLeave = () => {
    isMouseOverRef.current = false;
  };

  // Handle wheel events with proper event listener
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Only prevent default if mouse is over our container
      if (isMouseOverRef.current) {
        event.preventDefault();
        event.stopPropagation();

        const scaleSensitivity = 0.001;
        const scaleChange = -event.deltaY * scaleSensitivity;
        const newScale = Math.max(
          0.1,
          Math.min(10, controls.scale + scaleChange)
        );

        setControls((prev) => {
          const newControls = {
            ...prev,
            scale: newScale,
          };
          // Notify parent if callback is provided
          if (onConfigChange) {
            onConfigChange(newControls);
          }
          return newControls;
        });
      }
    };

    // Add event listener to document with passive: false
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [controls.scale, onConfigChange]);

  // Wrapper function for setControls to notify parent
  const handleSetControls = (
    newControls: Controls | ((prev: Controls) => Controls)
  ) => {
    setControls((prev) => {
      const finalControls =
        typeof newControls === "function" ? newControls(prev) : newControls;
      // Notify parent if callback is provided
      if (onConfigChange) {
        onConfigChange({
          ...finalControls,
          ambientIntensity: lightingConfig.ambientIntensity,
          directionalIntensity: lightingConfig.directionalIntensity,
          lightColor: lightingConfig.lightColor,
          backgroundColor,
          materialMode,
          shadows,
          cameraMode,
        });
      }
      return finalControls;
    });
  };

  // Handler for lighting changes
  const handleLightingChange = (newLightingConfig: {
    ambientIntensity: number;
    directionalIntensity: number;
    lightColor: string;
  }) => {
    setLightingConfig(newLightingConfig);
    if (onConfigChange) {
      onConfigChange({
        ...controls,
        ...newLightingConfig,
        backgroundColor,
        materialMode,
        shadows,
        cameraMode,
      });
    }
  };

  // Handler for background color changes
  const handleBackgroundChange = (color: string) => {
    setBackgroundColor(color);
    if (onConfigChange) {
      onConfigChange({
        ...controls,
        ambientIntensity: lightingConfig.ambientIntensity,
        directionalIntensity: lightingConfig.directionalIntensity,
        lightColor: lightingConfig.lightColor,
        backgroundColor: color,
        materialMode,
        shadows,
        cameraMode,
      });
    }
  };

  // Handler for material mode changes
  const handleMaterialModeChange = (mode: "solid" | "wireframe") => {
    setMaterialMode(mode);
    if (onConfigChange) {
      onConfigChange({
        ...controls,
        ambientIntensity: lightingConfig.ambientIntensity,
        directionalIntensity: lightingConfig.directionalIntensity,
        lightColor: lightingConfig.lightColor,
        backgroundColor,
        materialMode: mode,
        shadows,
        cameraMode,
      });
    }
  };

  // Handler for shadows changes
  const handleShadowsChange = (enabled: boolean) => {
    setShadows(enabled);
    if (onConfigChange) {
      onConfigChange({
        ...controls,
        ambientIntensity: lightingConfig.ambientIntensity,
        directionalIntensity: lightingConfig.directionalIntensity,
        lightColor: lightingConfig.lightColor,
        backgroundColor,
        materialMode,
        shadows: enabled,
        cameraMode,
      });
    }
  };

  // Handler for camera mode changes
  const handleCameraModeChange = (mode: "perspective" | "orthographic") => {
    setCameraMode(mode);
    if (onConfigChange) {
      onConfigChange({
        ...controls,
        ambientIntensity: lightingConfig.ambientIntensity,
        directionalIntensity: lightingConfig.directionalIntensity,
        lightColor: lightingConfig.lightColor,
        backgroundColor,
        materialMode,
        shadows,
        cameraMode: mode,
      });
    }
  };

  // Check if modelUrl is valid
  if (!modelUrl) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            borderRadius: "8px",
          }}
        >
          No model URL provided
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0} // Make it focusable
      style={{
        width: "100%",
        height: "600px", // Fixed height instead of viewport height
        position: "relative",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        outline: "none", // Remove focus outline
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        resize={{ debounce: 100 }}
      >
        <Scene
          controls={controls}
          setControls={handleSetControls}
          url={modelUrl}
          lightingConfig={lightingConfig}
          backgroundColor={backgroundColor}
          shadows={shadows}
          materialMode={materialMode}
          cameraMode={cameraMode}
        />
      </Canvas>
      <Toolbar
        controls={controls}
        setControls={handleSetControls}
        lightingConfig={lightingConfig}
        backgroundColor={backgroundColor}
        materialMode={materialMode}
        shadows={shadows}
        cameraMode={cameraMode}
        onLightingChange={handleLightingChange}
        onBackgroundChange={handleBackgroundChange}
        onMaterialModeChange={handleMaterialModeChange}
        onShadowsChange={handleShadowsChange}
        onCameraModeChange={handleCameraModeChange}
      />

      {/* Model URL Display for debugging */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "10px",
          zIndex: 1001,
          maxWidth: "300px",
          wordBreak: "break-all",
        }}
      >
        Model URL: {modelUrl}
        <br />
        Scale: {controls.scale.toFixed(2)}
      </div>

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
        <br />
        🖱️ Scroll Wheel (on 3D area): Scale Model
      </div>
    </div>
  );
};

export default ModelViewer;
