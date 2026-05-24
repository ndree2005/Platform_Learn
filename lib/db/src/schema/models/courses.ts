import { boolean, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const coursesTable = pgTable("courses", {
  id:             text("id").primaryKey(),
  title:          text("title").notNull(),
  description:    text("description").notNull(),
  instructorId:   text("instructor_id").references(() => usersTable.id),
  category:       text("category").notNull(),
  level:          text("level", { enum: ["Beginner","Intermediate","Advanced"] }).notNull(),
  duration:       text("duration").notNull(),
  color:          text("color").notNull(),
  isPublished:    boolean("is_published").default(false).notNull(),
  rating:         numeric("rating").default("0"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});



export const lessonsTable = pgTable("lessons", {
  id:        text("id").primaryKey(),
  courseId:  text("course_id").references(() => coursesTable.id, { onDelete: "cascade" }),
  title:     text("title").notNull(),
  duration:  text("duration").notNull(),
  type:      text("type", { enum: ["video","reading","quiz"] }).notNull(),
  order:     integer("order").notNull(),
});