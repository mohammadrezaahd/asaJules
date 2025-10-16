import axiosInstance from "./axios.config";
import { Category } from "@/types";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const categoriesApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<ListApiResponse<Category>> {
    return apiListUtils<Category>(() => 
      axiosInstance.get("/categories", { params }).then(res => res.data)
    );
  },

  async create(categoryData: { name: string; description: string }): Promise<ApiResponse<Category>> {
    return apiUtils<Category>(() => 
      axiosInstance.post("/categories", categoryData).then(res => res.data)
    );
  },

  async update(id: string, categoryData: { name?: string; description?: string }): Promise<ApiResponse<Category>> {
    return apiUtils<Category>(() => 
      axiosInstance.put(`/categories/${id}`, categoryData).then(res => res.data)
    );
  },

  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.delete(`/categories/${id}`).then(res => res.data)
    );
  },
};