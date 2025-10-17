import axiosInstance from "./axios.config";
import { Category } from "@/types";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const categoriesApi = {
  async getAll(params?: { page?: number; limit?: number; flat?: boolean; search?: string }): Promise<ListApiResponse<Category>> {
    return apiListUtils<Category>(() => 
      axiosInstance.get("/categories", { params: { ...params, flat: true } }).then(res => res.data)
    );
  },

  async getTree(): Promise<ApiResponse<Category[]>> {
    return apiUtils<Category[]>(() => 
      axiosInstance.get("/categories", { params: { flat: false } }).then(res => res.data.categories)
    );
  },

  async create(categoryData: { name: string; description?: string; parent?: string }): Promise<ApiResponse<Category>> {
    return apiUtils<Category>(() => 
      axiosInstance.post("/categories", categoryData).then(res => res.data)
    );
  },

  async update(id: string, categoryData: { name?: string; description?: string; parent?: string }): Promise<ApiResponse<Category>> {
    return apiUtils<Category>(() => 
      axiosInstance.put(`/categories/${id}`, categoryData).then(res => res.data)
    );
  },

  async delete(id: string, force = false): Promise<ApiResponse<{ success: boolean; hasChildren?: boolean; childrenCount?: number; childrenNames?: string[]; categoryName?: string; deletedCount?: number; deletedNames?: string[] }>> {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`, { params: { force } });
      return {
        isSuccess: true,
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { status: number; data: { hasChildren?: boolean; childrenCount?: number; childrenNames?: string[]; categoryName?: string; message?: string } } };
      // Handle 409 status specially - it's not really an error, just info about children
      if (err.response?.status === 409 && err.response?.data) {
        return {
          isSuccess: false,
          data: {
            success: false,
            hasChildren: err.response.data.hasChildren,
            childrenCount: err.response.data.childrenCount,
            childrenNames: err.response.data.childrenNames,
            categoryName: err.response.data.categoryName
          },
          error: err.response.data.message
        };
      }
      
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        isSuccess: false,
        error: apiError.response?.data?.message || apiError.message || 'Unknown error occurred'
      };
    }
  },
};