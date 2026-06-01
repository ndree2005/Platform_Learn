import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  submissionsTable,
  insertAssignmentSchema,
  insertSubmissionSchema,
} from "@workspace/db";

const router = Router();

// LIST — GET /api/assignments
router.get("/assignments", async (_req, res) => {
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .orderBy(assignmentsTable.dueDate);
  res.json(assignments);
});

// READ ONE — GET /api/assignments/:id
router.get("/assignments/:id", async (req, res) => {
  const [assignment] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, req.params.id));
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  res.json(assignment);
});

// CREATE — POST /api/assignments
router.post("/assignments", async (req, res) => {
  const parsed = insertAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(assignmentsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(created);
});

// DELETE — DELETE /api/assignments/:id
router.delete("/assignments/:id", async (req, res) => {
  await db.delete(assignmentsTable).where(eq(assignmentsTable.id, req.params.id));
  res.status(204).send();
});

// SUBMIT — POST /api/assignments/:id/submit
router.post("/assignments/:id/submit", async (req, res) => {
  const parsed = insertSubmissionSchema.safeParse({
    ...req.body,
    assignmentId: req.params.id,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(submissionsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(created);
});

// LIST SUBMISSIONS — GET /api/submissions?assignmentId=&studentId=
router.get("/submissions", async (req, res) => {
  const { assignmentId, studentId } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (assignmentId) conditions.push(eq(submissionsTable.assignmentId, assignmentId));
  if (studentId)    conditions.push(eq(submissionsTable.studentId, studentId));
  const submissions = conditions.length > 0
    ? await db.select().from(submissionsTable).where(and(...conditions))
    : await db.select().from(submissionsTable);
  res.json(submissions);
});

// GRADE — PUT /api/submissions/:id/grade
router.put("/submissions/:id/grade", async (req, res) => {
  const { score } = req.body as { score?: number };
  if (score == null) {
    res.status(400).json({ error: "score is required" });
    return;
  }
  const [updated] = await db
    .update(submissionsTable)
    .set({ score, status: "graded" })
    .where(eq(submissionsTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  res.json(updated);
});

export default router;
