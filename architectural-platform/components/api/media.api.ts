import axiosInstance from "./axios.config";
import { MediaFile, UploadResponse } from "@/types";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils } from "./apiUtils";

export const mediaApi = {
  async getAll(params?: { page?: number; limit?: number; type?: string }): Promise<ListApiResponse<MediaFile>> {
    try {
      const response = await axiosInstance.get("/media", { params });
      return {
        isSuccess: true,
        data: response.data,
        pagination: {
          totalPages: 1,
          currentPage: 1,
        },
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : "Failed to fetch media",
        data: [],
        pagination: {
          totalPages: 0,
          currentPage: 1,
        },
      };
    }
  },

  async upload(file: File): Promise<ApiResponse<UploadResponse>> {
    return apiUtils<UploadResponse>(() => {
      const formData = new FormData();
      formData.append("file", file);
      return axiosInstance.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then(res => res.data);
    });
  },

  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiUtils<{ success: boolean }>(() => 
      axiosInstance.delete(`/media/${id}`).then(res => res.data)
    );
  },
};