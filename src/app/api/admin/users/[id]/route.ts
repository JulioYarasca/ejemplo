import { NextRequest } from "next/server";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { withAdminAuth } from "@/lib/middleware";
import { AuthenticatedUser } from "@/lib/auth";
import {
  validateRequestBody,
  validateQueryParams,
  adminUpdateUserSchema,
  idParamSchema,
} from "@/lib/validators";
import { UserService } from "@/lib/services/user.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/admin/users/[id]
 * Update any user (admin only)
 * Allows role changes and other admin-specific operations
 */
export const PUT = withAdminAuth(
  withErrorHandling(
    async (
      request: NextRequest,
      user: AuthenticatedUser,
      context: RouteContext,
    ) => {
      const { params } = context;
      const { id } = await params;

      // Validate ID parameter
      const idValidation = validateQueryParams(idParamSchema, { id });
      if (!idValidation.success) {
        return ApiResponseBuilder.validationError(idValidation.errors || []);
      }

      const validatedId = idValidation.data!.id;

      // Parse and validate request body
      const body = await request.json();
      const validation = validateRequestBody(adminUpdateUserSchema, body);
      if (!validation.success) {
        return ApiResponseBuilder.validationError(validation.errors || []);
      }

      const updateData = validation.data!;

      try {
        const updatedUser = await UserService.updateUser(
          validatedId,
          updateData,
        );

        if (!updatedUser) {
          return ApiResponseBuilder.notFound("User not found");
        }

        return ApiResponseBuilder.success(
          { user: updatedUser },
          "User updated successfully by admin",
          200,
        );
      } catch (error) {
        console.error("Admin update user error:", error);

        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            return ApiResponseBuilder.error([error.message], 409, "Conflict");
          }
        }

        return ApiResponseBuilder.internalError("Failed to update user");
      }
    },
  ),
);

/**
 * DELETE /api/admin/users/[id]
 * Delete any user (admin only)
 */
export const DELETE = withAdminAuth(
  withErrorHandling(
    async (
      request: NextRequest,
      user: AuthenticatedUser,
      context: RouteContext,
    ) => {
      const { params } = context;
      const { id } = await params;

      // Validate ID parameter
      const idValidation = validateQueryParams(idParamSchema, { id });
      if (!idValidation.success) {
        return ApiResponseBuilder.validationError(idValidation.errors || []);
      }

      const validatedId = idValidation.data!.id;

      // Prevent admin from deleting themselves
      if (validatedId.toString() === user.id) {
        return ApiResponseBuilder.error(
          ["Cannot delete your own account"],
          400,
          "Bad Request",
        );
      }

      try {
        const deleted = await UserService.deleteUser(validatedId);

        if (!deleted) {
          return ApiResponseBuilder.notFound("User not found");
        }

        return ApiResponseBuilder.success(
          { message: "User deleted successfully" },
          "User deleted successfully by admin",
          200,
        );
      } catch (error) {
        console.error("Admin delete user error:", error);
        return ApiResponseBuilder.internalError("Failed to delete user");
      }
    },
  ),
);
