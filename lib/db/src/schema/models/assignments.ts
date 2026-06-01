import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { usersTable } from "./user";

// lib/db/src/schema/assignments.ts
export const assignmentsTable = pgTable("assignments", {
  id:          text("id").primaryKey(),
  courseId:    text("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  courseName:  text("course_name").notNull(),
  title:       text("title").notNull(),
  description: text("description").notNull().default(""),
  dueDate:     text("due_date").notNull(),
  maxScore:    integer("max_score").notNull().default(100),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const submissionsTable = pgTable("submissions", {
  id:           text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull().references(() => assignmentsTable.id, { onDelete: "cascade" }),
  studentId:    text("student_id").notNull(),
  studentName:  text("student_name").notNull(),
  answer:       text("answer").notNull().default(""),
  score:        integer("score"),
  status:       text("status", { enum: ["pending", "submitted", "graded"] }).notNull().default("submitted"),
  submittedAt:  text("submitted_at").notNull(),
});

export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit({ createdAt: true });
export const insertSubmissionSchema = createInsertSchema(submissionsTable);

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Assignment = typeof assignmentsTable.$inferSelect;
export type Submission = typeof submissionsTable.$inferSelect;
