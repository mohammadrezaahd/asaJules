import axiosInstance from "./axios.config";
import { MediaFile, UploadResponse, MediaQueryParams, MediaFilterType, DeleteMediaResponse, BulkDeleteMediaResponse } from "@/types";
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

  async uploadMultiple(
    files: File[], 
    allowedType?: 'models' | 'images' | 'all',
    onProgress?: (progress: { file: string; percent: number; status: 'uploading' | 'completed' | 'failed' }) => void
  ): Promise<ApiResponse<{
    message: string;
    uploadedFiles: MediaFile[];
    failedFiles: Array<{ filename: string; error: string }>;
    summary: { total: number; uploaded: number; failed: number };
  }>> {
    try {
      // Validate all files first
      const validationErrors: string[] = [];
      
      if (allowedType && allowedType !== 'all') {
        const filterType = MEDIA_FILTER_TYPES.find(ft => ft.value === allowedType);
        if (filterType && filterType.extensions.length > 0) {
          files.forEach(file => {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!filterType.extensions.includes(fileExtension)) {
              validationErrors.push(`${file.name}: Invalid file type. Supported: ${filterType.extensions.join(', ')}`);
            }
          });
        }
      }

      if (validationErrors.length > 0) {
        return {
          isSuccess: false,
          error: validationErrors.join('\n')
        };
      }

      // Create FormData with all files
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });

      // Track progress for each file
      files.forEach(file => {
        if (onProgress) {
          onProgress({ file: file.name, percent: 0, status: 'uploading' });
        }
      });

      const response = await axiosInstance.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // For overall progress, we'll update all files equally
            files.forEach(file => {
              onProgress({ file: file.name, percent, status: 'uploading' });
            });
          }
        }
      });

      // Update progress for completed files
      if (onProgress && response.data.uploadedFiles) {
        response.data.uploadedFiles.forEach((uploadedFile: MediaFile) => {
          onProgress({ file: uploadedFile.filename, percent: 100, status: 'completed' });
        });
      }

      // Update progress for failed files
      if (onProgress && response.data.failedFiles) {
        response.data.failedFiles.forEach((failedFile: { filename: string; error: string }) => {
          onProgress({ file: failedFile.filename, percent: 100, status: 'failed' });
        });
      }

      return {
        isSuccess: true,
        data: response.data
      };

    } catch (error) {
      // Mark all files as failed
      if (onProgress) {
        files.forEach(file => {
          onProgress({ file: file.name, percent: 100, status: 'failed' });
        });
      }

      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : "Upload failed"
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<MediaFile>> {
    return apiUtils<MediaFile>(() => 
      axiosInstance.get(`/media/${id}`).then(res => res.data)
    );
  },

  async delete(id: string): Promise<ApiResponse<DeleteMediaResponse>> {
    return apiUtils<DeleteMediaResponse>(() => 
      axiosInstance.delete(`/media/${id}`).then(res => res.data)
    );
  },

  async deleteMultiple(ids: string[]): Promise<ApiResponse<BulkDeleteMediaResponse>> {
    return apiUtils<BulkDeleteMediaResponse>(() => 
      axiosInstance.delete('/media', { data: { ids } }).then(res => res.data)
    );
  },

  async updateMetadata(id: string, data: { filename?: string }): Promise<ApiResponse<MediaFile>> {
    return apiUtils<MediaFile>(() => 
      axiosInstance.patch(`/media/${id}`, data).then(res => res.data)
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