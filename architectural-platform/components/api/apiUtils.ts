import { ApiResponse, ListApiResponse, PaginationInfo } from "@/types";
import { AxiosError } from "axios";

/**
 * Generic API utility function to standardize API responses
 * @param apiCall - The async function that makes the API call
 * @returns Promise with standardized ApiResponse format
 */
export async function apiUtils<T>(
  apiCall: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await apiCall();
    return {
      isSuccess: true,
      data,
    };
  } catch (error) {
    console.error("API Error:", error);
    
    // Handle AxiosError specifically
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data;
      // Return the error data as is so components can access field, message, etc.
      return {
        isSuccess: false,
        error: errorData.message || errorData.error || "Request failed",
        // Store additional error info for component access
        errorData: errorData,
      } as ApiResponse<T> & { errorData?: Record<string, unknown> };
    }
    
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Generic API utility function for list endpoints with pagination
 * @param apiCall - The async function that makes the API call
 * @returns Promise with standardized ListApiResponse format
 */
export async function apiListUtils<T>(
  apiCall: () => Promise<{
    isSuccess?: boolean;
    data?: T[];
    pagination?: {
      totalPages: number;
      currentPage: number;
      totalItems?: number;
      itemsPerPage?: number;
      total?: number;
    };
    // Legacy format support
    totalPages?: number;
    currentPage?: number;
    total?: number;
    [key: string]: T[] | number | boolean | object | undefined;
  }>
): Promise<ListApiResponse<T>> {
  try {
    const response = await apiCall();
    
    // Handle new format with isSuccess, data, and pagination
    if (response.isSuccess !== undefined) {
      return {
        isSuccess: response.isSuccess,
        data: response.data || [],
        pagination: {
          totalPages: response.pagination?.totalPages || 1,
          currentPage: response.pagination?.currentPage || 1,
          total: response.pagination?.total || response.pagination?.totalItems || 0,
          totalItems: response.pagination?.totalItems || response.pagination?.total || 0,
          itemsPerPage: response.pagination?.itemsPerPage || 10,
        },
      };
    }
    
    // Handle legacy format - extract array data and pagination
    const dataKey = Object.keys(response).find(key => 
      Array.isArray(response[key]) && key !== 'totalPages' && key !== 'currentPage'
    );
    
    const data = (dataKey ? response[dataKey] : []) as T[];
    const pagination: PaginationInfo = {
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || 1,
      total: response.total || 0,
      totalItems: response.total || 0,
    };

    return {
      isSuccess: true,
      data,
      pagination,
    };
  } catch (error) {
    console.error("API List Error:", error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: [],
      pagination: {
        totalPages: 0,
        currentPage: 1,
        total: 0,
        totalItems: 0,
      },
    };
  }
}