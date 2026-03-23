/**
 * Dashboard Component
 * Following Single Responsibility Principle and Open/Closed Principle
 * Orchestrates dashboard functionality using composition
 */

"use client";

import { DashboardHeader } from "./DashboardHeader";
import { UsersList } from "./UsersList";
import { UserDetail } from "./UserDetail";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types";

interface DashboardProps {
  readonly user: User;
  readonly onLogout: () => Promise<void>;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const {
    users,
    selectedUser,
    isLoading,
    error,
    pagination,
    queryParams,
    selectUser,
    setPage,
    setSearch,
    setRole,
  } = useUsers({ currentUser: user });

  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error al cargar los datos
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedUser ? (
          <UserDetail user={selectedUser} onBack={() => selectUser(null)} />
        ) : (
          <UsersList
            users={users}
            currentUser={user}
            onUserSelect={selectUser}
            isLoading={isLoading}
            pagination={pagination}
            queryParams={queryParams}
            onPageChange={setPage}
            onSearch={setSearch}
            onRoleFilter={setRole}
          />
        )}
      </div>
    </div>
  );
}
