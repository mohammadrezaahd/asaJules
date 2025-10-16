import axiosInstance from "./axios.config";
import { MediaFile, UploadResponse, MediaQueryParams, MediaFilterType } from "@/types";
import { ApiResponse, ListApiResponse } from "@/types";
import { apiUtils } from "./apiUtils";

// Define media filter types
export const MEDIA_FILTER_TYPES: MediaFilterType[] = [
  {
    label: 'All Files',
    value: 'all',
    extensions: [],
    accept: '*/*'
  },
  {
    label: 'Images',
    value: 'images',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    accept: 'image/*'
  },
  {
    label: 'Models',
    value: 'models',
    extensions: ['.glb', '.gltf'],
    accept: '.glb,.gltf,model/gltf-binary'
  }
];

export const mediaApi = {
  async getAll(params?: MediaQueryParams): Promise<ListApiResponse<MediaFile>> {
    try {
      const response = await axiosInstance.get("/media", { params });
      return {
        isSuccess: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination || {
          totalPages: 1,
          currentPage: 1,
          totalItems: response.data.length || 0,
          itemsPerPage: response.data.length || 0,
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
          totalItems: 0,
          itemsPerPage: 0,
        },
      };
    }
  },

  async upload(file: File, allowedType?: 'models' | 'images' | 'all'): Promise<ApiResponse<UploadResponse>> {
    // Validate file type if specified
    if (allowedType && allowedType !== 'all') {
      const filterType = MEDIA_FILTER_TYPES.find(ft => ft.value === allowedType);
      if (filterType && filterType.extensions.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!filterType.extensions.includes(fileExtension)) {
          return {
            isSuccess: false,
            error: `Only ${filterType.label.toLowerCase()} are allowed. Supported formats: ${filterType.extensions.join(', ')}`
          };
        }
      }
    }

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

  // Helper function to get accept attribute for file input
  getAcceptAttribute(allowedType?: 'models' | 'images' | 'all'): string {
    if (!allowedType || allowedType === 'all') return '*/*';
    const filterType = MEDIA_FILTER_TYPES.find(ft => ft.value === allowedType);
    return filterType?.accept || '*/*';
  },

  // Helper function to validate file type
  isFileTypeAllowed(file: File, allowedType?: 'models' | 'images' | 'all'): boolean {
    if (!allowedType || allowedType === 'all') return true;
    const filterType = MEDIA_FILTER_TYPES.find(ft => ft.value === allowedType);
    if (!filterType || filterType.extensions.length === 0) return true;
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return filterType.extensions.includes(fileExtension);
  }
};