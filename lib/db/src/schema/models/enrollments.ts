import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { coursesTable, lessonsTable } from "./courses";

export const enrollmentsTable = pgTable("enrollments", {
  id:         text("id").primaryKey(),
  studentId:  text("student_id").references(() => usersTable.id),
  courseId:   text("course_id").references(() => coursesTable.id),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const progressTable = pgTable("progress", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").references(() => usersTable.id),
  courseId:    text("course_id").references(() => coursesTable.id),
  lessonId:    text("lesson_id").references(() => lessonsTable.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});