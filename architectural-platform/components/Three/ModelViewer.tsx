"use client";

import React, { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
} from "@react-three/drei";
import ModelToolbar from "./ModelToolbar";
import LightingControls from "./LightingControls";
import { Box } from "@mui/material";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Model from "./Model";

interface ModelViewerConfig {
  ambientIntensity?: number;
  directionalIntensity?: number;
  lightColor?: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  backgroundColor?: string;
  materialMode?: "solid" | "wireframe";
  shadows?: boolean;
  cameraMode?: "perspective" | "orthographic";
}

interface ModelViewerProps {
  modelUrl: string;
  initialConfig?: ModelViewerConfig;
  onSave?: (config: ModelViewerConfig) => void;
  isAdmin?: boolean;
  showToolbar?: boolean;
}

export default function ModelViewer({
  modelUrl,
  initialConfig,
  onSave,
  isAdmin = false,
  showToolbar,
}: ModelViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orthographicCameraRef = useRef<THREE.OrthographicCamera>(null);
  const onSaveRef = useRef(onSave);
  const isInitializedRef = useRef(false);

  // Keep onSave ref up to date
  React.useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Toolbar state
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(1);
  const [lightColor, setLightColor] = useState("#ffffff");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");
  const [materialMode, setMaterialMode] = useState<"solid" | "wireframe">(
    "solid"
  );
  const [shadows, setShadows] = useState(true);
  const [cameraMode, setCameraMode] = useState<"perspective" | "orthographic">(
    "perspective"
  );

  // Initialize state from initialConfig only once when component mounts
  React.useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("ModelViewer initializing with config:", initialConfig);
      setAmbientIntensity(initialConfig?.ambientIntensity ?? 0.5);
      setDirectionalIntensity(initialConfig?.directionalIntensity ?? 1);
      setLightColor(initialConfig?.lightColor ?? "#ffffff");
      setScale(initialConfig?.scale ?? 1);
      setRotation(initialConfig?.rotation ?? [0, 0, 0]);
      setPosition(initialConfig?.position ?? [0, 0, 0]);
      setBackgroundColor(initialConfig?.backgroundColor ?? "#f0f0f0");
      setMaterialMode(initialConfig?.materialMode ?? "solid");
      setShadows(initialConfig?.shadows ?? true);
      setCameraMode(initialConfig?.cameraMode ?? "perspective");
      isInitializedRef.current = true;
    }
  }, [initialConfig]);

  // Auto-sync changes to parent component whenever any value changes
  // Use debouncing to prevent excessive calls
  React.useEffect(() => {
    // Don't trigger onSave during initial setup
    if (!isInitializedRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (onSaveRef.current) {
        onSaveRef.current({
          ambientIntensity,
          directionalIntensity,
          lightColor,
          scale,
          rotation: rotation as [number, number, number],
          position: position as [number, number, number],
          backgroundColor,
          materialMode,
          shadows,
          cameraMode,
        });
      }
    }, 150); // 150ms debounce - faster response

    return () => clearTimeout(timeoutId);
  }, [
    ambientIntensity,
    directionalIntensity,
    lightColor,
    scale,
    rotation,
    position,
    backgroundColor,
    materialMode,
    shadows,
    cameraMode,
  ]);

  const resetLighting = () => {
    setAmbientIntensity(0.5);
    setDirectionalIntensity(1);
    setLightColor("#ffffff");
  };

  const resetTransform = () => {
    setScale(1);
    setRotation([0, 0, 0]);
    setPosition([0, 0, 0]);
  };

  const resetCamera = () => {
    controlsRef.current?.reset();
  };

  const focusOnModel = () => {
    // This requires a bit more logic to calculate the bounding box and adjust the camera
    // For now, we'll just reset the camera
    controlsRef.current?.reset();
  };

  const toggleCameraMode = () => {
    setCameraMode(
      cameraMode === "perspective" ? "orthographic" : "perspective"
    );
  };

  const toggleShadows = () => {
    setShadows(!shadows);
  };

  // Handle rotation changes from Inspector
  const handleInspectorRotationChange = (newRotation: [number, number, number]) => {
    // Convert from radians to degrees for the toolbar
    const rotationInDegrees: [number, number, number] = [
      (newRotation[0] * 180) / Math.PI,
      (newRotation[1] * 180) / Math.PI,
      (newRotation[2] * 180) / Math.PI,
    ];
    setRotation(rotationInDegrees);
  };

  // Convert rotation from degrees to radians for the model
  const rotationInRadians: [number, number, number] = [
    (rotation[0] * Math.PI) / 180,
    (rotation[1] * Math.PI) / 180,
    (rotation[2] * Math.PI) / 180,
  ];

  return (
    <Box>
      {(showToolbar ?? isAdmin) && (
        <ModelToolbar
          mode={isAdmin ? "full" : "minimal"}
          ambientIntensity={ambientIntensity}
          setAmbientIntensity={setAmbientIntensity}
          directionalIntensity={directionalIntensity}
          setDirectionalIntensity={setDirectionalIntensity}
          lightColor={lightColor}
          setLightColor={setLightColor}
          resetLighting={resetLighting}
          scale={scale}
          setScale={setScale}
          rotation={rotation as [number, number, number]}
          setRotation={setRotation}
          position={position as [number, number, number]}
          setPosition={setPosition}
          resetTransform={resetTransform}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          materialMode={materialMode}
          setMaterialMode={setMaterialMode}
          shadows={shadows}
          toggleShadows={toggleShadows}
          resetCamera={resetCamera}
          focusOnModel={focusOnModel}
          cameraMode={cameraMode}
          toggleCameraMode={toggleCameraMode}
        />
      )}
      <Canvas
        shadows={shadows}
        dpr={[1, 2]}
        style={{ width: "100%", height: "500px", backgroundColor }}
      >
        {cameraMode === "perspective" ? (
          <PerspectiveCamera
            ref={perspectiveCameraRef}
            makeDefault
            fov={50}
            position={[5, 5, 5]}
          />
        ) : (
          <OrthographicCamera
            ref={orthographicCameraRef}
            makeDefault
            position={[5, 5, 5]}
            zoom={50}
          />
        )}
        <LightingControls
          ambientIntensity={ambientIntensity}
          directionalIntensity={directionalIntensity}
          lightColor={lightColor}
        />
        <Suspense fallback={null}>
          <Model
            url={modelUrl}
            scale={scale}
            rotation={rotationInRadians}
            position={position as [number, number, number]}
            materialMode={materialMode}
            shadows={shadows}
            enableInspector={showToolbar ?? isAdmin}
            onRotationChange={handleInspectorRotationChange}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}

