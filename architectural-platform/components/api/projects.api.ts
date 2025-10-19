import axiosInstance from "./axios.config";
import { Project, ProjectQueryParams } from "@/types";
import { CreateProjectDto, UpdateProjectDto } from "@/types/dto/project.dto";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const projectsApi = {
  async getAll(params?: ProjectQueryParams): Promise<ListApiResponse<Project>> {
    const cleanParams = {
      ...params,
      tags: params?.tags?.join(',') // Convert array to comma-separated string
    };
    
    return apiListUtils<Project>(() => 
      axiosInstance.get("/projects", { params: cleanParams }).then(res => res.data)
    );
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    return apiUtils<Project>(() => 
      axiosInstance.get(`/projects/${id}`).then(res => res.data)
    );
  },

  async create(projectData: CreateProjectDto): Promise<ApiResponse<Project>> {
    return apiUtils<Project>(() => 
      axiosInstance.post("/projects", projectData).then(res => res.data)
    );
  },

  async update(id: string, projectData: UpdateProjectDto): Promise<ApiResponse<Project>> {
    return apiUtils<Project>(() => 
      axiosInstance.put(`/projects/${id}`, projectData).then(res => res.data)
    );
  },

  async delete(id: string): Promise<ApiResponse<{ 
    message: string;
  }>> {
    return apiUtils(() => 
      axiosInstance.delete(`/projects/${id}`).then(res => res.data)
    );
  },

  async deleteMultiple(ids: string[]): Promise<ApiResponse<{
    message: string;
    deletedItems: Array<{ id: string; title: string; status: string }>;
    failedDeletions: Array<{ id: string; title: string; error: string }>;
    summary: { total: number; deleted: number; failed: number };
  }>> {
    return apiUtils(() => 
      axiosInstance.delete('/projects', { data: { ids } }).then(res => res.data)
    );
  },

  async bookmark(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.post(`/projects/${id}/bookmark`).then(res => res.data)
    );
  },
};