// artifacts/api-server/src/routes/course.ts
import { Router, Request, Response } from "express";

const router = Router();

// GET - Ambil semua courses
router.get("/", (req: Request, res: Response) => {
  const courses = [
    { id: "1", title: "TypeScript Basics", description: "...", price: 29.99 },
    { id: "2", title: "React Advanced", description: "...", price: 49.99 },
  ];
  res.json(courses);
});

// GET - Ambil course by ID
router.get("/:id", (req: Request, res: Response) => {
  const course = {
    id: req.params.id,
    title: "Course Name",
    description: "...",
  };
  res.json(course);
});

// POST - Buat course baru (CREATE)
router.post("/", (req: Request, res: Response) => {
  const newCourse = { id: "3", ...req.body };
  res.status(201).json(newCourse);
});

// PUT - Update course (UPDATE)
router.put("/:id", (req: Request, res: Response) => {
  const updatedCourse = { id: req.params.id, ...req.body };
  res.json(updatedCourse);
});

// DELETE - Hapus course
router.delete("/:id", (req: Request, res: Response) => {
  res.json({ message: "Course deleted" });
});

export default router;
