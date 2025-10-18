import Inspector from "./Inspector";
import Thing from "./Thing";
import { ControlsProps } from "./types";

export default function Scene({ controls, setControls }: ControlsProps) {
  return (
    <>
      <color attach="background" args={["black"]} />
      <Inspector controls={controls} setControls={setControls}>
        <Thing />
      </Inspector>
    </>
  );
}
