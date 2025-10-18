interface TestModelProps extends React.ComponentProps<"group"> {
  testMode?: boolean;
}

export default function TestModel(props: TestModelProps) {
  return (
    <group {...props}>
      {/* Simple cube for testing */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      
      {/* Add some other shapes for reference */}
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
      
      <mesh position={[-3, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
    </group>
  );
}