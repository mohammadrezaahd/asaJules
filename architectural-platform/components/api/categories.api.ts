import axiosInstance from "./axios.config";
import { Category } from "@/types";

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data } = await axiosInstance.get("/categories");
    return data;
  },

  async create(categoryData: { name: string; description: string }): Promise<Category> {
    const { data } = await axiosInstance.post("/categories", categoryData);
    return data;
  },

  async update(id: string, categoryData: { name?: string; description?: string }): Promise<Category> {
    const { data } = await axiosInstance.put(`/categories/${id}`, categoryData);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/categories/${id}`);
    return data;
  },
};