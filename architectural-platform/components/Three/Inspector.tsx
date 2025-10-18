import { Controls } from "@/types/interfaces/model.interface";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import { useDrag } from "react-use-gesture";
import * as THREE from "three";

interface InspectorProps {
  responsiveness?: number;
  children: React.ReactNode;
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
}

const Inspector: React.FC<InspectorProps> = ({
  responsiveness = 20,
  children,
  controls,
  setControls,
}) => {
  const { size } = useThree();
  const euler = useMemo(() => new THREE.Euler(), []);
  const isDraggingRef = useRef(false);

  // Use direct values instead of spring animation to avoid conflicts
  useEffect(() => {
    if (!isDraggingRef.current) {
      euler.fromArray(controls.rotation);
    }
  }, [controls.rotation, euler]);

  const bind = useDrag(({ delta: [dx, dy], buttons, first, last }) => {
    if (first) {
      isDraggingRef.current = true;
    }

    if (last) {
      isDraggingRef.current = false;
      return;
    }

    if (buttons === 2) {
      // Right mouse button - Position control
      const positionSensitivity = 0.01;
      const newPosition: [number, number, number] = [...controls.position];
      newPosition[0] += dx * positionSensitivity;
      newPosition[1] -= dy * positionSensitivity;

      setControls((prev) => ({
        ...prev,
        position: newPosition,
      }));
    } else {
      // Left mouse button (default) - Rotation control
      euler.y += (dx / size.width) * responsiveness;
      euler.x += (dy / size.width) * responsiveness;
      euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2, Math.PI / 2);

      const newRotation: [number, number, number] = [euler.x, euler.y, euler.z];

      setControls((prev) => ({
        ...prev,
        rotation: newRotation,
      }));
    }
  });

  return (
    <group
      {...bind()}
      position={controls.position}
      rotation={controls.rotation}
      scale={[controls.scale, controls.scale, controls.scale]}
    >
      {children}
    </group>
  );
};

export default Inspector;
