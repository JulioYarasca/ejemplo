import { getCurrentUser } from "@/lib/auth";
import type { AuthenticatedUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBuilder } from "@/lib/utils/api-response";

/**
 * Enhanced middleware utilities using simple API key authentication
 * These functions provide clean error handling and consistent responses
 */

/**
 * Middleware wrapper for authenticated routes
 */
export function withAuth<T extends unknown[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser(request);

      if (!user) {
        return ApiResponseBuilder.unauthorized("Authentication required");
      }

      return await handler(request, user, ...args);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return ApiResponseBuilder.internalError("Authentication failed");
    }
  };
}

/**
 * Middleware wrapper for admin-only routes
 */
export function withAdminAuth<T extends unknown[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return withAuth(
    async (request: NextRequest, user: AuthenticatedUser, ...args: T) => {
      if (user.role !== "admin") {
        return ApiResponseBuilder.forbidden("Admin access required");
      }

      return await handler(request, user, ...args);
    },
  );
}

/**
 * Middleware wrapper for teacher or admin routes
 */
export function withTeacherAuth<T extends unknown[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return withAuth(
    async (request: NextRequest, user: AuthenticatedUser, ...args: T) => {
      if (user.role !== "teacher" && user.role !== "admin") {
        return ApiResponseBuilder.forbidden("Teacher or admin access required");
      }

      return await handler(request, user, ...args);
    },
  );
}

/**
 * Check if user has permission to access another user's resource
 */
export function canAccessUserResource(
  currentUser: AuthenticatedUser,
  targetUserId: string,
): boolean {
  console.log("🔍 Access check:", {
    currentUserId: currentUser.id,
    currentUserIdType: typeof currentUser.id,
    targetUserId: targetUserId,
    targetUserIdType: typeof targetUserId,
    currentUserRole: currentUser.role,
  });

  // Admin can access everything
  if (currentUser.role === "admin") {
    console.log("✅ Admin access granted");
    return true;
  }

  // Teachers can access students in their section
  if (currentUser.role === "teacher" || currentUser.role === "professor") {
    console.log("✅ Teacher/Professor access granted");
    return true; // You might want to add section-based logic here
  }

  // Users can only access their own resources
  const hasAccess = currentUser.id.toString() === targetUserId.toString();
  console.log("🔐 Self-access check:", {
    hasAccess,
    currentUserIdAsString: currentUser.id.toString(),
    targetUserIdAsString: targetUserId.toString(),
  });

  return hasAccess;
}

/**
 * Middleware for user-specific resource access
 */
export function withUserResourceAuth<T extends unknown[]>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    ...args: T
  ) => Promise<NextResponse>,
  getUserIdFromParams: (params: unknown) => string | Promise<string>,
) {
  return withAuth(
    async (request: NextRequest, user: AuthenticatedUser, ...args: T) => {
      const targetUserId = await getUserIdFromParams(args[0]); // Assuming params is the first argument

      if (!canAccessUserResource(user, targetUserId)) {
        return ApiResponseBuilder.forbidden("Access denied to this resource");
      }

      return await handler(request, user, ...args);
    },
  );
}
