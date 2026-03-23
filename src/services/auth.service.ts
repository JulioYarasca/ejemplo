/**
 * Authentication service using simple API key authentication
 * Abstracts authentication implementation details from components
 */

import type {
  AuthSession,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  User,
} from "@/types";
import { AuthError } from "@/types";

// Abstract interface for authentication operations
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<{ apiKey: string; user: User }>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  checkAuthStatus(): Promise<boolean>;
}

// Concrete implementation using simple API key authentication
export class AuthService implements IAuthService {
  private readonly baseUrl = "/api/auth";
  private apiKey: string | null = null;

  /**
   * Login user with username and password
   * Returns API key for subsequent requests
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<{ apiKey: string; user: User }> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<{
        apiKey: string;
        user: User;
        message: string;
        redirectTo: string;
        instructions: object;
      }> = await response.json();

      if (!response.ok || !data.success) {
        throw new AuthError(
          data.message || "Login failed",
          response.status,
          "LOGIN_FAILED",
        );
      }

      // Store API key for subsequent requests
      this.apiKey = data.data?.apiKey || "";

      return {
        apiKey: data.data?.apiKey || "",
        user: data.data?.user || ({} as User),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError("Network error during login", 500, "NETWORK_ERROR");
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData: ApiResponse = await response.json();

      if (!response.ok || !responseData.success) {
        throw new AuthError(
          responseData.message || "Registration failed",
          response.status,
          "REGISTRATION_FAILED",
        );
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        "Network error during registration",
        500,
        "NETWORK_ERROR",
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // Even if logout fails on server, clear client state
        console.warn(
          "Server logout failed, but continuing with client cleanup",
        );
      }

      // Clear stored API key
      this.apiKey = null;
    } catch (error) {
      // Even if network fails, we should clear client state
      console.warn(
        "Network error during logout, but continuing with client cleanup",
        error,
      );
      this.apiKey = null;
    }
  }

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add API key if available
      if (this.apiKey) {
        headers["x-api-key"] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/session`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new AuthError("Failed to get session", response.status);
      }

      const data: ApiResponse<AuthSession> = await response.json();
      return data.data || null;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get API key for making authenticated requests
   */
  getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Set API key (useful for restoring session)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}

// Singleton instance
export const authService = new AuthService();
