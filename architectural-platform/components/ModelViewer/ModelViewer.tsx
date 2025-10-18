'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface ModelViewerProps {
  modelUrl: string;
  isAdmin: boolean;
}

export default function ModelViewer({ modelUrl, isAdmin }: ModelViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  const handleToggleWireframe = () => {
    setWireframe(!wireframe);
  };

  const handleToggleBgColor = () => {
    setBgColor(bgColor === '#ffffff' ? '#000000' : '#ffffff');
  };

  return (
    <Box sx={{ height: '500px', position: 'relative' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Suspense fallback={<CircularProgress />}>
          <Model url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls />
        <color attach="background" args={[bgColor]} />
      </Canvas>
      <Paper sx={{ position: 'absolute', top: 16, right: 16, p: 2 }}>
        <Typography variant="h6">Toolbar</Typography>
        <Button onClick={handleToggleWireframe}>
          {wireframe ? 'Solid' : 'Wireframe'}
        </Button>
        <Button onClick={handleToggleBgColor}>
          Toggle Background
        </Button>
        {isAdmin && <Button>Save Config</Button>}
      </Paper>
    </Box>
  );
}