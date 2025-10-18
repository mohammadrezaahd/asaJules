import { a, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import { useDrag } from "react-use-gesture";
import * as THREE from "three";

interface InspectorProps {
  responsiveness?: number;
  children: React.ReactNode;
  onRotationChange?: (rotation: [number, number, number]) => void;
  rotation?: [number, number, number];
}

export default function Inspector({ responsiveness = 20, children, onRotationChange, rotation }: InspectorProps) {
  const { size } = useThree();
  const euler = useMemo(() => new THREE.Euler(), []);

  const [spring, set] = useSpring(() => ({
    rotationX: rotation ? rotation[0] : 0,
    rotationY: rotation ? rotation[1] : 0,
    rotationZ: rotation ? rotation[2] : 0,
  }));
  
  // Initialize euler from rotation prop and sync spring
  useEffect(() => {
    if (rotation) {
      euler.set(rotation[0], rotation[1], rotation[2]);
      set({ 
        rotationX: rotation[0],
        rotationY: rotation[1],
        rotationZ: rotation[2]
      });
    }
  }, [rotation, euler, set]);
  const bind = useDrag(({ delta: [dx, dy] }) => {
    euler.y += (dx / size.width) * responsiveness;
    euler.x += (dy / size.width) * responsiveness;
    euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2, Math.PI / 2);
    console.log("Euler values:", { x: euler.x, y: euler.y, z: euler.z });
    
    const newRotation: [number, number, number] = [euler.x, euler.y, euler.z];
    
    set({ 
      rotationX: euler.x,
      rotationY: euler.y,
      rotationZ: euler.z
    });

    // Notify parent of rotation change
    if (onRotationChange) {
      onRotationChange(newRotation);
    }
  });

  useEffect(() => {
    console.log("Spring rotation changed:", {
      x: spring.rotationX.get(),
      y: spring.rotationY.get(),
      z: spring.rotationZ.get()
    });
  }, [spring.rotationX, spring.rotationY, spring.rotationZ]);

  return (
    <a.group 
      {...bind()} 
      rotation-x={spring.rotationX}
      rotation-y={spring.rotationY}
      rotation-z={spring.rotationZ}
    >
      {children}
    </a.group>
  );
}
