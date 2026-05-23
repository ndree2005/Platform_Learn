import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: Lesson[];
  enrolledStudents: string[];
  rating: number;
  isPublished: boolean;
  createdAt: string;
  color: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score?: number;
  status: "pending" | "submitted" | "graded";
  answer?: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  percentage: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  joinDate: string;
  isActive: boolean;
}

interface DataContextType {
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  progress: Progress[];
  users: AppUser[];
  addCourse: (course: Omit<Course, "id" | "createdAt" | "enrolledStudents" | "rating">) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  enrollInCourse: (userId: string, courseId: string) => void;
  addAssignment: (assignment: Omit<Assignment, "id">) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string, studentId: string, studentName: string, answer: string) => void;
  gradeSubmission: (submissionId: string, score: number) => void;
  updateProgress: (userId: string, courseId: string, lessonId: string) => void;
  addUser: (user: Omit<AppUser, "id" | "joinDate">) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  getUserProgress: (userId: string, courseId: string) => Progress | undefined;
  getStudentSubmission: (assignmentId: string, studentId: string) => Submission | undefined;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
}

const DataContext = createContext<DataContextType | null>(null);

const SEED_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Introduction to Python Programming",
    description: "Learn the fundamentals of Python programming from scratch. Cover variables, data types, loops, functions, and object-oriented programming.",
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
      { id: "l1-1", courseId: "course-1", title: "Getting Started with Python", duration: "45 min", type: "video", order: 1 },
      { id: "l1-2", courseId: "course-1", title: "Variables and Data Types", duration: "50 min", type: "video", order: 2 },
      { id: "l1-3", courseId: "course-1", title: "Control Flow & Loops", duration: "55 min", type: "video", order: 3 },
      { id: "l1-4", courseId: "course-1", title: "Functions and Modules", duration: "60 min", type: "reading", order: 4 },
      { id: "l1-5", courseId: "course-1", title: "Object-Oriented Programming", duration: "70 min", type: "video", order: 5 },
      { id: "l1-6", courseId: "course-1", title: "Final Project Quiz", duration: "30 min", type: "quiz", order: 6 },
    ],
  },
  {
    id: "course-2",
    title: "UI/UX Design Fundamentals",
    description: "Master the principles of user interface and user experience design. Learn design thinking, wireframing, prototyping, and usability testing.",
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
      { id: "l2-1", courseId: "course-2", title: "Design Thinking Process", duration: "40 min", type: "video", order: 1 },
      { id: "l2-2", courseId: "course-2", title: "Color Theory & Typography", duration: "50 min", type: "video", order: 2 },
      { id: "l2-3", courseId: "course-2", title: "Wireframing Basics", duration: "45 min", type: "reading", order: 3 },
      { id: "l2-4", courseId: "course-2", title: "Prototyping with Figma", duration: "65 min", type: "video", order: 4 },
      { id: "l2-5", courseId: "course-2", title: "Usability Testing", duration: "50 min", type: "quiz", order: 5 },
    ],
  },
  {
    id: "course-3",
    title: "Data Science with R",
    description: "Dive into data analysis, visualization, and statistical modeling using the R programming language. Learn tidyverse, ggplot2, and machine learning basics.",
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
      { id: "l3-1", courseId: "course-3", title: "Introduction to R", duration: "45 min", type: "video", order: 1 },
      { id: "l3-2", courseId: "course-3", title: "Data Wrangling with tidyverse", duration: "60 min", type: "video", order: 2 },
      { id: "l3-3", courseId: "course-3", title: "Data Visualization with ggplot2", duration: "55 min", type: "video", order: 3 },
      { id: "l3-4", courseId: "course-3", title: "Statistical Analysis", duration: "70 min", type: "reading", order: 4 },
      { id: "l3-5", courseId: "course-3", title: "Machine Learning Intro", duration: "80 min", type: "video", order: 5 },
      { id: "l3-6", courseId: "course-3", title: "Capstone Project", duration: "90 min", type: "quiz", order: 6 },
    ],
  },
  {
    id: "course-4",
    title: "Web Development Bootcamp",
    description: "A comprehensive course covering HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and deploy them to the web.",
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
      { id: "l4-1", courseId: "course-4", title: "HTML & CSS Fundamentals", duration: "50 min", type: "video", order: 1 },
      { id: "l4-2", courseId: "course-4", title: "JavaScript Essentials", duration: "65 min", type: "video", order: 2 },
      { id: "l4-3", courseId: "course-4", title: "React.js Basics", duration: "70 min", type: "video", order: 3 },
      { id: "l4-4", courseId: "course-4", title: "Backend with Node.js", duration: "75 min", type: "reading", order: 4 },
      { id: "l4-5", courseId: "course-4", title: "Databases & APIs", duration: "60 min", type: "video", order: 5 },
      { id: "l4-6", courseId: "course-4", title: "Deployment & Best Practices", duration: "55 min", type: "quiz", order: 6 },
    ],
  },
];

const SEED_ASSIGNMENTS: Assignment[] = [
  { id: "asgn-1", courseId: "course-1", courseName: "Intro to Python", title: "Build a Calculator App", description: "Create a command-line calculator that performs basic arithmetic operations.", dueDate: "2025-06-10", maxScore: 100 },
  { id: "asgn-2", courseId: "course-1", courseName: "Intro to Python", title: "OOP Project", description: "Design a class hierarchy for a library management system.", dueDate: "2025-06-25", maxScore: 100 },
  { id: "asgn-3", courseId: "course-2", courseName: "UI/UX Design", title: "Redesign a Mobile App", description: "Choose any existing app and create a redesign mockup in Figma.", dueDate: "2025-06-15", maxScore: 100 },
  { id: "asgn-4", courseId: "course-3", courseName: "Data Science with R", title: "Exploratory Data Analysis", description: "Perform EDA on a provided dataset and present your findings.", dueDate: "2025-06-20", maxScore: 100 },
  { id: "asgn-5", courseId: "course-4", courseName: "Web Dev Bootcamp", title: "Build a Portfolio Site", description: "Create a personal portfolio website using HTML, CSS, and JavaScript.", dueDate: "2025-06-18", maxScore: 100 },
];

const SEED_SUBMISSIONS: Submission[] = [
  { id: "sub-1", assignmentId: "asgn-1", studentId: "stu-1", studentName: "Alex Johnson", submittedAt: "2025-06-08", score: 92, status: "graded", answer: "Submitted calculator code" },
  { id: "sub-2", assignmentId: "asgn-4", studentId: "stu-2", studentName: "Maria Garcia", submittedAt: "2025-06-19", status: "submitted", answer: "EDA report attached" },
  { id: "sub-3", assignmentId: "asgn-3", studentId: "stu-2", studentName: "Maria Garcia", submittedAt: "2025-06-14", score: 88, status: "graded", answer: "Figma link shared" },
];

const SEED_PROGRESS: Progress[] = [
  { userId: "stu-1", courseId: "course-1", completedLessons: ["l1-1", "l1-2", "l1-3"], percentage: 50 },
  { userId: "stu-1", courseId: "course-4", completedLessons: ["l4-1"], percentage: 17 },
  { userId: "stu-2", courseId: "course-2", completedLessons: ["l2-1", "l2-2", "l2-3", "l2-4"], percentage: 80 },
  { userId: "stu-2", courseId: "course-3", completedLessons: ["l3-1", "l3-2"], percentage: 33 },
  { userId: "stu-3", courseId: "course-1", completedLessons: ["l1-1", "l1-2", "l1-3", "l1-4", "l1-5"], percentage: 83 },
  { userId: "stu-3", courseId: "course-3", completedLessons: ["l3-1"], percentage: 17 },
];

const SEED_USERS: AppUser[] = [
  { id: "admin-1", name: "Admin User", email: "admin@ols.edu", role: "admin", joinDate: "2025-01-01", isActive: true },
  { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah@ols.edu", role: "instructor", joinDate: "2025-01-05", isActive: true },
  { id: "inst-2", name: "Prof. James Wilson", email: "james@ols.edu", role: "instructor", joinDate: "2025-01-10", isActive: true },
  { id: "stu-1", name: "Alex Johnson", email: "alex@ols.edu", role: "student", joinDate: "2025-02-01", isActive: true },
  { id: "stu-2", name: "Maria Garcia", email: "maria@ols.edu", role: "student", joinDate: "2025-02-05", isActive: true },
  { id: "stu-3", name: "Liam Park", email: "liam@ols.edu", role: "student", joinDate: "2025-02-10", isActive: true },
];

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, a, s, p, u] = await Promise.all([
        AsyncStorage.getItem("@ols_courses"),
        AsyncStorage.getItem("@ols_assignments"),
        AsyncStorage.getItem("@ols_submissions"),
        AsyncStorage.getItem("@ols_progress"),
        AsyncStorage.getItem("@ols_users"),
      ]);
      setCourses(c ? JSON.parse(c) : SEED_COURSES);
      setAssignments(a ? JSON.parse(a) : SEED_ASSIGNMENTS);
      setSubmissions(s ? JSON.parse(s) : SEED_SUBMISSIONS);
      setProgress(p ? JSON.parse(p) : SEED_PROGRESS);
      setUsers(u ? JSON.parse(u) : SEED_USERS);
    };
    load();
  }, []);

  const save = async (key: string, data: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  };

  const addCourse = (course: Omit<Course, "id" | "createdAt" | "enrolledStudents" | "rating">) => {
    const newCourse: Course = { ...course, id: genId(), createdAt: new Date().toISOString().split("T")[0], enrolledStudents: [], rating: 0 };
    setCourses((prev) => { const next = [...prev, newCourse]; save("@ols_courses", next); return next; });
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => { const next = prev.map((c) => c.id === id ? { ...c, ...updates } : c); save("@ols_courses", next); return next; });
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => { const next = prev.filter((c) => c.id !== id); save("@ols_courses", next); return next; });
  };

  const enrollInCourse = (userId: string, courseId: string) => {
    setCourses((prev) => {
      const next = prev.map((c) => c.id === courseId && !c.enrolledStudents.includes(userId)
        ? { ...c, enrolledStudents: [...c.enrolledStudents, userId] } : c);
      save("@ols_courses", next);
      return next;
    });
  };

  const addAssignment = (assignment: Omit<Assignment, "id">) => {
    const newA: Assignment = { ...assignment, id: genId() };
    setAssignments((prev) => { const next = [...prev, newA]; save("@ols_assignments", next); return next; });
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => { const next = prev.filter((a) => a.id !== id); save("@ols_assignments", next); return next; });
  };

  const submitAssignment = (assignmentId: string, studentId: string, studentName: string, answer: string) => {
    const sub: Submission = { id: genId(), assignmentId, studentId, studentName, submittedAt: new Date().toISOString().split("T")[0], status: "submitted", answer };
    setSubmissions((prev) => { const next = [...prev, sub]; save("@ols_submissions", next); return next; });
  };

  const gradeSubmission = (submissionId: string, score: number) => {
    setSubmissions((prev) => { const next = prev.map((s) => s.id === submissionId ? { ...s, score, status: "graded" as const } : s); save("@ols_submissions", next); return next; });
  };

  const updateProgress = (userId: string, courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.userId === userId && p.courseId === courseId);
      const course = courses.find((c) => c.id === courseId);
      const totalLessons = course?.lessons.length ?? 1;
      let next: Progress[];
      if (existing) {
        if (existing.completedLessons.includes(lessonId)) return prev;
        const completedLessons = [...existing.completedLessons, lessonId];
        next = prev.map((p) => p.userId === userId && p.courseId === courseId
          ? { ...p, completedLessons, percentage: Math.round((completedLessons.length / totalLessons) * 100) } : p);
      } else {
        next = [...prev, { userId, courseId, completedLessons: [lessonId], percentage: Math.round((1 / totalLessons) * 100) }];
      }
      save("@ols_progress", next);
      return next;
    });
  };

  const addUser = (user: Omit<AppUser, "id" | "joinDate">) => {
    const newU: AppUser = { ...user, id: genId(), joinDate: new Date().toISOString().split("T")[0] };
    setUsers((prev) => { const next = [...prev, newU]; save("@ols_users", next); return next; });
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers((prev) => { const next = prev.map((u) => u.id === id ? { ...u, ...updates } : u); save("@ols_users", next); return next; });
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => { const next = prev.filter((u) => u.id !== id); save("@ols_users", next); return next; });
  };

  const getUserProgress = (userId: string, courseId: string) =>
    progress.find((p) => p.userId === userId && p.courseId === courseId);

  const getStudentSubmission = (assignmentId: string, studentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);

  const getSubmissionsForAssignment = (assignmentId: string) =>
    submissions.filter((s) => s.assignmentId === assignmentId);

  return (
    <DataContext.Provider value={{
      courses, assignments, submissions, progress, users,
      addCourse, updateCourse, deleteCourse, enrollInCourse,
      addAssignment, deleteAssignment, submitAssignment, gradeSubmission,
      updateProgress, addUser, updateUser, deleteUser,
      getUserProgress, getStudentSubmission, getSubmissionsForAssignment,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
