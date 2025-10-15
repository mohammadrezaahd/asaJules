'use client';

import React from 'react';
import { Box, Button, Slider, Typography, Paper } from '@mui/material';

interface ModelToolbarProps {
  // Lighting Controls
  ambientIntensity: number;
  setAmbientIntensity: (value: number) => void;
  directionalIntensity: number;
  setDirectionalIntensity: (value: number) => void;
  lightColor: string;
  setLightColor: (color: string) => void;
  resetLighting: () => void;

  // Model Controls
  scale: number;
  setScale: (value: number) => void;
  rotation: [number, number, number];
  setRotation: (value: [number, number, number]) => void;
  position: [number, number, number];
  setPosition: (value: [number, number, number]) => void;
  resetTransform: () => void;

  // Material & Environment
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  materialMode: 'solid' | 'wireframe';
  setMaterialMode: (mode: 'solid' | 'wireframe') => void;
  shadows: boolean;
  toggleShadows: () => void;

  // Camera Controls
  resetCamera: () => void;
  focusOnModel: () => void;
  cameraMode: 'perspective' | 'orthographic';
  toggleCameraMode: () => void;

  // Save
  onSave: () => void;
}

export default function ModelToolbar({
  ambientIntensity, setAmbientIntensity,
  directionalIntensity, setDirectionalIntensity,
  lightColor, setLightColor,
  resetLighting,
  scale, setScale,
  rotation, setRotation,
  position, setPosition,
  resetTransform,
  backgroundColor, setBackgroundColor,
  materialMode, setMaterialMode,
  shadows, toggleShadows,
  resetCamera, focusOnModel,
  cameraMode, toggleCameraMode,
  onSave,
}: ModelToolbarProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">3D Model Controls</Typography>
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Ambient Light</Typography>
        <Slider value={ambientIntensity} onChange={(e, v) => setAmbientIntensity(v as number)} min={0} max={2} step={0.1} />
        <Typography gutterBottom>Directional Light</Typography>
        <Slider value={directionalIntensity} onChange={(e, v) => setDirectionalIntensity(v as number)} min={0} max={2} step={0.1} />
        <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} />
        <Button onClick={resetLighting}>Reset Lighting</Button>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Scale</Typography>
        <Slider value={scale} onChange={(e, v) => setScale(v as number)} min={0.1} max={5} step={0.1} />
        <Typography gutterBottom>Rotation</Typography>
        <Slider value={rotation[0]} onChange={(e, v) => setRotation([v as number, rotation[1], rotation[2]])} min={-180} max={180} step={1} />
        <Slider value={rotation[1]} onChange={(e, v) => setRotation([rotation[0], v as number, rotation[2]])} min={-180} max={180} step={1} />
        <Slider value={rotation[2]} onChange={(e, v) => setRotation([rotation[0], rotation[1], v as number])} min={-180} max={180} step={1} />
        <Typography gutterBottom>Position</Typography>
        <Slider value={position[0]} onChange={(e, v) => setPosition([v as number, position[1], position[2]])} min={-10} max={10} step={0.1} />
        <Slider value={position[1]} onChange={(e, v) => setPosition([position[0], v as number, position[2]])} min={-10} max={10} step={0.1} />
        <Slider value={position[2]} onChange={(e, v) => setPosition([position[0], position[1], v as number])} min={-10} max={10} step={0.1} />
        <Button onClick={resetTransform}>Reset Transform</Button>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Background Color</Typography>
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        <Button onClick={() => setMaterialMode(materialMode === 'solid' ? 'wireframe' : 'solid')}>
          Toggle Wireframe
        </Button>
        <Button onClick={toggleShadows}>Toggle Shadows</Button>
      </Box>
      <Box sx={{ my: 2 }}>
        <Button onClick={resetCamera}>Reset Camera</Button>
        <Button onClick={focusOnModel}>Focus on Model</Button>
        <Button onClick={toggleCameraMode}>Toggle Camera Mode</Button>
      </Box>
      <Button variant="contained" onClick={onSave}>Save Configuration</Button>
    </Paper>
  );
}