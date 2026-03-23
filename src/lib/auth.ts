import { db } from "@/lib/db";
import { users, identifiers } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  section?: string;
  code: string;
}

/**
 * Generate API key based on code + username
 */
export function generateApiKey(code: string, username: string): string {
  return Buffer.from(`${code}:${username}`).toString("base64");
}

/**
 * Parse API key to extract code and username
 */
export function parseApiKey(
  apiKey: string,
): { code: string; username: string } | null {
  try {
    const decoded = Buffer.from(apiKey, "base64").toString("utf8");
    const [code, username] = decoded.split(":");

    if (!code || !username) {
      return null;
    }

    return { code, username };
  } catch {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(
  username: string,
  password: string,
): Promise<{ user: AuthenticatedUser; apiKey: string } | null> {
  try {
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user?.password) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Get the code from identifiers table using email
    const [identifier] = await db
      .select()
      .from(identifiers)
      .where(eq(identifiers.email, user.email))
      .limit(1);

    if (!identifier) {
      return null;
    }

    // Generate API key
    const apiKey = generateApiKey(identifier.code, user.username);

    const authenticatedUser: AuthenticatedUser = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      section: user.section || undefined,
      code: identifier.code,
    };

    return { user: authenticatedUser, apiKey };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Verify API key and get user information
 */
export async function verifyApiKey(
  apiKey: string,
): Promise<AuthenticatedUser | null> {
  try {
    const parsed = parseApiKey(apiKey);
    if (!parsed) {
      return null;
    }

    const { code, username } = parsed;

    // Get user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return null;
    }

    // Verify that the code matches the user's email in identifiers
    const [identifier] = await db
      .select()
      .from(identifiers)
      .where(eq(identifiers.email, user.email))
      .limit(1);

    if (!identifier || identifier.code !== code) {
      return null;
    }

    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      section: user.section || undefined,
      code: identifier.code,
    };
  } catch (error) {
    console.error("API key verification error:", error);
    return null;
  }
}

/**
 * Get current user from request headers
 */
export async function getCurrentUser(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return null;
  }

  return await verifyApiKey(apiKey);
}

/**
 * Check if email exists in identifiers table
 */
export async function emailExistsInIdentifiers(
  email: string,
): Promise<boolean> {
  try {
    const [identifier] = await db
      .select()
      .from(identifiers)
      .where(eq(identifiers.email, email))
      .limit(1);

    return !!identifier;
  } catch (error) {
    console.error("Error checking email in identifiers:", error);
    return false;
  }
}
