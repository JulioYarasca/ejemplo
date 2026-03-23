import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// User table - optimized for your current use case
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Required for credentials auth
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age"),
  description: text("description"),
  career: varchar("career", { length: 100 }),
  hobbies: text("hobbies"),
  role: varchar("role", { length: 20 }).notNull().default("student"), // "teacher", "student", or "admin"
  section: varchar("section", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
