#!/usr/bin/env node

import bcryptjs from "bcryptjs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./src/schema/models/user.ts";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env from workspace root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../.env") });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { usersTable } });

/**
 * Seed demo users untuk testing
 * 
 * Demo credentials:
 * - Student: student@demo.com / password123
 * - Instructor: instructor@demo.com / password123
 * - Admin: admin@demo.com / password123
 */
async function seedDemoUsers() {
  console.log("🌱 Seeding demo users...");

  // Hash password "password123"
  const hashedPassword = await bcryptjs.hash("password123", 10);

  const demoUsers = [
    {
      id: "user-student-001",
      name: "Demo Student",
      email: "student@demo.com",
      passwordHash: hashedPassword,
      role: "student",
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
    {
      id: "user-instructor-001",
      name: "Demo Instructor",
      email: "instructor@demo.com",
      passwordHash: hashedPassword,
      role: "instructor",
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
    {
      id: "user-admin-001",
      name: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: hashedPassword,
      role: "admin",
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
  ];

  for (const user of demoUsers) {
    try {
      // Try to insert, ignore if already exists
      await db.insert(usersTable).values(user);
      console.log(`✅ Created user: ${user.email}`);
    } catch (err) {
      if (err?.code === "23505") {
        // Unique constraint violation - user already exists
        console.log(`⏭️  Skipped (already exists): ${user.email}`);
      } else {
        throw err;
      }
    }
  }

  console.log("✨ Seeding completed!");
}

seedDemoUsers()
  .then(() => {
    console.log("✅ Demo users seeded successfully");
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding demo users:", err);
    pool.end();
    process.exit(1);
  });
