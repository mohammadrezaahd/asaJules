import axiosInstance from "./axios.config";
import { Article } from "@/types/interfaces/articles.interfaces";
import { CreateArticleDto, UpdateArticleDto } from "@/types/dto/articles.dto";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils, apiListUtils } from "./apiUtils";

export const articlesApi = {
  async getAll(params?: { page?: number; limit?: number; category?: string }): Promise<ListApiResponse<Article>> {
    return apiListUtils<Article>(() => 
      axiosInstance.get("/articles", { params }).then(res => res.data)
    );
  },

  async getById(id: string): Promise<ApiResponse<Article>> {
    return apiUtils<Article>(() => 
      axiosInstance.get(`/articles/${id}`).then(res => res.data)
    );
  },

  async create(articleData: CreateArticleDto): Promise<ApiResponse<Article>> {
    return apiUtils<Article>(() => 
      axiosInstance.post("/articles", articleData).then(res => res.data)
    );
  },

  async update(id: string, articleData: UpdateArticleDto): Promise<ApiResponse<Article>> {
    return apiUtils<Article>(() => 
      axiosInstance.put(`/articles/${id}`, articleData).then(res => res.data)
    );
  },

  async delete(id: string): Promise<ApiResponse<{ 
    message: string;
  }>> {
    return apiUtils(() => 
      axiosInstance.delete(`/articles/${id}`).then(res => res.data)
    );
  },

  async deleteMultiple(ids: string[]): Promise<ApiResponse<{
    message: string;
    deletedItems: Array<{ id: string; title: string; slug: string }>;
    failedDeletions: Array<{ id: string; title: string; error: string }>;
    summary: { total: number; deleted: number; failed: number };
  }>> {
    return apiUtils(() => 
      axiosInstance.delete('/articles', { data: { ids } }).then(res => res.data)
    );
  },

  async bookmark(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.post(`/articles/${id}/bookmark`).then(res => res.data)
    );
  },
};