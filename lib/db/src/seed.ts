import bcryptjs from "bcryptjs";
import { db, usersTable } from "./index";

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
      role: "student" as const,
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
    {
      id: "user-instructor-001",
      name: "Demo Instructor",
      email: "instructor@demo.com",
      passwordHash: hashedPassword,
      role: "instructor" as const,
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
    {
      id: "user-admin-001",
      name: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: hashedPassword,
      role: "admin" as const,
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
      if ((err as any).code === "23505") {
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
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding demo users:", err);
    process.exit(1);
  });
