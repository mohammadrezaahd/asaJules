'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box as DreiBox } from '@react-three/drei';

export default function Decoration3D() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <DreiBox>
        <meshStandardMaterial color="hotpink" />
      </DreiBox>
      <OrbitControls />
    </Canvas>
  );
}