/**
 * User Filters Component
 * Provides search and filter functionality for the users list
 */

"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";

interface UserFiltersProps {
  readonly currentUser: User;
  readonly onSearch: (search: string) => void;
  readonly onRoleFilter: (role: string | undefined) => void;
  readonly currentSearch?: string;
  readonly currentRole?: string;
  readonly totalUsers: number;
}

export function UserFilters({
  currentUser,
  onSearch,
  onRoleFilter,
  currentSearch = "",
  currentRole,
  totalUsers,
}: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Available role filters based on user permissions
  const availableRoles = useMemo(() => {
    const roles = [
      { value: undefined, label: "Todos los roles" },
      { value: "student", label: "Estudiantes" },
      { value: "teacher", label: "Profesores" },
    ];

    // Only admins can filter by admin role
    if (currentUser.role === "admin") {
      roles.push({ value: "admin", label: "Administradores" });
    }

    return roles;
  }, [currentUser.role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim());
  };

  const handleSearchClear = () => {
    setSearchInput("");
    onSearch("");
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
        {(currentSearch || searchInput) && (
          <Button type="button" variant="ghost" onClick={handleSearchClear}>
            Limpiar
          </Button>
        )}
      </form>

      {/* Role Filters - Only show if user can see multiple roles */}
      {currentUser.role !== "student" && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            Filtrar por rol:
          </span>
          {availableRoles.map((role) => (
            <Button
              key={role.value || "all"}
              variant={currentRole === role.value ? "default" : "outline"}
              size="sm"
              onClick={() => onRoleFilter(role.value)}
            >
              {role.label}
            </Button>
          ))}
        </div>
      )}

      {/* Active Filters Summary */}
      {(currentSearch || currentRole) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {currentSearch && (
            <Badge variant="secondary">
              Búsqueda: &ldquo;{currentSearch}&rdquo;
            </Badge>
          )}
          {currentRole && (
            <Badge variant="secondary">
              Rol: {availableRoles.find((r) => r.value === currentRole)?.label}
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {totalUsers === 1
          ? "1 usuario encontrado"
          : `${totalUsers} usuarios encontrados`}
      </div>
    </div>
  );
}
