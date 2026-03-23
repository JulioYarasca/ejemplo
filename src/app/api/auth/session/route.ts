import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";

/**
 * GET /api/auth/session
 * Get current user session information using API key from headers
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return ApiResponseBuilder.unauthorized(
        "No active session - API key required in x-api-key header",
      );
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
      },
      "Session retrieved successfully",
      200,
    );
  } catch (error) {
    console.error("Session retrieval error:", error);
    return ApiResponseBuilder.internalError("Failed to retrieve session");
  }
});
