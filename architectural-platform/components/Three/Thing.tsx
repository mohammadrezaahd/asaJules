import { useGLTF } from "@react-three/drei";
import React, { useEffect } from "react";
import { Mesh } from "three";

interface ThingProps extends React.ComponentProps<"group"> {
  url: string;
  materialMode?: 'solid' | 'wireframe';
}

const Thing: React.FC<ThingProps> = (props) => {
  console.log("Thing component - Loading model from URL:", props.url);
  
  const hasValidUrl = props.url && props.url.trim();
  
  // Always call hooks in the same order
  const gltf = useGLTF(hasValidUrl ? props.url : "/placeholder.glb"); // fallback URL
  const scene = gltf.scene;
  
  useEffect(() => {
    console.log("URL validation:", hasValidUrl ? "Valid" : "Invalid");
    if (hasValidUrl && scene) {
      console.log("Model loaded successfully:", scene);
      console.log("Model has children:", scene.children.length);
      
      // Apply material mode to all meshes in the scene
      scene.traverse((child) => {
        console.log("Model child:", child.type, child.name);
        if (child instanceof Mesh && child.material) {
          child.material.wireframe = props.materialMode === 'wireframe';
        }
      });
    }
  }, [scene, hasValidUrl, props.materialMode]);

  // Check if URL is valid
  if (!hasValidUrl) {
    console.log("No valid URL provided");
    return (
      <group {...props}>
        <mesh>
          <boxGeometry args={[2, 0.1, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    );
  }

  if (!scene) {
    console.log("Model not loaded yet...");
    // Show a loading indicator
    return (
      <group {...props}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
};

export default Thing;