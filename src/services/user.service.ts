/**
 * User service following Single Responsibility Principle
 * Handles all user-related API operations
 */

import type { User, UsersResponse, ApiResponse } from "@/types";
import { ApiError } from "@/types";

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  role?: string;
  section?: string;
  search?: string;
}

export interface IUserService {
  getAllUsers(params?: UserQueryParams): Promise<UsersResponse>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class UserService implements IUserService {
  private readonly baseUrl = "/api/users";

  /**
   * Get all users with optional query parameters
   */
  async getAllUsers(params?: UserQueryParams): Promise<UsersResponse> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.pageSize) {
        queryParams.append("pageSize", params.pageSize.toString());
      }
      if (params?.role) {
        queryParams.append("role", params.role);
      }
      if (params?.section) {
        queryParams.append("section", params.section);
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new ApiError("Failed to fetch users", response.status);
      }

      const data: ApiResponse<UsersResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new ApiError(
          data.message || "Failed to fetch users",
          response.status,
          data.errors,
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Network error while fetching users", 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError("User not found", 404);
        }
        throw new ApiError("Failed to fetch user", response.status);
      }

      const data: ApiResponse<{ user: User }> = await response.json();

      if (!data.success || !data.data) {
        throw new ApiError(
          data.message || "Failed to fetch user",
          response.status,
          data.errors,
        );
      }

      return data.data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Network error while fetching user", 500);
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new ApiError(
          errorData.message || "Failed to update user",
          response.status,
          errorData.errors,
        );
      }

      const responseData: ApiResponse<{ user: User }> = await response.json();

      if (!responseData.success || !responseData.data) {
        throw new ApiError(
          responseData.message || "Failed to update user",
          response.status,
          responseData.errors,
        );
      }

      return responseData.data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Network error while updating user", 500);
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new ApiError(
          errorData.message || "Failed to delete user",
          response.status,
          errorData.errors,
        );
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new ApiError(
          data.message || "Failed to delete user",
          response.status,
          data.errors,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("Network error while deleting user", 500);
    }
  }
}

// Singleton instance
export const userService = new UserService();
