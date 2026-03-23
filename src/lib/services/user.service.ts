import { db } from "@/lib/db";
import { users, identifiers, type User, type NewUser } from "@/lib/db/schema";
import { eq, like, or, count, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import type {
  UserQuery,
  CreateUserData,
  UpdateUserData,
} from "@/lib/validators";

/**
 * User service layer for business logic
 * This layer handles all user-related operations with proper error handling
 */

export class UserService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(query: UserQuery) {
    try {
      const { page, pageSize, role, section, search } = query;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const conditions = [];
      if (role) {
        conditions.push(eq(users.role, role));
      }
      if (section) {
        conditions.push(eq(users.section, section));
      }
      if (search) {
        conditions.push(
          or(
            like(users.name, `%${search}%`),
            like(users.username, `%${search}%`),
            like(users.email, `%${search}%`),
          ),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get users with pagination
      const userList = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          age: users.age,
          description: users.description,
          career: users.career,
          hobbies: users.hobbies,
          role: users.role,
          section: users.section,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(users.createdAt);

      // Get total count for pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(users)
        .where(whereClause);

      return {
        users: userList,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Get a user by ID
   */
  static async getUserById(id: number): Promise<Omit<User, "password"> | null> {
    try {
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          age: users.age,
          description: users.description,
          career: users.career,
          hobbies: users.hobbies,
          role: users.role,
          section: users.section,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Get a user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Create a new user
   */
  static async createUser(
    userData: CreateUserData,
  ): Promise<Omit<User, "password">> {
    try {
      // Check if email exists in identifiers table first
      const [identifier] = await db
        .select()
        .from(identifiers)
        .where(eq(identifiers.email, userData.email))
        .limit(1);

      if (!identifier) {
        throw new Error(
          "Email not found in identifiers. Registration not allowed for this email.",
        );
      }

      // Check if user already exists
      const existingUserByEmail = await this.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error("User with this email already exists");
      }

      const existingUserByUsername = await this.getUserByUsername(
        userData.username,
      );
      if (existingUserByUsername) {
        throw new Error("User with this username already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const newUser: NewUser = {
        ...userData,
        password: hashedPassword,
      };

      const [createdUser] = await db.insert(users).values(newUser).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        age: users.age,
        description: users.description,
        career: users.career,
        hobbies: users.hobbies,
        role: users.role,
        section: users.section,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

      return createdUser;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create user");
    }
  }

  /**
   * Update a user
   */
  static async updateUser(
    id: number,
    userData: UpdateUserData,
  ): Promise<Omit<User, "password"> | null> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Check for unique constraints if updating email or username
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.getUserByEmail(userData.email);
        if (userWithEmail) {
          throw new Error("User with this email already exists");
        }
      }

      if (userData.username && userData.username !== existingUser.username) {
        const userWithUsername = await this.getUserByUsername(
          userData.username,
        );
        if (userWithUsername) {
          throw new Error("User with this username already exists");
        }
      }

      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          age: users.age,
          description: users.description,
          career: users.career,
          hobbies: users.hobbies,
          role: users.role,
          section: users.section,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      return updatedUser || null;
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));

      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  /**
   * Update user password
   */
  static async updateUserPassword(
    id: number,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const hashedPassword = await hashPassword(newPassword);

      const result = await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw new Error("Failed to update password");
    }
  }

  /**
   * Update user description only
   */
  static async updateUserDescription(
    id: number,
    description?: string,
  ): Promise<Omit<User, "password"> | null> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Update only description
      const [updatedUser] = await db
        .update(users)
        .set({ description, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          age: users.age,
          description: users.description,
          career: users.career,
          hobbies: users.hobbies,
          role: users.role,
          section: users.section,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      return updatedUser || null;
    } catch (error) {
      console.error("Error updating user description:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user description");
    }
  }
}
