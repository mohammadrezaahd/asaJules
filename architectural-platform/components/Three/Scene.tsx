import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import React from "react";
import Inspector from "./Inspector";
import Thing from "./Thing";
import { Controls } from "@/types/interfaces/model.interface";

export interface ControlsProps {
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
  url: string;
  lightingConfig?: {
    ambientIntensity?: number;
    directionalIntensity?: number;
    lightColor?: string;
  };
  backgroundColor?: string;
  shadows?: boolean;
  materialMode?: "solid" | "wireframe";
  cameraMode?: "perspective" | "orthographic";
}

const Scene: React.FC<ControlsProps> = ({
  controls,
  setControls,
  url,
  lightingConfig = {},
  backgroundColor = "#f0f0f0",
  shadows = true,
  materialMode = "solid",
  cameraMode = "perspective",
}) => {
  return (
    <>
      <color attach="background" args={[backgroundColor]} />

      {/* Camera setup */}
      {cameraMode === "perspective" ? (
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
      ) : (
        <OrthographicCamera makeDefault position={[5, 5, 5]} zoom={50} />
      )}

      {/* Lighting setup */}
      <ambientLight intensity={lightingConfig.ambientIntensity ?? 0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={lightingConfig.directionalIntensity ?? 1}
        color={lightingConfig.lightColor ?? "#ffffff"}
        castShadow={shadows}
        shadow-mapSize={1024}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Grid helper for reference */}
      <gridHelper args={[20, 20]} />

      <Inspector controls={controls} setControls={setControls}>
        {/* Show test models first - these should always appear */}
        {/* <TestModel position={[0, 5, 0]} /> */}

        {/* Then try to load the actual model */}
        {url ? <Thing url={url} materialMode={materialMode} /> : null}
      </Inspector>
    </>
  );
};

export default Scene;
