import { ApiResponse, ApiError } from "@/lib/types/api";
import { NextResponse } from "next/server";

/**
 * Utility functions for creating consistent API responses
 * These functions ensure all API endpoints return responses in the same format
 */

export class ApiResponseBuilder {
  /**
   * Creates a successful API response
   */
  static success<T>(
    data?: T,
    message?: string,
    status: number = 200,
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      data,
      message,
      success: true,
      status,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Creates an error API response
   */
  static error(
    errors: string[] | string,
    status: number = 400,
    message?: string,
  ): NextResponse<ApiResponse> {
    const errorArray = Array.isArray(errors) ? errors : [errors];

    const response: ApiResponse = {
      errors: errorArray,
      message: message || "An error occurred",
      success: false,
      status,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Creates a validation error response
   */
  static validationError(
    errors: ApiError[],
    message: string = "Validation failed",
  ): NextResponse<ApiResponse> {
    const errorMessages = errors.map((error) =>
      error.field ? `${error.field}: ${error.message}` : error.message,
    );

    return this.error(errorMessages, 422, message);
  }

  /**
   * Creates an unauthorized response
   */
  static unauthorized(
    message: string = "Authentication required",
  ): NextResponse<ApiResponse> {
    return this.error([message], 401, "Unauthorized");
  }

  /**
   * Creates a forbidden response
   */
  static forbidden(
    message: string = "Access denied",
  ): NextResponse<ApiResponse> {
    return this.error([message], 403, "Forbidden");
  }

  /**
   * Creates a not found response
   */
  static notFound(
    message: string = "Resource not found",
  ): NextResponse<ApiResponse> {
    return this.error([message], 404, "Not Found");
  }

  /**
   * Creates an internal server error response
   */
  static internalError(
    message: string = "Internal server error",
  ): NextResponse<ApiResponse> {
    return this.error([message], 500, "Internal Server Error");
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  static handleDatabaseError(error: Error): NextResponse<ApiResponse> {
    console.error("Database error:", error);

    // Handle specific database errors
    const errorWithCode = error as Error & { code?: string };
    if (errorWithCode.code === "23505") {
      // Unique constraint violation
      return ApiResponseBuilder.error(
        ["Resource already exists"],
        409,
        "Conflict",
      );
    }

    if (errorWithCode.code === "23503") {
      // Foreign key constraint violation
      return ApiResponseBuilder.error(
        ["Referenced resource does not exist"],
        400,
        "Bad Request",
      );
    }

    return ApiResponseBuilder.internalError("Database operation failed");
  }

  static handleUnknownError(error: Error): NextResponse<ApiResponse> {
    console.error("Unknown error:", error);

    return ApiResponseBuilder.internalError(
      process.env.NODE_ENV === "development"
        ? error.message || "Unknown error occurred"
        : "Internal server error",
    );
  }
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Handle known error types
      if (errorObj.name === "ValidationError") {
        return ApiResponseBuilder.validationError([
          { message: errorObj.message, field: "", code: "custom" },
        ]);
      }

      if (errorObj.message?.includes("database")) {
        return ErrorHandler.handleDatabaseError(errorObj);
      }

      return ErrorHandler.handleUnknownError(errorObj);
    }
  };
}
