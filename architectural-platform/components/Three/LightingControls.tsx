'use client';

import React from 'react';
import { AmbientLight, DirectionalLight } from 'three';

interface LightingControlsProps {
  ambientIntensity: number;
  directionalIntensity: number;
  lightColor: string;
}

export default function LightingControls({ ambientIntensity, directionalIntensity, lightColor }: LightingControlsProps) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <directionalLight
        intensity={directionalIntensity}
        color={lightColor}
        position={[5, 5, 5]}
        castShadow
      />
    </>
  );
}