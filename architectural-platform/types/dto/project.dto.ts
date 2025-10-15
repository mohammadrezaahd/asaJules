import { ModelConfig } from '../interfaces/project.interfaces';

export interface CreateProjectDto {
  title: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  gallery: string[];
  modelUrl: string;
  modelConfig: ModelConfig;
  contributors: string[]; // Array of user IDs
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}