import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  progressTable,
  lessonsTable,
  enrollmentsTable,
  insertProgressSchema,
} from "@workspace/db";

const router = Router();

async function aggregateProgress(userId: string, courseId: string) {
  const [rows, allLessons] = await Promise.all([
    db
      .select()
      .from(progressTable)
      .where(and(eq(progressTable.userId, userId), eq(progressTable.courseId, courseId))),
    db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId)),
  ]);
  const completedLessons = rows.map((r) => r.lessonId);
  const total = allLessons.length || 1;
  return {
    userId,
    courseId,
    completedLessons,
    percentage: Math.round((completedLessons.length / total) * 100),
  };
}

// ALL PROGRESS — GET /api/progress/all
// Returns aggregated progress for every enrolled user/course pair
router.get("/progress/all", async (_req, res) => {
  const [enrollments, allProgress, allLessons] = await Promise.all([
    db.select().from(enrollmentsTable),
    db.select().from(progressTable),
    db.select().from(lessonsTable),
  ]);

  const result = enrollments.map((e) => {
    const courseLessons = allLessons.filter((l) => l.courseId === e.courseId);
    const completedLessons = allProgress
      .filter((p) => p.userId === e.studentId && p.courseId === e.courseId)
      .map((p) => p.lessonId);
    const total = courseLessons.length || 1;
    return {
      userId: e.studentId,
      courseId: e.courseId,
      completedLessons,
      percentage: Math.round((completedLessons.length / total) * 100),
    };
  });

  res.json(result);
});

// READ — GET /api/progress/:userId/:courseId
router.get("/progress/:userId/:courseId", async (req, res) => {
  const result = await aggregateProgress(req.params.userId, req.params.courseId);
  res.json(result);
});

// MARK COMPLETE — POST /api/progress
router.post("/progress", async (req, res) => {
  const parsed = insertProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db
    .select()
    .from(progressTable)
    .where(
      and(
        eq(progressTable.userId, parsed.data.userId),
        eq(progressTable.courseId, parsed.data.courseId),
        eq(progressTable.lessonId, parsed.data.lessonId),
      )
    );
  if (existing.length === 0) {
    await db.insert(progressTable).values(parsed.data);
  }
  const result = await aggregateProgress(parsed.data.userId, parsed.data.courseId);
  res.status(201).json(result);
});

export default router;
