import { ModelConfig } from '../interfaces/project.interfaces';

import { Status } from '../status';

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
  status: Status; // Added status
}

export type UpdateProjectDto = Partial<CreateProjectDto>;