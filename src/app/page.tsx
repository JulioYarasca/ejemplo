/**
 * HomePage Component
 * Following Dependency Inversion Principle - depends on abstractions not concrete implementations
 * Orchestrates authentication flow using custom hooks
 */

"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } =
    useAuth();

  // Show loading state during initial authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated && user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  // Show login form if not authenticated
  return (
    <LoginForm
      onLogin={login}
      isLoading={isLoading}
      error={error}
      onClearError={clearError}
    />
  );
}
