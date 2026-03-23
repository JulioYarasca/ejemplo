/**
 * Users hook following Single Responsibility Principle
 * Manages user list state and operations
 */

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { userService, type UserQueryParams } from "@/services/user.service";
import { ApiError } from "@/types";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UseUsersParams {
  currentUser?: User;
  initialPage?: number;
  initialPageSize?: number;
}

interface UseUsersReturn {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  queryParams: UserQueryParams;
  fetchUsers: (params?: UserQueryParams) => Promise<void>;
  selectUser: (user: User | null) => void;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setRole: (role: string | undefined) => void;
}

export function useUsers({
  currentUser,
  initialPage = 1,
  initialPageSize = 10,
}: UseUsersParams = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: initialPage,
    pageSize: initialPageSize,
    // Si es estudiante, automáticamente filtrar por su sección
    section: currentUser?.role === "student" ? currentUser.section : undefined,
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Select a user for detailed view
   */
  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
  }, []);

  /**
   * Update query parameters and trigger fetch
   */
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      setQueryParams((prev) => ({ ...prev, ...newParams }));
    },
    [],
  );

  /**
   * Set current page
   */
  const setPage = useCallback(
    (page: number) => {
      updateQueryParams({ page });
    },
    [updateQueryParams],
  );

  /**
   * Set page size
   */
  const setPageSize = useCallback(
    (pageSize: number) => {
      updateQueryParams({ page: 1, pageSize }); // Reset to first page when changing page size
    },
    [updateQueryParams],
  );

  /**
   * Set search term
   */
  const setSearch = useCallback(
    (search: string) => {
      updateQueryParams({ page: 1, search: search || undefined }); // Reset to first page when searching
    },
    [updateQueryParams],
  );

  /**
   * Set role filter
   */
  const setRole = useCallback(
    (role: string | undefined) => {
      updateQueryParams({ page: 1, role }); // Reset to first page when filtering
    },
    [updateQueryParams],
  );

  /**
   * Fetch users with current query parameters
   */
  const fetchUsers = useCallback(
    async (params?: UserQueryParams) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentParams = params || queryParams;
        const response = await userService.getAllUsers(currentParams);

        // Sort users: professors first, then students
        const sortedUsers = [...response.users].sort((a: User, b: User) => {
          if (
            (a.role === "professor" || a.role === "teacher") &&
            b.role !== "professor" &&
            b.role !== "teacher"
          ) {
            return -1;
          }
          if (
            a.role !== "professor" &&
            a.role !== "teacher" &&
            (b.role === "professor" || b.role === "teacher")
          ) {
            return 1;
          }
          return a.name.localeCompare(b.name);
        });

        setUsers(sortedUsers);
        setPagination(response.pagination || null);
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to fetch users");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [queryParams],
  );

  /**
   * Fetch users when query parameters change
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Update a user
   */
  const updateUser = useCallback(
    async (id: string, data: Partial<User>) => {
      try {
        setError(null);

        const updatedUser = await userService.updateUser(id, data);

        // Update users list
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user)),
        );

        // Update selected user if it's the same one
        if (selectedUser?.id === id) {
          setSelectedUser(updatedUser);
        }
      } catch (err) {
        console.error("Error updating user:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to update user");
        }
        throw err; // Re-throw for component handling
      }
    },
    [selectedUser],
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setError(null);

        await userService.deleteUser(id);

        // Remove from users list
        setUsers((prev) => prev.filter((user) => user.id !== id));

        // Clear selection if deleted user was selected
        if (selectedUser?.id === id) {
          setSelectedUser(null);
        }

        // Refresh to update pagination
        await fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete user");
        }
        throw err; // Re-throw for component handling
      }
    },
    [selectedUser, fetchUsers],
  );

  /**
   * Fetch users when query parameters change
   */
  useEffect(() => {
    fetchUsers();
  }, [queryParams, fetchUsers]);

  return {
    users,
    selectedUser,
    isLoading,
    error,
    pagination,
    queryParams,
    fetchUsers,
    selectUser,
    updateUser,
    deleteUser,
    clearError,
    setPage,
    setPageSize,
    setSearch,
    setRole,
  };
}
