export default function Thing(props: React.ComponentProps<"mesh">) {
  return (
    <mesh {...props}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}
