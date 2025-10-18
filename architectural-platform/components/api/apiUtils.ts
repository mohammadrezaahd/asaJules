import { ApiResponse, ListApiResponse, PaginationInfo } from "@/types";

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
    totalPages: number;
    currentPage: number;
    total?: number;
    [key: string]: T[] | number | undefined;
  }>
): Promise<ListApiResponse<T>> {
  try {
    const response = await apiCall();
    
    // Extract the array data (could be articles, projects, categories, etc.)
    const dataKey = Object.keys(response).find(key => 
      Array.isArray(response[key]) && key !== 'totalPages' && key !== 'currentPage'
    );
    
    const data = (dataKey ? response[dataKey] : []) as T[];
    const pagination: PaginationInfo = {
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      total: response.total,
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
      },
    };
  }
}