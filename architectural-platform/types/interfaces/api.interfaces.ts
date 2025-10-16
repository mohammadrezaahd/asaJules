// Generic API Response Interfaces

export interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  total?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface ListApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}