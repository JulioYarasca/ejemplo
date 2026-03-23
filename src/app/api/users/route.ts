import { NextRequest } from "next/server";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { validateQueryParams, userQuerySchema } from "@/lib/validators";
import { UserService } from "@/lib/services/user.service";

/**
 * GET /api/users
 * Get all users with pagination and filtering
 * Public access - no authentication required
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Parse query parameters
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  // Validate query parameters
  const validation = validateQueryParams(userQuerySchema, queryParams);
  if (!validation.success) {
    return ApiResponseBuilder.validationError(validation.errors || []);
  }

  const query = validation.data!;

  try {
    const result = await UserService.getUsers(query);

    return ApiResponseBuilder.success(
      {
        users: result.users,
        pagination: result.pagination,
      },
      "Users retrieved successfully",
      200,
    );
  } catch (error) {
    console.error("Get users error:", error);
    return ApiResponseBuilder.internalError("Failed to retrieve users");
  }
});
