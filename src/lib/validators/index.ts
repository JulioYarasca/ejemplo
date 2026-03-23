import { z } from "zod";

/**
 * Validation schemas for API requests
 * These schemas ensure data integrity and provide clear error messages
 */

// User validation schemas
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^\w+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: "Please enter a valid email address",
    })
    .max(100, "Email must be at most 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(16, "Age must be at least 16")
    .max(120, "Age must be at most 120")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  career: z
    .string()
    .max(100, "Career must be at most 100 characters")
    .optional(),
  hobbies: z
    .string()
    .max(500, "Hobbies must be at most 500 characters")
    .optional(),
  section: z
    .string()
    .max(10, "Section must be at most 10 characters")
    .optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true });

export const updateDescriptionSchema = z.object({
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export const updateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
});

// Authentication schemas
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = createUserSchema;

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const userQuerySchema = z.object({
  role: z.enum(["student", "teacher", "admin"]).optional(),
  section: z.string().optional(),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

// ID parameter schemas
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});

// Admin user update schema (allows role changes)
export const adminUpdateUserSchema = createUserSchema.partial().extend({
  role: z.enum(["student", "teacher", "admin"]).optional(),
});

/**
 * Validation helper functions
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[] | undefined>,
) {
  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

// Type exports for better TypeScript support
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateDescriptionData = z.infer<typeof updateDescriptionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type AdminUpdateUserData = z.infer<typeof adminUpdateUserSchema>;
