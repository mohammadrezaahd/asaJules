import { UserSummary } from './user.interfaces';

export interface Project {
  _id: string;
  title: string;
  categories: string[];
  description: string;
  thumbnail: string;
  gallery: string[];
  modelUrl: string;
  modelConfig: ModelConfig;
  contributors: UserSummary[];
  tags: string[];
  status: 'Draft' | 'Published';
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
  materialMode?: 'solid' | 'wireframe';
  backgroundColor?: string;
  shadows?: boolean;
  cameraMode?: 'perspective' | 'orthographic';
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'Draft' | 'Published';
  tags?: string[];
}