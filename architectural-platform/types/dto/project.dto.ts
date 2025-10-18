import { ModelConfig } from '../interfaces/project.interfaces';

export interface CreateProjectDto {
  title: string;
  categories: string[]; // Changed to array
  description: string;
  thumbnail: string;
  gallery: string[];
  modelUrl: string;
  modelConfig: ModelConfig;
  contributors: string[]; // Array of user IDs
  tags: string[]; // Added tags
  status: 'Draft' | 'Published'; // Added status
}

export type UpdateProjectDto = Partial<CreateProjectDto>;