/**
 * Authentication hook following Single Responsibility Principle
 * Manages authentication state and operations
 */

import { useState, useEffect, useCallback } from "react";
import type { User, AuthSession, LoginCredentials } from "@/types";
import { authService } from "@/services/auth.service";
import { AuthError } from "@/types";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh current session
   */
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session: AuthSession | null = await authService.getCurrentSession();
      setUser(session?.user || null);
    } catch (err) {
      console.error("Error refreshing session:", err);
      setUser(null);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Failed to refresh session");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        await authService.login(credentials);

        // Refresh session after successful login
        await refreshSession();
      } catch (err) {
        console.error("Login error:", err);
        if (err instanceof AuthError) {
          setError(err.message);
        } else {
          setError("Login failed. Please try again.");
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession],
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with client-side logout even if server fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
    clearError,
  };
}
