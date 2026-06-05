import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router = Router();

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // passwordHash is stored as plain text in the seed for demo purposes
  if (user.passwordHash !== password) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is inactive" });
    return;
  }

  res.json({
    id:      user.id,
    name:    user.name,
    email:   user.email,
    role:    user.role,
    isActive: user.isActive,
  });
});

// POST /api/auth/logout  (stateless — client just discards its session)
router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

export default router;
