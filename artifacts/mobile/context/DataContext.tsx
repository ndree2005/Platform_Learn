import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/constants/api";

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

type NewAppUser = Omit<AppUser, "id" | "joinDate"> &
  Partial<Pick<AppUser, "id" | "joinDate">>;

interface DataContextType {
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  progress: Progress[];
  users: AppUser[];
  loading: boolean;
  addCourse: (
    course: Omit<Course, "id" | "createdAt" | "enrolledStudents" | "rating">,
  ) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  enrollInCourse: (userId: string, courseId: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, "id">) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  submitAssignment: (
    assignmentId: string,
    studentId: string,
    studentName: string,
    answer: string,
  ) => Promise<void>;
  gradeSubmission: (submissionId: string, score: number) => Promise<void>;
  updateProgress: (
    userId: string,
    courseId: string,
    lessonId: string,
  ) => Promise<void>;
  addUser: (user: NewAppUser) => Promise<void>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserProgress: (userId: string, courseId: string) => Progress | undefined;
  getStudentSubmission: (
    assignmentId: string,
    studentId: string,
  ) => Submission | undefined;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
}

const DataContext = createContext<DataContextType | null>(null);

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a, s, p, u] = await Promise.all([
          api.get<Course[]>("/courses"),
          api.get<Assignment[]>("/assignments"),
          api.get<Submission[]>("/submissions"),
          api.get<Progress[]>("/progress/all"),
          api.get<AppUser[]>("/users"),
        ]);
        setCourses(c);
        setAssignments(a);
        setSubmissions(s);
        setProgress(p);
        setUsers(u);
      } catch (err) {
        console.error("DataContext load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Courses ──────────────────────────────────────────────────────────────

  const addCourse = async (
    course: Omit<Course, "id" | "createdAt" | "enrolledStudents" | "rating">,
  ) => {
    const newCourse = {
      ...course,
      id: genId(),
      createdAt: new Date().toISOString().split("T")[0],
      rating: 0,
    };
    const created = await api.post<Course>("/courses", newCourse);
    setCourses((prev) => [...prev, created]);
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const updated = await api.put<Course>(`/courses/${id}`, updates);
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    );
  };

  const deleteCourse = async (id: string) => {
    await api.delete(`/courses/${id}`);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const enrollInCourse = async (userId: string, courseId: string) => {
    const updated = await api.post<Course>(`/courses/${courseId}/enroll`, {
      studentId: userId,
    });
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
  };

  // ── Assignments ──────────────────────────────────────────────────────────

  const addAssignment = async (assignment: Omit<Assignment, "id">) => {
    const payload = { ...assignment, id: genId() };
    const created = await api.post<Assignment>("/assignments", payload);
    setAssignments((prev) => [...prev, created]);
  };

  const deleteAssignment = async (id: string) => {
    await api.delete(`/assignments/${id}`);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const submitAssignment = async (
    assignmentId: string,
    studentId: string,
    studentName: string,
    answer: string,
  ) => {
    const payload = {
      id: genId(),
      studentId,
      studentName,
      answer,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "submitted",
    };
    const created = await api.post<Submission>(
      `/assignments/${assignmentId}/submit`,
      payload,
    );
    setSubmissions((prev) => [...prev, created]);
  };

  const gradeSubmission = async (submissionId: string, score: number) => {
    const updated = await api.put<Submission>(
      `/submissions/${submissionId}/grade`,
      { score },
    );
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? updated : s)),
    );
  };

  // ── Progress ──────────────────────────────────────────────────────────────

  const updateProgress = async (
    userId: string,
    courseId: string,
    lessonId: string,
  ) => {
    const course = courses.find((c) => c.id === courseId);
    const existing = progress.find(
      (p) => p.userId === userId && p.courseId === courseId,
    );
    if (existing?.completedLessons.includes(lessonId)) return;
    const payload = {
      id: genId(),
      userId,
      courseId,
      lessonId,
      completedAt: new Date().toISOString().split("T")[0],
    };
    const result = await api.post<Progress>("/progress", payload);
    setProgress((prev) => {
      const filtered = prev.filter(
        (p) => !(p.userId === userId && p.courseId === courseId),
      );
      return [...filtered, result];
    });
  };

  // ── Users ──────────────────────────────────────────────────────────────

  const addUser = async (user: NewAppUser) => {
    const payload = {
      ...user,
      id: user.id ?? genId(),
      joinDate: user.joinDate ?? new Date().toISOString().split("T")[0],
      passwordHash: "",
    };
    const created = await api.post<AppUser>("/users", payload);
    setUsers((prev) => [...prev, created]);
  };

  const updateUser = async (id: string, updates: Partial<AppUser>) => {
    const updated = await api.put<AppUser>(`/users/${id}`, updates);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    );
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── Computed getters ──────────────────────────────────────────────────────

  const getUserProgress = (userId: string, courseId: string) =>
    progress.find((p) => p.userId === userId && p.courseId === courseId);

  const getStudentSubmission = (assignmentId: string, studentId: string) =>
    submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId,
    );

  const getSubmissionsForAssignment = (assignmentId: string) =>
    submissions.filter((s) => s.assignmentId === assignmentId);

  return (
    <DataContext.Provider
      value={{
        courses,
        assignments,
        submissions,
        progress,
        users,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        enrollInCourse,
        addAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        updateProgress,
        addUser,
        updateUser,
        deleteUser,
        getUserProgress,
        getStudentSubmission,
        getSubmissionsForAssignment,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
