import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// lib/db/src/schema/users.ts
export const usersTable = pgTable("users", {
  id:        text("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").notNull().unique(),
  password:  text("password").notNull(),      // bcrypt hash
  role:      text("role", { enum: ["student","instructor","admin"] }).notNull(),
  isActive:  boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});