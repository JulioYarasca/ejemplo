import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";

/**
 * POST /api/auth/logout
 * Logout endpoint - since we're using stateless API keys,
 * this is mainly for client-side cleanup and consistency
 */
export const POST = withErrorHandling(async () => {
  try {
    return ApiResponseBuilder.success(
      {
        message: "Logout successful",
        instructions:
          "API key is now invalid. Remove it from your client storage.",
        redirectTo: "/",
      },
      "Logout successful",
      200,
    );
  } catch (error) {
    console.error("Logout error:", error);
    return ApiResponseBuilder.internalError("Logout failed");
  }
});
