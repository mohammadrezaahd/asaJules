import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Inspector from "./Inspector";

interface ModelProps {
  url: string;
  scale: number;
  rotation: [number, number, number];
  position: [number, number, number];
  materialMode: "solid" | "wireframe";
  shadows: boolean;
  enableInspector?: boolean;
  onRotationChange?: (rotation: [number, number, number]) => void;
}

export default function Model({
  url,
  scale,
  rotation,
  position,
  materialMode,
  shadows,
  enableInspector = false,
  onRotationChange,
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

  return enableInspector ? (
    <Inspector rotation={rotation} onRotationChange={onRotationChange}>
      <primitive
        ref={modelRef}
        object={scene}
        scale={scale}
        position={position}
        // Rotation is now handled by the Inspector's animated group
      />
    </Inspector>
  ) : (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      rotation={rotation}
      position={position}
    />
  );
}
