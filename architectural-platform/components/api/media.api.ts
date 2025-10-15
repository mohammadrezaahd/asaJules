import axiosInstance from "./axios.config";
import { MediaFile, UploadResponse } from "@/types";

export const mediaApi = {
  async getAll(): Promise<MediaFile[]> {
    const { data } = await axiosInstance.get("/media");
    return data;
  },

  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post("/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/media/${id}`);
    return data;
  },
};