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
import UserCard from "@/components/UserCard";

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { users, courses, assignments, submissions } = useData();

  const students = users.filter((u) => u.role === "student");
  const instructors = users.filter((u) => u.role === "instructor");
  const published = courses.filter((c) => c.isPublished);
  const pendingGrades = submissions.filter((s) => s.status === "submitted");
  const recentUsers = [...users].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 4);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#4A1882", "#7B2FBE", "#9B59B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroGreet}>System Admin</Text>
            <Text style={styles.heroName}>Control Panel</Text>
            <Text style={styles.heroSub}>Full system access</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={28} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard label="Students" value={students.length} icon="people" color="#3B5BDB" />
        <StatCard label="Instructors" value={instructors.length} icon="school" color="#0CA678" />
        <StatCard label="Courses" value={courses.length} icon="book" color="#9B59B6" />
      </View>
      <View style={[styles.statsRow, { paddingTop: 0 }]}>
        <StatCard label="Published" value={published.length} icon="checkmark-circle" color="#40C057" />
        <StatCard label="Assignments" value={assignments.length} icon="document-text" color="#FAB005" />
        <StatCard label="Submissions" value={pendingGrades.length} icon="create" color="#FA5252" subtitle={`${pendingGrades.length} pending`} />
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(admin)/users")} activeOpacity={0.85}>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Add User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#9B59B6" }]} onPress={() => router.push("/(admin)/courses")} activeOpacity={0.85}>
          <Ionicons name="book-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Manage Courses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Users</Text>
          <TouchableOpacity onPress={() => router.push("/(admin)/users")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentUsers.map((u) => (
          <UserCard key={u.id} user={u} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroGreet: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  heroName: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  heroIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 0 },
  quickActions: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 11 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  section: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
});
