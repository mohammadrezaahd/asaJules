import { a, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import { useDrag } from "react-use-gesture";
import * as THREE from "three";
import { InspectorProps } from "./types";

export default function Inspector({
  responsiveness = 20,
  children,
  controls,
  setControls,
}: InspectorProps) {
  const { size } = useThree();
  const euler = useMemo(() => new THREE.Euler(), []);

  const [spring, set] = useSpring(() => ({
    position: controls.position,
    rotation: controls.rotation,
  }));

  // Update spring when controls change from toolbar
  useEffect(() => {
    set({
      position: controls.position,
      rotation: controls.rotation,
    });
    // Update euler to match controls
    euler.fromArray(controls.rotation);
  }, [controls, set, euler]);

  const bind = useDrag(({ delta: [dx, dy], buttons }) => {
    if (buttons === 2) {
      // Right mouse button - Position control
      const positionSensitivity = 0.01;
      const newPosition: [number, number, number] = [...controls.position];
      newPosition[0] += dx * positionSensitivity;
      newPosition[1] -= dy * positionSensitivity; // Invert Y for natural feel

      set({ position: newPosition });
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

      set({ rotation: newRotation });
      setControls((prev) => ({
        ...prev,
        rotation: newRotation,
      }));
    }
  });

  return (
    <a.group
      {...bind()}
      position={spring.position}
      rotation={spring.rotation as unknown as [number, number, number]}
    >
      {children}
    </a.group>
  );
}
