import axiosInstance from "./axios.config";
import { Project } from "@/types";
import { CreateProjectDto, UpdateProjectDto } from "@/types/dto/project.dto";

export const projectsApi = {
  async getAll(params?: { page?: number; category?: string; search?: string }): Promise<{ projects: Project[], totalPages: number }> {
    const { data } = await axiosInstance.get("/projects", { params });
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await axiosInstance.get(`/projects/${id}`);
    return data;
  },

  async create(projectData: CreateProjectDto): Promise<Project> {
    const { data } = await axiosInstance.post("/projects", projectData);
    return data;
  },

  async update(id: string, projectData: UpdateProjectDto): Promise<Project> {
    const { data } = await axiosInstance.put(`/projects/${id}`, projectData);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/projects/${id}`);
    return data;
  },

  async bookmark(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.post(`/projects/${id}/bookmark`);
    return data;
  },
};