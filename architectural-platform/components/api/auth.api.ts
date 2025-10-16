import axiosInstance from "./axios.config";
import { AuthResponse } from "@/types";
import { CreateUserDto } from "@/types/dto/user.dto";
import { ApiResponse } from "@/types";
import { apiUtils } from "./apiUtils";

export const authApi = {
  async login(credentials: { email?: string; password?: string; username?: string }): Promise<ApiResponse<AuthResponse>> {
    return apiUtils<AuthResponse>(() => 
      axiosInstance.post("/auth/login", credentials).then(res => res.data)
    );
  },

  async register(userData: CreateUserDto): Promise<ApiResponse<AuthResponse>> {
    return apiUtils<AuthResponse>(() => 
      axiosInstance.post("/auth/register", userData).then(res => res.data)
    );
  },

  async linkPassword(password: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.post("/auth/link-password", { password }).then(res => res.data)
    );
  },
};