import { NextRequest } from "next/server";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { withAuth, withUserResourceAuth } from "@/lib/middleware";
import { AuthenticatedUser } from "@/lib/auth";
import {
  validateRequestBody,
  validateQueryParams,
  updateUserSchema,
  updateDescriptionSchema,
  idParamSchema,
} from "@/lib/validators";
import { UserService } from "@/lib/services/user.service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Helper function to extract user ID from route parameters
 */
const extractUserIdFromParams = async (
  routeParams: unknown,
): Promise<string> => {
  const { params } = routeParams as RouteParams;
  // Convert to string to ensure consistency with Auth.js user ID format
  const resolvedParams = await params;
  return resolvedParams.id.toString();
};

/**
 * GET /api/users/[id]
 * Get a user by ID
 * Public access - no authentication required
 */
export const GET = withErrorHandling(
  async (request: NextRequest, ...args: unknown[]) => {
    const { params } = args[0] as RouteParams;
    const resolvedParams = await params;

    // Validate ID parameter
    const idValidation = validateQueryParams(idParamSchema, {
      id: resolvedParams.id,
    });
    if (!idValidation.success) {
      return ApiResponseBuilder.validationError(idValidation.errors || []);
    }

    const { id } = idValidation.data!;

    try {
      // Use the validated number ID for service call
      const userData = await UserService.getUserById(id);

      if (!userData) {
        return ApiResponseBuilder.notFound("User not found");
      }

      return ApiResponseBuilder.success(
        { user: userData },
        "User retrieved successfully",
        200,
      );
    } catch (error) {
      console.error("Get user error:", error);
      return ApiResponseBuilder.internalError("Failed to retrieve user");
    }
  },
);

/**
 * PUT /api/users/[id]
 * Update a user by ID
 * Requires authentication and proper access permissions
 */
export const PUT = withUserResourceAuth(
  withErrorHandling(
    async (
      request: NextRequest,
      user: AuthenticatedUser,
      ...args: unknown[]
    ) => {
      const { params } = args[0] as RouteParams;
      const resolvedParams = await params;

      // Validate ID parameter
      const idValidation = validateQueryParams(idParamSchema, {
        id: resolvedParams.id,
      });
      if (!idValidation.success) {
        return ApiResponseBuilder.validationError(idValidation.errors || []);
      }

      const { id } = idValidation.data!;

      // Parse and validate request body
      const body = await request.json();
      const validation = validateRequestBody(updateUserSchema, body);
      if (!validation.success) {
        return ApiResponseBuilder.validationError(validation.errors || []);
      }

      const updateData = validation.data!;

      try {
        const updatedUser = await UserService.updateUser(id, updateData);

        if (!updatedUser) {
          return ApiResponseBuilder.notFound("User not found");
        }

        return ApiResponseBuilder.success(
          { user: updatedUser },
          "User updated successfully",
          200,
        );
      } catch (error) {
        console.error("Update user error:", error);

        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            return ApiResponseBuilder.error([error.message], 409, "Conflict");
          }
        }

        return ApiResponseBuilder.internalError("Failed to update user");
      }
    },
  ),
  extractUserIdFromParams,
);

/**
 * PATCH /api/users/[id]
 * Update user description only
 * Requires authentication and proper access permissions
 */
export const PATCH = withUserResourceAuth(
  withErrorHandling(
    async (
      request: NextRequest,
      user: AuthenticatedUser,
      ...args: unknown[]
    ) => {
      const { params } = args[0] as RouteParams;
      const resolvedParams = await params;

      // Validate ID parameter
      const idValidation = validateQueryParams(idParamSchema, {
        id: resolvedParams.id,
      });
      if (!idValidation.success) {
        return ApiResponseBuilder.validationError(idValidation.errors || []);
      }

      const { id } = idValidation.data!;

      // Parse and validate request body
      const body = await request.json();
      const validation = validateRequestBody(updateDescriptionSchema, body);
      if (!validation.success) {
        return ApiResponseBuilder.validationError(validation.errors || []);
      }

      const { description } = validation.data!;

      try {
        const updatedUser = await UserService.updateUserDescription(
          id,
          description,
        );

        if (!updatedUser) {
          return ApiResponseBuilder.notFound("User not found");
        }

        return ApiResponseBuilder.success(
          { user: updatedUser },
          "User description updated successfully",
          200,
        );
      } catch (error) {
        console.error("Update user description error:", error);
        return ApiResponseBuilder.internalError(
          "Failed to update user description",
        );
      }
    },
  ),
  extractUserIdFromParams,
);

/**
 * DELETE /api/users/[id]
 * Delete a user by ID
 * Requires admin authentication
 */
export const DELETE = withAuth(
  withErrorHandling(
    async (
      request: NextRequest,
      user: AuthenticatedUser,
      ...args: unknown[]
    ) => {
      const { params } = args[0] as RouteParams;
      const resolvedParams = await params;

      // Only admins can delete users
      if (user.role !== "admin") {
        return ApiResponseBuilder.forbidden(
          "Admin access required to delete users",
        );
      }

      // Validate ID parameter
      const idValidation = validateQueryParams(idParamSchema, {
        id: resolvedParams.id,
      });
      if (!idValidation.success) {
        return ApiResponseBuilder.validationError(idValidation.errors || []);
      }

      const { id } = idValidation.data!;

      // Prevent admin from deleting themselves
      if (id.toString() === user.id.toString()) {
        return ApiResponseBuilder.error(
          ["Cannot delete your own account"],
          400,
          "Bad Request",
        );
      }

      try {
        const deleted = await UserService.deleteUser(id);

        if (!deleted) {
          return ApiResponseBuilder.notFound("User not found");
        }

        return ApiResponseBuilder.success(
          { message: "User deleted successfully" },
          "User deleted successfully",
          200,
        );
      } catch (error) {
        console.error("Delete user error:", error);
        return ApiResponseBuilder.internalError("Failed to delete user");
      }
    },
  ),
);
