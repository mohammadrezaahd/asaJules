import { a, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import { useDrag } from "react-use-gesture";
import * as THREE from "three";

interface InspectorProps {
  responsiveness?: number;
  children: React.ReactNode;
  onRotationChange?: (rotation: [number, number, number]) => void;
  rotation: [number, number, number]; // Rotation should be required
}

export default function Inspector({
  responsiveness = 20,
  children,
  onRotationChange,
  rotation,
}: InspectorProps) {
  const { size } = useThree();

  // Spring for smooth animation, driven by the rotation prop
  const [spring, set] = useSpring(() => ({
    rotation: rotation,
    config: { friction: 25, tension: 150 },
  }));

  // Update spring when the rotation prop changes from outside
  useEffect(() => {
    set({ rotation });
  }, [rotation, set]);

  const bind = useDrag(({ delta: [dx, dy], down }) => {
    if (!onRotationChange) return;

    // Current rotation from the prop (in radians)
    const [currentX, currentY, currentZ] = rotation;

    // Calculate new rotation based on drag delta
    // We maintain the Z-axis rotation from the prop
    let newX = currentX + (dy / size.height) * Math.PI * 2; // Full rotation across screen height
    let newY = currentY + (dx / size.width) * Math.PI * 2; // Full rotation across screen width

    // Clamp X rotation to avoid flipping
    newX = THREE.MathUtils.clamp(newX, -Math.PI / 2, Math.PI / 2);

    const newRotation: [number, number, number] = [newX, newY, currentZ];

    // Update the parent state
    onRotationChange(newRotation);

    // Also update the spring for immediate feedback while dragging
    set({ rotation: newRotation });
  });

  return (
    <a.group {...bind()} rotation={spring.rotation as any}>
      {children}
    </a.group>
  );
}
