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

  // Single controls state - exactly like Example
  const [controls, setControls] = useState({
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number], // In radians
  });

  // Toolbar state
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(1);
  const [lightColor, setLightColor] = useState("#ffffff");
  const [scale, setScale] = useState(1);
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
      setAmbientIntensity(initialConfig?.ambientIntensity ?? 0.5);
      setDirectionalIntensity(initialConfig?.directionalIntensity ?? 1);
      setLightColor(initialConfig?.lightColor ?? "#ffffff");
      setScale(initialConfig?.scale ?? 1);
      
      // Initialize controls - convert degrees to radians for rotation
      const initRotation = initialConfig?.rotation ?? [0, 0, 0];
      const initPosition = initialConfig?.position ?? [0, 0, 0];
      
      setControls({
        position: initPosition,
        rotation: initRotation.map(deg => THREE.MathUtils.degToRad(deg)) as [number, number, number],
      });
      
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
        // Convert rotation back to degrees for save
        const rotationInDegrees = controls.rotation.map(rad => THREE.MathUtils.radToDeg(rad)) as [number, number, number];
        
        onSaveRef.current({
          ambientIntensity,
          directionalIntensity,
          lightColor,
          scale,
          rotation: rotationInDegrees,
          position: controls.position,
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
    controls.rotation,
    controls.position,
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
    setControls({
      position: [0, 0, 0],
      rotation: [0, 0, 0], // radians
    });
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
          rotation={controls.rotation.map(rad => THREE.MathUtils.radToDeg(rad)) as [number, number, number]}
          setRotation={(newRotationDegrees) => {
            const rotationInRadians = newRotationDegrees.map(deg => THREE.MathUtils.degToRad(deg)) as [number, number, number];
            setControls(prev => ({
              ...prev,
              rotation: rotationInRadians,
            }));
          }}
          position={controls.position}
          setPosition={(newPosition) => {
            setControls(prev => ({
              ...prev,
              position: newPosition,
            }));
          }}
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
            rotation={controls.rotation}
            position={controls.position}
            materialMode={materialMode}
            shadows={shadows}
            enableInspector={showToolbar ?? isAdmin}
            controls={controls}
            setControls={setControls}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}

