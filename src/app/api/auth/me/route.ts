import { NextRequest } from "next/server";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Get current authenticated user information including API key details
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    return ApiResponseBuilder.success(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          section: user.section,
          code: user.code,
        },
        apiKeyInfo: {
          format: `${user.code}:${user.username} (base64 encoded)`,
          headerName: "x-api-key or Authorization: Bearer <token>",
          cookieName: "api-key",
        },
      },
      "User information retrieved successfully",
      200,
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return ApiResponseBuilder.internalError(
      "Failed to retrieve user information",
    );
  }
});
