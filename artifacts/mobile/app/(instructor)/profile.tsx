import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function InstructorProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { courses, assignments, submissions } = useData();

  const myCourses = courses.filter((c) => c.instructorId === user!.id);
  const myAssignmentIds = assignments
    .filter((a) => myCourses.some((c) => c.id === a.courseId))
    .map((a) => a.id);
  const totalStudents = new Set(myCourses.flatMap((c) => c.enrolledStudents))
    .size;
  const totalSubmissions = submissions.filter((s) =>
    myAssignmentIds.includes(s.assignmentId),
  ).length;
  const graded = submissions.filter(
    (s) => myAssignmentIds.includes(s.assignmentId) && s.status === "graded",
  ).length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1C3A99", "#3B5BDB"]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.initials}>{getInitials(user?.name ?? "")}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="school" size={12} color="#3B5BDB" />
          <Text style={styles.roleText}>Instructor</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: "#3B5BDB" }]}>
            {myCourses.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Courses
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: "#0CA678" }]}>
            {totalStudents}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Students
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statValue, { color: "#FAB005" }]}>
            {totalSubmissions}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Submissions
          </Text>
        </View>
      </View>

      {myCourses.length > 0 && (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            My Courses
          </Text>
          {myCourses.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.courseRow, { borderColor: colors.border }]}
              onPress={() => router.push(`/course/${c.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.courseDot, { backgroundColor: c.color }]} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.courseTitle, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {c.title}
                </Text>
                <Text
                  style={[styles.courseMeta, { color: colors.mutedForeground }]}
                >
                  {c.enrolledStudents.length} students
                </Text>
              </View>
              <View
                style={[
                  styles.pubBadge,
                  {
                    backgroundColor: c.isPublished ? "#40C05718" : "#FA525218",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: c.isPublished ? "#40C057" : "#FA5252",
                  }}
                >
                  {c.isPublished ? "Live" : "Draft"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.logoutBtn,
          {
            backgroundColor: colors.destructive + "12",
            borderColor: colors.destructive + "33",
          },
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  initials: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { color: "#fff", fontSize: 22, fontWeight: "700" },
  email: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  roleText: { color: "#3B5BDB", fontSize: 12, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, padding: 16 },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  courseDot: { width: 10, height: 10, borderRadius: 5 },
  courseTitle: { fontSize: 13, fontWeight: "600" },
  courseMeta: { fontSize: 12, marginTop: 1 },
  pubBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  logoutBtn: {
    margin: 16,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
