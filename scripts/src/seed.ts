import {
  db,
  usersTable,
  coursesTable,
  lessonsTable,
  enrollmentsTable,
  assignmentsTable,
  submissionsTable,
  progressTable,
} from "@workspace/db";

const USERS = [
  { id: "admin-1", name: "Admin User",       email: "admin@ols.edu",  passwordHash: "admin123",  role: "admin"      as const, joinDate: "2025-01-01", isActive: true },
  { id: "inst-1",  name: "Dr. Sarah Chen",   email: "sarah@ols.edu",  passwordHash: "pass123",   role: "instructor" as const, joinDate: "2025-01-05", isActive: true },
  { id: "inst-2",  name: "Prof. James Wilson",email: "james@ols.edu", passwordHash: "pass123",   role: "instructor" as const, joinDate: "2025-01-10", isActive: true },
  { id: "stu-1",   name: "Alex Johnson",     email: "alex@ols.edu",   passwordHash: "pass123",   role: "student"    as const, joinDate: "2025-02-01", isActive: true },
  { id: "stu-2",   name: "Maria Garcia",     email: "maria@ols.edu",  passwordHash: "pass123",   role: "student"    as const, joinDate: "2025-02-05", isActive: true },
  { id: "stu-3",   name: "Liam Park",        email: "liam@ols.edu",   passwordHash: "pass123",   role: "student"    as const, joinDate: "2025-02-10", isActive: true },
];

const COURSES = [
  { id: "course-1", title: "Introduction to Python Programming", description: "Learn the fundamentals of Python programming from scratch. Cover variables, data types, loops, functions, and object-oriented programming.", instructorId: "inst-1", instructorName: "Dr. Sarah Chen", category: "Programming", level: "Beginner" as const, duration: "8 weeks", color: "#3B5BDB", rating: 4.8, isPublished: true, createdAt: "2025-01-15" },
  { id: "course-2", title: "UI/UX Design Fundamentals", description: "Master the principles of user interface and user experience design. Learn design thinking, wireframing, prototyping, and usability testing.", instructorId: "inst-2", instructorName: "Prof. James Wilson", category: "Design", level: "Beginner" as const, duration: "6 weeks", color: "#E64980", rating: 4.7, isPublished: true, createdAt: "2025-02-01" },
  { id: "course-3", title: "Data Science with R", description: "Dive into data analysis, visualization, and statistical modeling using the R programming language. Learn tidyverse, ggplot2, and machine learning basics.", instructorId: "inst-1", instructorName: "Dr. Sarah Chen", category: "Data Science", level: "Intermediate" as const, duration: "10 weeks", color: "#0CA678", rating: 4.6, isPublished: true, createdAt: "2025-01-20" },
  { id: "course-4", title: "Web Development Bootcamp", description: "A comprehensive course covering HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and deploy them to the web.", instructorId: "inst-2", instructorName: "Prof. James Wilson", category: "Web Dev", level: "Intermediate" as const, duration: "12 weeks", color: "#F76707", rating: 4.9, isPublished: true, createdAt: "2025-03-01" },
];

const LESSONS = [
  // course-1
  { id: "l1-1", courseId: "course-1", title: "Getting Started with Python",   duration: "45 min", type: "video"   as const, order: 1 },
  { id: "l1-2", courseId: "course-1", title: "Variables and Data Types",       duration: "50 min", type: "video"   as const, order: 2 },
  { id: "l1-3", courseId: "course-1", title: "Control Flow & Loops",           duration: "55 min", type: "video"   as const, order: 3 },
  { id: "l1-4", courseId: "course-1", title: "Functions and Modules",          duration: "60 min", type: "reading" as const, order: 4 },
  { id: "l1-5", courseId: "course-1", title: "Object-Oriented Programming",    duration: "70 min", type: "video"   as const, order: 5 },
  { id: "l1-6", courseId: "course-1", title: "Final Project Quiz",             duration: "30 min", type: "quiz"    as const, order: 6 },
  // course-2
  { id: "l2-1", courseId: "course-2", title: "Design Thinking Process",        duration: "40 min", type: "video"   as const, order: 1 },
  { id: "l2-2", courseId: "course-2", title: "Color Theory & Typography",      duration: "50 min", type: "video"   as const, order: 2 },
  { id: "l2-3", courseId: "course-2", title: "Wireframing Basics",             duration: "45 min", type: "reading" as const, order: 3 },
  { id: "l2-4", courseId: "course-2", title: "Prototyping with Figma",         duration: "65 min", type: "video"   as const, order: 4 },
  { id: "l2-5", courseId: "course-2", title: "Usability Testing",              duration: "50 min", type: "quiz"    as const, order: 5 },
  // course-3
  { id: "l3-1", courseId: "course-3", title: "Introduction to R",              duration: "45 min", type: "video"   as const, order: 1 },
  { id: "l3-2", courseId: "course-3", title: "Data Wrangling with tidyverse",  duration: "60 min", type: "video"   as const, order: 2 },
  { id: "l3-3", courseId: "course-3", title: "Data Visualization with ggplot2",duration: "55 min", type: "video"   as const, order: 3 },
  { id: "l3-4", courseId: "course-3", title: "Statistical Analysis",           duration: "70 min", type: "reading" as const, order: 4 },
  { id: "l3-5", courseId: "course-3", title: "Machine Learning Intro",         duration: "80 min", type: "video"   as const, order: 5 },
  { id: "l3-6", courseId: "course-3", title: "Capstone Project",               duration: "90 min", type: "quiz"    as const, order: 6 },
  // course-4
  { id: "l4-1", courseId: "course-4", title: "HTML & CSS Fundamentals",        duration: "50 min", type: "video"   as const, order: 1 },
  { id: "l4-2", courseId: "course-4", title: "JavaScript Essentials",          duration: "65 min", type: "video"   as const, order: 2 },
  { id: "l4-3", courseId: "course-4", title: "React.js Basics",                duration: "70 min", type: "video"   as const, order: 3 },
  { id: "l4-4", courseId: "course-4", title: "Backend with Node.js",           duration: "75 min", type: "reading" as const, order: 4 },
  { id: "l4-5", courseId: "course-4", title: "Databases & APIs",               duration: "60 min", type: "video"   as const, order: 5 },
  { id: "l4-6", courseId: "course-4", title: "Deployment & Best Practices",    duration: "55 min", type: "quiz"    as const, order: 6 },
];

const ENROLLMENTS = [
  { id: "enr-1", studentId: "stu-1", courseId: "course-1", enrolledAt: "2025-02-01" },
  { id: "enr-2", studentId: "stu-3", courseId: "course-1", enrolledAt: "2025-02-10" },
  { id: "enr-3", studentId: "stu-2", courseId: "course-2", enrolledAt: "2025-02-05" },
  { id: "enr-4", studentId: "stu-2", courseId: "course-3", enrolledAt: "2025-02-05" },
  { id: "enr-5", studentId: "stu-3", courseId: "course-3", enrolledAt: "2025-02-10" },
  { id: "enr-6", studentId: "stu-1", courseId: "course-4", enrolledAt: "2025-02-01" },
];

const ASSIGNMENTS = [
  { id: "asgn-1", courseId: "course-1", courseName: "Intro to Python",      title: "Build a Calculator App",     description: "Create a command-line calculator that performs basic arithmetic operations.", dueDate: "2025-06-10", maxScore: 100 },
  { id: "asgn-2", courseId: "course-1", courseName: "Intro to Python",      title: "OOP Project",                description: "Design a class hierarchy for a library management system.",               dueDate: "2025-06-25", maxScore: 100 },
  { id: "asgn-3", courseId: "course-2", courseName: "UI/UX Design",         title: "Redesign a Mobile App",      description: "Choose any existing app and create a redesign mockup in Figma.",          dueDate: "2025-06-15", maxScore: 100 },
  { id: "asgn-4", courseId: "course-3", courseName: "Data Science with R",  title: "Exploratory Data Analysis",  description: "Perform EDA on a provided dataset and present your findings.",             dueDate: "2025-06-20", maxScore: 100 },
  { id: "asgn-5", courseId: "course-4", courseName: "Web Dev Bootcamp",      title: "Build a Portfolio Site",     description: "Create a personal portfolio website using HTML, CSS, and JavaScript.",     dueDate: "2025-06-18", maxScore: 100 },
];

const SUBMISSIONS = [
  { id: "sub-1", assignmentId: "asgn-1", studentId: "stu-1", studentName: "Alex Johnson",  submittedAt: "2025-06-08", score: 92, status: "graded"    as const, answer: "Submitted calculator code" },
  { id: "sub-2", assignmentId: "asgn-4", studentId: "stu-2", studentName: "Maria Garcia",  submittedAt: "2025-06-19", score: undefined, status: "submitted" as const, answer: "EDA report attached" },
  { id: "sub-3", assignmentId: "asgn-3", studentId: "stu-2", studentName: "Maria Garcia",  submittedAt: "2025-06-14", score: 88, status: "graded"    as const, answer: "Figma link shared" },
];

const PROGRESS = [
  { id: "prog-1",  userId: "stu-1", courseId: "course-1", lessonId: "l1-1", completedAt: "2025-03-01" },
  { id: "prog-2",  userId: "stu-1", courseId: "course-1", lessonId: "l1-2", completedAt: "2025-03-02" },
  { id: "prog-3",  userId: "stu-1", courseId: "course-1", lessonId: "l1-3", completedAt: "2025-03-03" },
  { id: "prog-4",  userId: "stu-1", courseId: "course-4", lessonId: "l4-1", completedAt: "2025-03-10" },
  { id: "prog-5",  userId: "stu-2", courseId: "course-2", lessonId: "l2-1", completedAt: "2025-03-01" },
  { id: "prog-6",  userId: "stu-2", courseId: "course-2", lessonId: "l2-2", completedAt: "2025-03-02" },
  { id: "prog-7",  userId: "stu-2", courseId: "course-2", lessonId: "l2-3", completedAt: "2025-03-03" },
  { id: "prog-8",  userId: "stu-2", courseId: "course-2", lessonId: "l2-4", completedAt: "2025-03-04" },
  { id: "prog-9",  userId: "stu-2", courseId: "course-3", lessonId: "l3-1", completedAt: "2025-03-05" },
  { id: "prog-10", userId: "stu-2", courseId: "course-3", lessonId: "l3-2", completedAt: "2025-03-06" },
  { id: "prog-11", userId: "stu-3", courseId: "course-1", lessonId: "l1-1", completedAt: "2025-03-01" },
  { id: "prog-12", userId: "stu-3", courseId: "course-1", lessonId: "l1-2", completedAt: "2025-03-02" },
  { id: "prog-13", userId: "stu-3", courseId: "course-1", lessonId: "l1-3", completedAt: "2025-03-03" },
  { id: "prog-14", userId: "stu-3", courseId: "course-1", lessonId: "l1-4", completedAt: "2025-03-04" },
  { id: "prog-15", userId: "stu-3", courseId: "course-1", lessonId: "l1-5", completedAt: "2025-03-05" },
  { id: "prog-16", userId: "stu-3", courseId: "course-3", lessonId: "l3-1", completedAt: "2025-03-10" },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear all tables in dependency order
  await db.delete(progressTable);
  await db.delete(submissionsTable);
  await db.delete(assignmentsTable);
  await db.delete(enrollmentsTable);
  await db.delete(lessonsTable);
  await db.delete(coursesTable);
  await db.delete(usersTable);

  // Insert in dependency order
  await db.insert(usersTable).values(USERS);
  console.log(`  ✓ ${USERS.length} users`);

  await db.insert(coursesTable).values(COURSES);
  console.log(`  ✓ ${COURSES.length} courses`);

  await db.insert(lessonsTable).values(LESSONS);
  console.log(`  ✓ ${LESSONS.length} lessons`);

  await db.insert(enrollmentsTable).values(ENROLLMENTS);
  console.log(`  ✓ ${ENROLLMENTS.length} enrollments`);

  await db.insert(assignmentsTable).values(ASSIGNMENTS);
  console.log(`  ✓ ${ASSIGNMENTS.length} assignments`);

  const submissionsToInsert = SUBMISSIONS.map(s => ({
    ...s,
    score: s.score ?? null,
  }));
  await db.insert(submissionsTable).values(submissionsToInsert);
  console.log(`  ✓ ${SUBMISSIONS.length} submissions`);

  await db.insert(progressTable).values(PROGRESS);
  console.log(`  ✓ ${PROGRESS.length} progress records`);

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
