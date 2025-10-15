import axiosInstance from "./axios.config";
import { Article } from "@/types/interfaces/articles.interfaces";
import { CreateArticleDto, UpdateArticleDto } from "@/types/dto/articles.dto";

export const articlesApi = {
  async getAll(): Promise<Article[]> {
    const { data } = await axiosInstance.get("/articles");
    return data;
  },

  async getById(id: string): Promise<Article> {
    const { data } = await axiosInstance.get(`/articles/${id}`);
    return data;
  },

  async create(articleData: CreateArticleDto): Promise<Article> {
    const { data } = await axiosInstance.post("/articles", articleData);
    return data;
  },

  async update(id: string, articleData: UpdateArticleDto): Promise<Article> {
    const { data } = await axiosInstance.put(`/articles/${id}`, articleData);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/articles/${id}`);
    return data;
  },

  async bookmark(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.post(`/articles/${id}/bookmark`);
    return data;
  },
};