import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, insertUserSchema } from "@workspace/db";

const router = Router();

const SAFE_COLS = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  role: usersTable.role,
  joinDate: usersTable.joinDate,
  isActive: usersTable.isActive,
};

// LIST — GET /api/users
router.get("/users", async (_req, res) => {
  const users = await db
    .select(SAFE_COLS)
    .from(usersTable)
    .orderBy(usersTable.joinDate);
  res.json(users);
});

// READ ONE — GET /api/users/:id
router.get("/users/:id", async (req, res) => {
  const [user] = await db
    .select(SAFE_COLS)
    .from(usersTable)
    .where(eq(usersTable.id, req.params.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// CREATE — POST /api/users
router.post("/users", async (req, res) => {
  const parsed = insertUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(usersTable)
    .values(parsed.data)
    .returning(SAFE_COLS);
  res.status(201).json(created);
});

// UPDATE — PUT /api/users/:id
router.put("/users/:id", async (req, res) => {
  const parsed = insertUserSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.params.id))
    .returning(SAFE_COLS);
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

// DELETE — DELETE /api/users/:id
router.delete("/users/:id", async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
  res.status(204).send();
});

export default router;
