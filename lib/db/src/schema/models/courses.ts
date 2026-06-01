import { pgTable, text, boolean, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id:             text("id").primaryKey(),
  title:          text("title").notNull(),
  description:    text("description").notNull(),
  instructorId:   text("instructor_id").notNull(),
  instructorName: text("instructor_name").notNull(),
  category:       text("category").notNull(),
  level:          text("level", { enum: ["Beginner", "Intermediate", "Advanced"] }).notNull(),
  duration:       text("duration").notNull(),
  color:          text("color").notNull().default("#3B5BDB"),
  rating:         real("rating").notNull().default(0),
  isPublished:    boolean("is_published").notNull().default(false),
  createdAt:      text("created_at").notNull(),
});

export const lessonsTable = pgTable("lessons", {
  id:       text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  title:    text("title").notNull(),
  duration: text("duration").notNull(),
  type:     text("type", { enum: ["video", "reading", "quiz"] }).notNull(),
  order:    integer("order").notNull(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id:         text("id").primaryKey(),
  studentId:  text("student_id").notNull(),
  courseId:   text("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  enrolledAt: text("enrolled_at").notNull(),
});

export const insertCourseSchema = createInsertSchema(coursesTable);
export const insertLessonSchema = createInsertSchema(lessonsTable);
export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable);

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Course = typeof coursesTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Enrollment = typeof enrollmentsTable.$inferSelect;
