import axiosInstance from "./axios.config";
import { User } from "@/types";
import { CreateUserDto, UpdateUserDto } from "@/types/dto/user.dto";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const usersApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<ListApiResponse<User>> {
    return apiListUtils<User>(() => 
      axiosInstance.get("/users", { params }).then(res => res.data)
    );
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    return apiUtils<User>(() => 
      axiosInstance.get(`/users/${id}`).then(res => res.data)
    );
  },

  async create(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return apiUtils<User>(() => 
      axiosInstance.post("/users", userData).then(res => res.data)
    );
  },

  async update(id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    return apiUtils<User>(() => 
      axiosInstance.put(`/users/${id}`, userData).then(res => res.data)
    );
  },

  async delete(id: string): Promise<ApiResponse<{ 
    message: string;
    deletedUser: { id: string; username: string; email: string };
  }>> {
    return apiUtils(() => 
      axiosInstance.delete(`/users/${id}`).then(res => res.data)
    );
  },

  async deleteMultiple(ids: string[]): Promise<ApiResponse<{
    message: string;
    deletedItems: Array<{ id: string; username: string; email: string }>;
    failedDeletions: Array<{ id: string; username: string; error: string }>;
    summary: { total: number; deleted: number; failed: number };
  }>> {
    return apiUtils(() => 
      axiosInstance.delete('/users', { data: { ids } }).then(res => res.data)
    );
  },

  async getBookmarks(userId: string): Promise<ApiResponse<Project[]>> {
    return apiUtils<Project[]>(() =>
      axiosInstance.get(`/users/${userId}/bookmarks`).then(res => res.data)
    );
  },

  async addBookmark(userId: string, projectId: string): Promise<ApiResponse<string[]>> {
    return apiUtils<string[]>(() =>
      axiosInstance.post(`/users/${userId}/bookmarks`, { projectId }).then(res => res.data)
    );
  },

  async removeBookmark(userId: string, projectId: string): Promise<ApiResponse<string[]>> {
    return apiUtils<string[]>(() =>
      axiosInstance.delete(`/users/${userId}/bookmarks`, { data: { projectId } }).then(res => res.data)
    );
  },
};