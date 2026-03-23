/**
 * Standard API Response Types
 * These types ensure consistent response structure across all API endpoints
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: string[];
  status: number;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * User related types for API responses
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  age?: number;
  description?: string;
  career?: string;
  hobbies?: string;
  role: string;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  expires: string;
}

/**
 * Request validation types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  age?: number;
  description?: string;
  career?: string;
  hobbies?: string;
  section?: string;
}
