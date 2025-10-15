'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import ModelToolbar from './ModelToolbar';
import LightingControls from './LightingControls';
import { Box } from '@mui/material';
import * as THREE from 'three';

function Model({ url, scale, rotation, position, materialMode, shadows }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = shadows;
        child.receiveShadow = shadows;
        if (materialMode === 'wireframe') {
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

export default function ModelViewer({ modelUrl, initialConfig, onSave, isAdmin = false }) {
  const controlsRef = useRef();
  const cameraRef = useRef();

  // Toolbar state
  const [ambientIntensity, setAmbientIntensity] = useState(initialConfig?.ambientIntensity || 0.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(initialConfig?.directionalIntensity || 1);
  const [lightColor, setLightColor] = useState(initialConfig?.lightColor || '#ffffff');
  const [scale, setScale] = useState(initialConfig?.scale || 1);
  const [rotation, setRotation] = useState(initialConfig?.rotation || [0, 0, 0]);
  const [position, setPosition] = useState(initialConfig?.position || [0, 0, 0]);
  const [backgroundColor, setBackgroundColor] = useState(initialConfig?.backgroundColor || '#f0f0f0');
  const [materialMode, setMaterialMode] = useState(initialConfig?.materialMode || 'solid');
  const [shadows, setShadows] = useState(initialConfig?.shadows ?? true);
  const [cameraMode, setCameraMode] = useState(initialConfig?.cameraMode || 'perspective');

  const resetLighting = () => {
    setAmbientIntensity(0.5);
    setDirectionalIntensity(1);
    setLightColor('#ffffff');
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
    setCameraMode(cameraMode === 'perspective' ? 'orthographic' : 'perspective');
  };

  const handleSave = () => {
    onSave({
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
    });
  };

  return (
    <Box>
      {isAdmin && (
        <ModelToolbar
          ambientIntensity={ambientIntensity}
          setAmbientIntensity={setAmbientIntensity}
          directionalIntensity={directionalIntensity}
          setDirectionalIntensity={setDirectionalIntensity}
          lightColor={lightColor}
          setLightColor={setLightColor}
          resetLighting={resetLighting}
          scale={scale}
          setScale={setScale}
          rotation={rotation}
          setRotation={setRotation}
          position={position}
          setPosition={setPosition}
          resetTransform={resetTransform}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          materialMode={materialMode}
          setMaterialMode={setMaterialMode}
          shadows={shadows}
          toggleShadows={() => setShadows(!shadows)}
          resetCamera={resetCamera}
          focusOnModel={focusOnModel}
          cameraMode={cameraMode}
          toggleCameraMode={toggleCameraMode}
          onSave={handleSave}
        />
      )}
      <Canvas
        shadows={shadows}
        dpr={[1, 2]}
        style={{ width: '100%', height: '500px', backgroundColor }}
      >
        {cameraMode === 'perspective' ? (
          <PerspectiveCamera ref={cameraRef} makeDefault fov={50} position={[5, 5, 5]} />
        ) : (
          <OrthographicCamera ref={cameraRef} makeDefault position={[5, 5, 5]} zoom={50} />
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
            rotation={rotation}
            position={position}
            materialMode={materialMode}
            shadows={shadows}
          />
        </Suspense>
        <OrbitControls ref={controlsRef} />
      </Canvas>
    </Box>
  );
}