"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  PerspectiveCamera,
  OrthographicCamera,
} from "@react-three/drei";
import ModelToolbar from "./ModelToolbar";
import LightingControls from "./LightingControls";
import { Box, Typography } from "@mui/material";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ModelProps {
  url: string;
  scale: number;
  rotation: [number, number, number];
  position: [number, number, number];
  materialMode: "solid" | "wireframe";
  shadows: boolean;
}

function Model({
  url,
  scale,
  rotation,
  position,
  materialMode,
  shadows,
}: ModelProps) {
  const gltf = useGLTF(url);
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = shadows;
        child.receiveShadow = shadows;
        if (materialMode === "wireframe") {
          if (child.material instanceof THREE.Material) {
            (child.material as THREE.MeshStandardMaterial).wireframe = true;
          }
        } else {
          if (child.material instanceof THREE.Material) {
            (child.material as THREE.MeshStandardMaterial).wireframe = false;
          }
        }
      }
    });
  }, [scene, materialMode, shadows]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      rotation={rotation}
      position={position}
    />
  );
}

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

  // State to track if user is manually interacting
  const [isManuallyInteracting, setIsManuallyInteracting] = useState(false);

  // Listen for OrbitControls changes
  React.useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      const handleStart = () => setIsManuallyInteracting(true);
      const handleEnd = () => {
        // Keep the flag true until user manually syncs
        // This allows user to see the notification and sync when ready
      };

      controls.addEventListener('start', handleStart);
      controls.addEventListener('end', handleEnd);

      return () => {
        controls.removeEventListener('start', handleStart);
        controls.removeEventListener('end', handleEnd);
      };
    }
  }, []);  

  // Sync manual transformations from current camera/target state to toolbar values
  const syncFromView = () => {
    const controls = controlsRef.current;
    if (controls) {
      // Get camera distance to determine scale
      const camera = controls.object;
      const target = controls.target;
      const distance = camera.position.distanceTo(target);
      
      // Convert camera distance to scale (inverse relationship)
      const newScale = Math.max(0.1, Math.min(5, 2 / Math.max(distance * 0.1, 0.1)));
      setScale(newScale);
      
      // Set position based on camera target  
      setPosition([target.x, target.y, target.z]);
      
      // Reset rotation as camera controls don't directly translate to model rotation
      setRotation([0, 0, 0]);
      
      // Clear the manual interaction flag after syncing
      setIsManuallyInteracting(false);
    }
  };

  return (
    <Box>
      {isManuallyInteracting && (
        <Box sx={{ p: 1, mb: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            Manual interaction detected. Use &quot;Sync from Manual Changes&quot; to update toolbar values.
          </Typography>
        </Box>
      )}
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
          syncFromView={syncFromView}
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
            rotation={rotation as [number, number, number]}
            position={position as [number, number, number]}
            materialMode={materialMode}
            shadows={shadows}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}
