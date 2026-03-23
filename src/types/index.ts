/**
 * Core types and interfaces for the application
 * Following Single Responsibility Principle - each interface has one clear purpose
 */

// User-related types
export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly name: string;
  readonly age?: number;
  readonly description?: string;
  readonly career?: string;
  readonly hobbies?: string;
  readonly role: UserRole;
  readonly section?: string;
  readonly code?: string; // Code from identifiers table
  readonly emailVerified?: string;
  readonly image?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export type UserRole = "student" | "teacher" | "professor" | "admin";

// Auth-related types
export interface AuthSession {
  readonly user: User;
  readonly expires: string;
}

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface RegisterData {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly role: UserRole;
  readonly age?: number;
  readonly career?: string;
  readonly section?: string;
}

export interface LoginResponse {
  readonly apiKey: string;
  readonly user: User;
  readonly message: string;
  readonly redirectTo: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message: string;
  readonly errors?: string[];
  readonly status: number;
  readonly timestamp: string;
}

export interface UsersResponse {
  readonly users: User[];
  readonly pagination?: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

// Component props types
export interface AuthStateProps {
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly isLoading: boolean;
}

export interface DashboardProps {
  readonly user: User;
  readonly onLogout: () => void;
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
