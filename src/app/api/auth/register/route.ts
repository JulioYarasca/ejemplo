import { NextRequest } from "next/server";
import {
  ApiResponseBuilder,
  withErrorHandling,
} from "@/lib/utils/api-response";
import { validateRequestBody, registerSchema } from "@/lib/validators";
import { UserService } from "@/lib/services/user.service";

/**
 * POST /api/auth/register
 * Register a new user account
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json();

  // Validate request data
  const validation = validateRequestBody(registerSchema, body);
  if (!validation.success) {
    return ApiResponseBuilder.validationError(validation.errors || []);
  }

  const userData = validation.data!;

  try {
    // Create new user using service layer
    const newUser = await UserService.createUser(userData);

    // Return success response (excluding sensitive data)
    return ApiResponseBuilder.success(
      {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          age: newUser.age,
          description: newUser.description,
          career: newUser.career,
          hobbies: newUser.hobbies,
          role: newUser.role,
          section: newUser.section,
          createdAt: newUser.createdAt,
        },
        message: "User registered successfully",
      },
      "Registration successful",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle known business logic errors
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return ApiResponseBuilder.error([error.message], 409, "Conflict");
      }
    }

    return ApiResponseBuilder.internalError("Failed to register user");
  }
});
