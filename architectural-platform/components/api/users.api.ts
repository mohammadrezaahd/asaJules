import axiosInstance from "./axios.config";
import { User } from "@/types";
import { CreateUserDto, UpdateUserDto } from "@/types/dto/user.dto";

export const usersApi = {
  async getAll(): Promise<User[]> {
    const { data } = await axiosInstance.get("/users");
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data;
  },

  async create(userData: CreateUserDto): Promise<User> {
    const { data } = await axiosInstance.post("/users", userData);
    return data;
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const { data } = await axiosInstance.put(`/users/${id}`, userData);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/users/${id}`);
    return data;
  },

  async getBookmarks(): Promise<{ projects: string[]; articles: string[] }> {
    const { data } = await axiosInstance.get("/users/bookmarks");
    return data;
  },
};