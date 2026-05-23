import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import StatCard from "@/components/StatCard";
import AssignmentCard from "@/components/AssignmentCard";

export default function InstructorDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, assignments, submissions } = useData();

  const myCourses = courses.filter((c) => c.instructorId === user!.id);
  const myAssignmentIds = assignments.filter((a) => myCourses.some((c) => c.id === a.courseId)).map((a) => a.id);
  const pendingGrades = submissions.filter((s) => myAssignmentIds.includes(s.assignmentId) && s.status === "submitted");
  const totalStudents = new Set(myCourses.flatMap((c) => c.enrolledStudents)).size;
  const recentAssignments = assignments.filter((a) => myCourses.some((c) => c.id === a.courseId)).slice(0, 3);
  const firstName = user?.name.split(" ")[0] ?? "Instructor";

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1C3A99", "#3B5BDB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroGreet}>Welcome back,</Text>
            <Text style={styles.heroName}>{firstName}</Text>
            <Text style={styles.heroSub}>Instructor Dashboard</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={28} color="#fff" />
          </View>
        </View>
        {pendingGrades.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="notifications" size={16} color="#FAB005" />
            <Text style={styles.alertText}>{pendingGrades.length} submission{pendingGrades.length > 1 ? "s" : ""} pending review</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard label="Students" value={totalStudents} icon="people" color="#3B5BDB" />
        <StatCard label="Courses" value={myCourses.length} icon="layers" color="#0CA678" />
        <StatCard label="To Grade" value={pendingGrades.length} icon="create" color="#FAB005" />
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(instructor)/courses")}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Add Course</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#0CA678" }]}
          onPress={() => router.push("/(instructor)/assignments")}
          activeOpacity={0.85}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Add Assignment</Text>
        </TouchableOpacity>
      </View>

      {myCourses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Courses</Text>
            <TouchableOpacity onPress={() => router.push("/(instructor)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {myCourses.slice(0, 3).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.courseRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/course/${c.id}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.courseColorDot, { backgroundColor: c.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={1}>{c.title}</Text>
                <Text style={[styles.courseMeta, { color: colors.mutedForeground }]}>
                  {c.enrolledStudents.length} students · {c.lessons.length} lessons
                </Text>
              </View>
              <View style={[styles.publishBadge, { backgroundColor: c.isPublished ? "#40C05718" : "#FA525218" }]}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: c.isPublished ? "#40C057" : "#FA5252" }}>
                  {c.isPublished ? "Live" : "Draft"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {recentAssignments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Assignments</Text>
            <TouchableOpacity onPress={() => router.push("/(instructor)/assignments")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentAssignments.map((a) => {
            const subs = submissions.filter((s) => s.assignmentId === a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.asgRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(instructor)/assignments")}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.asgTitle, { color: colors.foreground }]} numberOfLines={1}>{a.title}</Text>
                  <Text style={[styles.asgMeta, { color: colors.mutedForeground }]}>Due {a.dueDate}</Text>
                </View>
                <View style={[styles.subBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.subBadgeText, { color: colors.primary }]}>{subs.length} submissions</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroGreet: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  heroName: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(250,176,5,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(250,176,5,0.3)",
  },
  alertText: { color: "#FAB005", fontSize: 13, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  courseColorDot: { width: 10, height: 10, borderRadius: 5 },
  courseTitle: { fontSize: 14, fontWeight: "600" },
  courseMeta: { fontSize: 12, marginTop: 2 },
  publishBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  asgRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  asgTitle: { fontSize: 14, fontWeight: "600" },
  asgMeta: { fontSize: 12, marginTop: 2 },
  subBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subBadgeText: { fontSize: 12, fontWeight: "600" },
});
