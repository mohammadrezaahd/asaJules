export interface Controls {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface ControlsProps {
  controls: Controls;
  setControls: React.Dispatch<React.SetStateAction<Controls>>;
}

export interface InspectorProps extends ControlsProps {
  responsiveness?: number;
  children: React.ReactNode;
}
