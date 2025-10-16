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

  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.delete(`/users/${id}`).then(res => res.data)
    );
  },

  async getBookmarks(): Promise<ApiResponse<{ projects: string[]; articles: string[] }>> {
    return apiUtils<{ projects: string[]; articles: string[] }>(() => 
      axiosInstance.get("/users/bookmarks").then(res => res.data)
    );
  },
};