/**
 * Users List Component
 * Following Single Responsibility Principle - displays list of users with pagination and filters
 */

"use client";

import { UserCard } from "./UserCard";
import { UserFilters } from "./UserFilters";
import { Pagination } from "@/components/ui/pagination";
import type { User } from "@/types";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserQueryParams {
  page?: number;
  pageSize?: number;
  role?: string;
  section?: string;
  search?: string;
}

interface UsersListProps {
  readonly users: User[];
  readonly currentUser: User;
  readonly onUserSelect: (user: User) => void;
  readonly isLoading: boolean;
  readonly pagination: PaginationInfo | null;
  readonly queryParams: UserQueryParams;
  readonly onPageChange: (page: number) => void;
  readonly onSearch: (search: string) => void;
  readonly onRoleFilter: (role: string | undefined) => void;
}

export function UsersList({
  users,
  currentUser,
  onUserSelect,
  isLoading,
  pagination,
  queryParams,
  onPageChange,
  onSearch,
  onRoleFilter,
}: UsersListProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Comunidad Académica
        </h2>
        <p className="text-gray-600">
          {currentUser.role === "student" && currentUser.section
            ? `Sección ${currentUser.section}`
            : "Todos los usuarios"}
        </p>
      </div>

      {/* Filters */}
      <UserFilters
        currentUser={currentUser}
        onSearch={onSearch}
        onRoleFilter={onRoleFilter}
        currentSearch={queryParams.search}
        currentRole={queryParams.role}
        totalUsers={pagination?.total || users.length}
      />

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
          <p className="text-gray-400 text-sm mt-2">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => onUserSelect(user)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />

          {/* Pagination Info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Mostrando{" "}
            {Math.min(
              (pagination.page - 1) * pagination.pageSize + 1,
              pagination.total,
            )}{" "}
            -{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
            de {pagination.total} usuarios
          </div>
        </div>
      )}
    </div>
  );
}
