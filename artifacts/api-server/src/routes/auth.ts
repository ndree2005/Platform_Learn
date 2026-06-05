import { Router } from "express";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";
import { LoginBody, LoginResponse, LogoutResponse } from "@workspace/api-zod";

const router = Router();

/**
 * POST /api/auth/login
 * 
 * Authenticate a user by email and password.
 * 
 * Request body validated against LoginBody schema (email and password required).
 * Password is compared against bcrypt hash stored in database.
 * 
 * Returns AuthUser on success (200), or ErrorResponse on failure (401/403).
 */
router.post("/auth/login", async (req, res) => {
  try {
    // Validate request body against Zod schema
    const loginRequest = LoginBody.parse(req.body);

    // Query user by email (case-insensitive)
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, loginRequest.email.toLowerCase().trim()));

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Compare password against bcrypt hash
    const passwordMatch = await bcryptjs.compare(
      loginRequest.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is inactive" });
      return;
    }

    // Validate response against Zod schema
    const authUser: z.infer<typeof LoginResponse> = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "student" | "instructor" | "admin",
      isActive: user.isActive,
    };

    res.json(authUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Stateless logout endpoint. Client discards session token after receiving success.
 * 
 * Returns { success: true } on success (200).
 */
router.post("/auth/logout", (_req, res) => {
  try {
    const response: z.infer<typeof LogoutResponse> = { success: true };
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
