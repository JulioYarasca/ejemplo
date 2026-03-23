import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/auth";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { validateRequestBody, loginSchema } from "@/lib/validators";

/**
 * POST /api/auth/login
 * Authenticate user with username and password using simple API key authentication
 * Returns API key to be used in headers for subsequent requests
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json();

  // Validate request data
  const validation = validateRequestBody(loginSchema, body);
  if (!validation.success) {
    return ApiResponseBuilder.validationError(validation.errors || []);
  }

  const { username, password } = validation.data!;

  try {
    // Attempt to authenticate user
    const result = await authenticateUser(username, password);

    if (!result) {
      return ApiResponseBuilder.error(
        ["Invalid username or password"],
        401,
        "Authentication failed",
      );
    }

    const { user, apiKey } = result;

    return ApiResponseBuilder.success(
      {
        message: "Login successful",
        apiKey,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          section: user.section,
          code: user.code,
        },
        instructions: {
          headerName: "x-api-key",
          headerValue: apiKey,
          example: `curl -H "x-api-key: ${apiKey}" http://localhost:3000/api/users`,
        },
        redirectTo: "/dashboard",
      },
      "Authentication successful",
      200,
    );
  } catch (error) {
    console.error("Login error:", error);
    return ApiResponseBuilder.internalError("Authentication failed");
  }
});
