import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";
import { usersTable } from "./user";

// lib/db/src/schema/assignments.ts
export const assignmentsTable = pgTable("assignments", {
  id:          text("id").primaryKey(),
  courseId:    text("course_id").references(() => coursesTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description"),
  dueDate:     text("due_date").notNull(),
  maxScore:    integer("max_score").default(100).notNull(),
});


export const submissionsTable = pgTable("submissions", {
  id:           text("id").primaryKey(),
  assignmentId: text("assignment_id").references(() => assignmentsTable.id),
  studentId:    text("student_id").references(() => usersTable.id),
  answer:       text("answer"),
  score:        integer("score"),
  status:       text("status", { enum: ["pending","submitted","graded"] }).default("submitted"),
  submittedAt:  timestamp("submitted_at").defaultNow().notNull(),
});
