import { Router } from "express";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  coursesTable,
  lessonsTable,
  enrollmentsTable,
  insertCourseSchema,
  insertLessonSchema,
} from "@workspace/db";

const router = Router();

type CourseRow = typeof coursesTable.$inferSelect;

/** Attach lessons[] and enrolledStudents[] to an array of course rows. */
async function composeCourses(rows: CourseRow[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((c) => c.id);
  const [lessons, enrollments] = await Promise.all([
    db.select().from(lessonsTable).where(inArray(lessonsTable.courseId, ids)),
    db
      .select()
      .from(enrollmentsTable)
      .where(inArray(enrollmentsTable.courseId, ids)),
  ]);
  return rows.map((course) => ({
    ...course,
    lessons: lessons
      .filter((l) => l.courseId === course.id)
      .sort((a, b) => a.order - b.order),
    enrolledStudents: enrollments
      .filter((e) => e.courseId === course.id)
      .map((e) => e.studentId),
  }));
}

// LIST — GET /api/courses
// Returns only published courses for students to browse
router.get("/courses", async (_req, res) => {
  const rows = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.isPublished, true))
    .orderBy(coursesTable.createdAt);
  res.json(await composeCourses(rows));
});

// LIST INSTRUCTOR COURSES — GET /api/courses/instructor/:instructorId
// Returns ALL courses for a specific instructor (including unpublished drafts)
router.get("/courses/instructor/:instructorId", async (req, res) => {
  const rows = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.instructorId, req.params.instructorId))
    .orderBy(coursesTable.createdAt);
  res.json(await composeCourses(rows));
});

// READ ONE — GET /api/courses/:id
router.get("/courses/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, req.params.id));
  if (!row) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const [composed] = await composeCourses([row]);
  res.json(composed);
});

// CREATE — POST /api/courses
router.post("/courses", async (req, res) => {
  const parsed = insertCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(coursesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json({ ...created, lessons: [], enrolledStudents: [] });
});

// UPDATE — PUT /api/courses/:id
router.put("/courses/:id", async (req, res) => {
  const parsed = insertCourseSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(coursesTable)
    .set(parsed.data)
    .where(eq(coursesTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const [composed] = await composeCourses([updated]);
  res.json(composed);
});

// DELETE — DELETE /api/courses/:id
router.delete("/courses/:id", async (req, res) => {
  await db.delete(coursesTable).where(eq(coursesTable.id, req.params.id));
  res.status(204).send();
});

// ENROLL — POST /api/courses/:id/enroll
router.post("/courses/:id/enroll", async (req, res) => {
  const { studentId } = req.body as { studentId?: string };
  if (!studentId) {
    res.status(400).json({ error: "studentId is required" });
    return;
  }
  const existing = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.courseId, req.params.id));
  if (!existing.some((e) => e.studentId === studentId)) {
    await db.insert(enrollmentsTable).values({
      id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId,
      courseId: req.params.id,
      enrolledAt: new Date().toISOString().split("T")[0],
    });
  }
  const [row] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, req.params.id));
  if (!row) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const [composed] = await composeCourses([row]);
  res.json(composed);
});

// ADD LESSON — POST /api/courses/:id/lessons
router.post("/courses/:id/lessons", async (req, res) => {
  const parsed = insertLessonSchema.safeParse({
    ...req.body,
    courseId: req.params.id,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(lessonsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(created);
});

// DELETE LESSON — DELETE /api/lessons/:id
router.delete("/lessons/:id", async (req, res) => {
  await db.delete(lessonsTable).where(eq(lessonsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
