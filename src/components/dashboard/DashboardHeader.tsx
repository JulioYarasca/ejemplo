/**
 * Dashboard Header Component
 * Following Single Responsibility Principle - handles only header display and logout
 */

"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { User } from "@/types";

interface DashboardHeaderProps {
  readonly user: User;
  readonly onLogout: () => void;
  readonly isLoggingOut?: boolean;
}

export function DashboardHeader({
  user,
  onLogout,
  isLoggingOut = false,
}: DashboardHeaderProps) {
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "teacher":
      case "professor":
        return "Profesor";
      case "student":
        return "Estudiante";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {user.name} ({getRoleDisplayName(user.role)})
            </p>
          </div>
          <Button
            onClick={onLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </header>
  );
}
