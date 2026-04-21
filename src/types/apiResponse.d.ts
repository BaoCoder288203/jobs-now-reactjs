export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobListParams extends PaginationParams {
  search?: string;
  job_type?: string;
  experience_level?: string;
  location?: string;
  company_id?: string;
  category_id?: string;
  category_ids?: string[];
  industry_id?: string;
  min_salary?: number;
  max_salary?: number;
  skills?: string[];
  status?: string;
}

export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}