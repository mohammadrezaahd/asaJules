import axiosInstance from "./axios.config";
import { AuthResponse } from "@/types";
import { CreateUserDto } from "@/types/dto/user.dto";

export const authApi = {
  async login(credentials: { email?: string; password?: string; username?: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data;
  },

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    const { data } = await axiosInstance.post("/auth/register", userData);
    return data;
  },

  async linkPassword(password: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.post("/auth/link-password", { password });
    return data;
  },
};