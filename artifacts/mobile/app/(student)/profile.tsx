import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import ProgressBar from "@/components/ProgressBar";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function StudentProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { courses, assignments, getUserProgress, getStudentSubmission } = useData();

  const enrolled = courses.filter((c) => c.enrolledStudents.includes(user!.id));
  const completed = enrolled.filter((c) => getUserProgress(user!.id, c.id)?.percentage === 100);
  const myAssignments = assignments.filter((a) => enrolled.some((c) => c.id === a.courseId));
  const graded = myAssignments.filter((a) => getStudentSubmission(a.id, user!.id)?.status === "graded");
  const avgScore = graded.length
    ? Math.round(graded.reduce((sum, a) => sum + (getStudentSubmission(a.id, user!.id)?.score ?? 0), 0) / graded.length)
    : null;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#3B5BDB", "#4C6EF5"]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.initials}>{getInitials(user?.name ?? "")}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge]}>
          <Ionicons name="person" size={12} color="#3B5BDB" />
          <Text style={styles.roleText}>Student</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: "#3B5BDB" }]}>{enrolled.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Enrolled</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: "#40C057" }]}>{completed.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: "#FAB005" }]}>{avgScore ?? "—"}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg Score</Text>
        </View>
      </View>

      {enrolled.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Course Progress</Text>
          {enrolled.map((c) => {
            const p = getUserProgress(user!.id, c.id);
            return (
              <View key={c.id} style={styles.progressItem}>
                <Text style={[styles.progressName, { color: colors.foreground }]} numberOfLines={1}>{c.title}</Text>
                <View style={styles.progressRow}>
                  <ProgressBar progress={p?.percentage ?? 0} color={c.color} />
                  <Text style={[styles.pct, { color: c.color }]}>{p?.percentage ?? 0}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "33" }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
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
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  progressItem: { gap: 6 },
  progressName: { fontSize: 13, fontWeight: "500" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pct: { fontSize: 12, fontWeight: "700", minWidth: 32, textAlign: "right" },
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
