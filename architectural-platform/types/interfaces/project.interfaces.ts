import { UserSummary } from './user.interfaces';

export interface Project {
  _id: string;
  title: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  gallery: string[];
  modelUrl: string;
  modelConfig: ModelConfig;
  contributors: UserSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  lighting: {
    ambient: number;
    directional: number;
    color: string;
  };
}