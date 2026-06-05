import AsyncStorage from "@react-native-async-storage/async-storage";
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
  syncError: string | null;
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

const STORAGE_KEYS = {
  courses: "@ols_courses",
  assignments: "@ols_assignments",
  submissions: "@ols_submissions",
  progress: "@ols_progress",
  users: "@ols_users",
} as const;

async function getStoredArray<T>(key: string): Promise<T[]> {
  const data = await AsyncStorage.getItem(key);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveStoredArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function describeError(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

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
  const [syncError, setSyncError] = useState<string | null>(null);
  const [readyToPersist, setReadyToPersist] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const failedResources: string[] = [];

      try {
        const [cachedCourses, cachedAssignments, cachedSubmissions, cachedProgress, cachedUsers] =
          await Promise.all([
            getStoredArray<Course>(STORAGE_KEYS.courses),
            getStoredArray<Assignment>(STORAGE_KEYS.assignments),
            getStoredArray<Submission>(STORAGE_KEYS.submissions),
            getStoredArray<Progress>(STORAGE_KEYS.progress),
            getStoredArray<AppUser>(STORAGE_KEYS.users),
          ]);

        if (cancelled) return;

        setCourses(cachedCourses);
        setAssignments(cachedAssignments);
        setSubmissions(cachedSubmissions);
        setProgress(cachedProgress);
        setUsers(cachedUsers);
      } catch (err) {
        console.error("DataContext cache load error:", err);
      }

      const results = await Promise.allSettled([
        api.get<Course[]>("/courses"),
        api.get<Assignment[]>("/assignments"),
        api.get<Submission[]>("/submissions"),
        api.get<Progress[]>("/progress/all"),
        api.get<AppUser[]>("/users"),
      ]);

      if (cancelled) return;

      const [coursesResult, assignmentsResult, submissionsResult, progressResult, usersResult] =
        results;

      if (coursesResult.status === "fulfilled") {
        setCourses(coursesResult.value);
      } else {
        failedResources.push("courses");
        console.error("DataContext courses sync error:", coursesResult.reason);
      }

      if (assignmentsResult.status === "fulfilled") {
        setAssignments(assignmentsResult.value);
      } else {
        failedResources.push("assignments");
        console.error("DataContext assignments sync error:", assignmentsResult.reason);
      }

      if (submissionsResult.status === "fulfilled") {
        setSubmissions(submissionsResult.value);
      } else {
        failedResources.push("submissions");
        console.error("DataContext submissions sync error:", submissionsResult.reason);
      }

      if (progressResult.status === "fulfilled") {
        setProgress(progressResult.value);
      } else {
        failedResources.push("progress");
        console.error("DataContext progress sync error:", progressResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        failedResources.push("users");
        console.error("DataContext users sync error:", usersResult.reason);
      }

      if (failedResources.length > 0) {
        setSyncError(`Could not sync ${failedResources.join(", ")}. Using local data.`);
      } else {
        setSyncError(null);
      }

      if (!cancelled) {
        setReadyToPersist(true);
        setLoading(false);
      }
    };

    load().catch((err) => {
      if (cancelled) return;
      console.error("DataContext load error:", err);
      setSyncError(`Could not load data: ${describeError(err)}`);
      setReadyToPersist(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!readyToPersist) return;
    saveStoredArray(STORAGE_KEYS.courses, courses).catch((err) => {
      console.error("DataContext courses cache save error:", err);
    });
  }, [courses, readyToPersist]);

  useEffect(() => {
    if (!readyToPersist) return;
    saveStoredArray(STORAGE_KEYS.assignments, assignments).catch((err) => {
      console.error("DataContext assignments cache save error:", err);
    });
  }, [assignments, readyToPersist]);

  useEffect(() => {
    if (!readyToPersist) return;
    saveStoredArray(STORAGE_KEYS.submissions, submissions).catch((err) => {
      console.error("DataContext submissions cache save error:", err);
    });
  }, [submissions, readyToPersist]);

  useEffect(() => {
    if (!readyToPersist) return;
    saveStoredArray(STORAGE_KEYS.progress, progress).catch((err) => {
      console.error("DataContext progress cache save error:", err);
    });
  }, [progress, readyToPersist]);

  useEffect(() => {
    if (!readyToPersist) return;
    saveStoredArray(STORAGE_KEYS.users, users).catch((err) => {
      console.error("DataContext users cache save error:", err);
    });
  }, [users, readyToPersist]);

  const noteSyncError = (action: string, err: unknown) => {
    console.error(`DataContext ${action} sync error:`, err);
    setSyncError(`${action} saved locally but could not sync: ${describeError(err)}`);
  };

  const clearSyncError = () => {
    setSyncError(null);
  };

  // ── Courses ──────────────────────────────────────────────────────────────

  const addCourse = async (
    course: Omit<Course, "id" | "createdAt" | "enrolledStudents" | "rating">,
  ) => {
    const newCourse: Course = {
      ...course,
      id: genId(),
      createdAt: new Date().toISOString().split("T")[0],
      rating: 0,
      enrolledStudents: [],
    };
    setCourses((prev) => [...prev, newCourse]);

    try {
      const created = await api.post<Course>("/courses", newCourse);
      setCourses((prev) =>
        prev.map((c) => (c.id === newCourse.id ? created : c)),
      );
      clearSyncError();
    } catch (err) {
      noteSyncError("Course", err);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );

    try {
      const updated = await api.put<Course>(`/courses/${id}`, updates);
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      );
      clearSyncError();
    } catch (err) {
      noteSyncError("Course update", err);
    }
  };

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));

    try {
      await api.delete(`/courses/${id}`);
      clearSyncError();
    } catch (err) {
      noteSyncError("Course delete", err);
    }
  };

  const enrollInCourse = async (userId: string, courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId && !c.enrolledStudents.includes(userId)
          ? { ...c, enrolledStudents: [...c.enrolledStudents, userId] }
          : c,
      ),
    );
    setProgress((prev) => {
      const exists = prev.some((p) => p.userId === userId && p.courseId === courseId);
      return exists
        ? prev
        : [...prev, { userId, courseId, completedLessons: [], percentage: 0 }];
    });

    try {
      const updated = await api.post<Course>(`/courses/${courseId}/enroll`, {
        studentId: userId,
      });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      clearSyncError();
    } catch (err) {
      noteSyncError("Enrollment", err);
    }
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
