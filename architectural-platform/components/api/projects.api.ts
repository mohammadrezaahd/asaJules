import axiosInstance from "./axios.config";
import { Project } from "@/types";
import { CreateProjectDto, UpdateProjectDto } from "@/types/dto/project.dto";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const projectsApi = {
  async getAll(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<ListApiResponse<Project>> {
    return apiListUtils<Project>(() => 
      axiosInstance.get("/projects", { params }).then(res => res.data)
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

  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.delete(`/projects/${id}`).then(res => res.data)
    );
  },

  async bookmark(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.post(`/projects/${id}/bookmark`).then(res => res.data)
    );
  },
};