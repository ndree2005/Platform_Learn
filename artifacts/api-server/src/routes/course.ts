import { Router } from "express";
import {
  CreateCourseBody,
  DeleteCourseParams,
  EnrollCourseBody,
  EnrollCourseParams,
  EnrollCourseResponse,
  GetCourseParams,
  GetCourseResponse,
  GetCoursesResponse,
  UpdateCourseBody,
  UpdateCourseParams,
  UpdateCourseResponse,
  type Course,
  type CourseInput,
} from "@workspace/api-zod";

const router = Router();

let courses: Course[] = [
  {
    id: "course-1",
    title: "Introduction to Python Programming",
    description:
      "Learn the fundamentals of Python programming from scratch. Cover variables, data types, loops, functions, and object-oriented programming.",
    instructorId: "inst-1",
    instructorName: "Dr. Sarah Chen",
    category: "Programming",
    level: "Beginner",
    duration: "8 weeks",
    color: "#3B5BDB",
    rating: 4.8,
    isPublished: true,
    createdAt: "2025-01-15",
    enrolledStudents: ["stu-1", "stu-3"],
    lessons: [
      {
        id: "l1-1",
        courseId: "course-1",
        title: "Getting Started with Python",
        duration: "45 min",
        type: "video",
        order: 1,
      },
      {
        id: "l1-2",
        courseId: "course-1",
        title: "Variables and Data Types",
        duration: "50 min",
        type: "video",
        order: 2,
      },
      {
        id: "l1-3",
        courseId: "course-1",
        title: "Control Flow & Loops",
        duration: "55 min",
        type: "video",
        order: 3,
      },
    ],
  },
  {
    id: "course-2",
    title: "UI/UX Design Fundamentals",
    description:
      "Master the principles of user interface and user experience design. Learn design thinking, wireframing, prototyping, and usability testing.",
    instructorId: "inst-2",
    instructorName: "Prof. James Wilson",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    color: "#E64980",
    rating: 4.7,
    isPublished: true,
    createdAt: "2025-02-01",
    enrolledStudents: ["stu-2"],
    lessons: [
      {
        id: "l2-1",
        courseId: "course-2",
        title: "Design Thinking Process",
        duration: "40 min",
        type: "video",
        order: 1,
      },
      {
        id: "l2-2",
        courseId: "course-2",
        title: "Color Theory & Typography",
        duration: "50 min",
        type: "video",
        order: 2,
      },
    ],
  },
  {
    id: "course-3",
    title: "Data Science with R",
    description:
      "Dive into data analysis, visualization, and statistical modeling using the R programming language.",
    instructorId: "inst-1",
    instructorName: "Dr. Sarah Chen",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 weeks",
    color: "#0CA678",
    rating: 4.6,
    isPublished: true,
    createdAt: "2025-01-20",
    enrolledStudents: ["stu-2", "stu-3"],
    lessons: [
      {
        id: "l3-1",
        courseId: "course-3",
        title: "Introduction to R",
        duration: "45 min",
        type: "video",
        order: 1,
      },
      {
        id: "l3-2",
        courseId: "course-3",
        title: "Data Wrangling with tidyverse",
        duration: "60 min",
        type: "video",
        order: 2,
      },
    ],
  },
  {
    id: "course-4",
    title: "Web Development Bootcamp",
    description:
      "A comprehensive course covering HTML, CSS, JavaScript, React, and Node.js.",
    instructorId: "inst-2",
    instructorName: "Prof. James Wilson",
    category: "Web Dev",
    level: "Intermediate",
    duration: "12 weeks",
    color: "#F76707",
    rating: 4.9,
    isPublished: true,
    createdAt: "2025-03-01",
    enrolledStudents: ["stu-1"],
    lessons: [
      {
        id: "l4-1",
        courseId: "course-4",
        title: "HTML & CSS Fundamentals",
        duration: "50 min",
        type: "video",
        order: 1,
      },
      {
        id: "l4-2",
        courseId: "course-4",
        title: "JavaScript Essentials",
        duration: "65 min",
        type: "video",
        order: 2,
      },
    ],
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCourse(input: CourseInput): Course {
  const id = createId("course");

  return {
    id,
    title: input.title,
    description: input.description,
    instructorId: input.instructorId ?? "inst-1",
    instructorName: input.instructorName ?? "Dr. Sarah Chen",
    category: input.category ?? "Programming",
    level: input.level ?? "Beginner",
    duration: input.duration ?? "4 weeks",
    lessons:
      input.lessons?.map((lesson, index) => ({
        ...lesson,
        courseId: id,
        order: lesson.order ?? index + 1,
      })) ?? [],
    enrolledStudents: [],
    rating: 0,
    isPublished: input.isPublished ?? false,
    createdAt: new Date().toISOString().slice(0, 10),
    color: input.color ?? "#3B5BDB",
  };
}

router.get("/", (_req, res) => {
  const data = GetCoursesResponse.parse(courses);
  res.json(data);
});

router.get("/:id", (req, res) => {
  const params = GetCourseParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ message: "Invalid course id", issues: params.error.issues });
    return;
  }

  const course = courses.find((item) => item.id === params.data.id);

  if (!course) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  const data = GetCourseResponse.parse(course);
  res.json(data);
});

router.post("/", (req, res) => {
  const body = CreateCourseBody.safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ message: "Invalid course payload", issues: body.error.issues });
    return;
  }

  const course = buildCourse(body.data);
  courses = [...courses, course];

  const data = GetCourseResponse.parse(course);
  res.status(201).json(data);
});

router.put("/:id", (req, res) => {
  const params = UpdateCourseParams.safeParse(req.params);
  const body = UpdateCourseBody.safeParse(req.body);

  if (!params.success) {
    res.status(400).json({ message: "Invalid course id", issues: params.error.issues });
    return;
  }

  if (!body.success) {
    res.status(400).json({ message: "Invalid course payload", issues: body.error.issues });
    return;
  }

  const index = courses.findIndex((item) => item.id === params.data.id);

  if (index === -1) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  const current = courses[index];
  const updated: Course = {
    ...current,
    ...body.data,
    id: current.id,
    createdAt: current.createdAt,
    enrolledStudents: current.enrolledStudents,
    rating: current.rating,
    lessons:
      body.data.lessons?.map((lesson, lessonIndex) => ({
        ...lesson,
        courseId: current.id,
        order: lesson.order ?? lessonIndex + 1,
      })) ?? current.lessons,
  };

  courses = courses.map((item) => (item.id === updated.id ? updated : item));

  const data = UpdateCourseResponse.parse(updated);
  res.json(data);
});

router.delete("/:id", (req, res) => {
  const params = DeleteCourseParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ message: "Invalid course id", issues: params.error.issues });
    return;
  }

  const exists = courses.some((item) => item.id === params.data.id);

  if (!exists) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  courses = courses.filter((item) => item.id !== params.data.id);
  res.status(204).send();
});

router.post("/:id/enrollments", (req, res) => {
  const params = EnrollCourseParams.safeParse(req.params);
  const body = EnrollCourseBody.safeParse(req.body);

  if (!params.success) {
    res.status(400).json({ message: "Invalid course id", issues: params.error.issues });
    return;
  }

  if (!body.success) {
    res.status(400).json({ message: "Invalid enrollment payload", issues: body.error.issues });
    return;
  }

  const course = courses.find((item) => item.id === params.data.id);

  if (!course) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  const enrolledStudents = course.enrolledStudents.includes(body.data.userId)
    ? course.enrolledStudents
    : [...course.enrolledStudents, body.data.userId];

  const updated: Course = { ...course, enrolledStudents };
  courses = courses.map((item) => (item.id === updated.id ? updated : item));

  const data = EnrollCourseResponse.parse(updated);
  res.json(data);
});

export default router;
