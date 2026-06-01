import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { lessonsTable } from "./courses";

export const progressTable = pgTable("progress", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").notNull(),
  courseId:    text("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  lessonId:    text("lesson_id").notNull().references(() => lessonsTable.id, { onDelete: "cascade" }),
  completedAt: text("completed_at").notNull(),
});

export const insertProgressSchema = createInsertSchema(progressTable);
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progressTable.$inferSelect;
