import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import CourseCard from "@/components/CourseCard";
import AssignmentCard from "@/components/AssignmentCard";
import StatCard from "@/components/StatCard";

export default function StudentHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, assignments, getUserProgress, getStudentSubmission } = useData();

  const enrolled = courses.filter((c) => c.enrolledStudents.includes(user!.id));
  const inProgress = enrolled.filter((c) => {
    const p = getUserProgress(user!.id, c.id);
    return !p || p.percentage < 100;
  });
  const completed = enrolled.filter((c) => {
    const p = getUserProgress(user!.id, c.id);
    return p?.percentage === 100;
  });

  const myAssignments = assignments.filter((a) => enrolled.some((c) => c.id === a.courseId));
  const pending = myAssignments.filter((a) => {
    const sub = getStudentSubmission(a.id, user!.id);
    return !sub;
  });
  const upcomingAssignments = pending.slice(0, 3);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.split(" ")[0] ?? "Student";

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#3B5BDB", "#4C6EF5", "#6C8AFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.heroName}>{firstName}</Text>
            <Text style={styles.heroSub}>Ready to learn today?</Text>
          </View>
          <View style={styles.heroAvatar}>
            <Ionicons name="person" size={26} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard label="Enrolled" value={enrolled.length} icon="book" color="#3B5BDB" />
        <StatCard label="Completed" value={completed.length} icon="checkmark-circle" color="#40C057" />
        <StatCard label="Due Soon" value={pending.length} icon="alert-circle" color="#FA5252" />
      </View>

      {inProgress.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Continue Learning</Text>
            <TouchableOpacity onPress={() => router.push("/(student)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={inProgress}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const p = getUserProgress(user!.id, item.id);
              return (
                <View style={{ width: 280, marginRight: 14 }}>
                  <CourseCard
                    course={item}
                    progress={p?.percentage ?? 0}
                    onPress={() => router.push(`/course/${item.id}`)}
                  />
                </View>
              );
            }}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          />
        </View>
      )}

      {upcomingAssignments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Assignments</Text>
            <TouchableOpacity onPress={() => router.push("/(student)/assignments")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingAssignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              submission={getStudentSubmission(a.id, user!.id)}
              onPress={() => router.push("/(student)/assignments")}
            />
          ))}
        </View>
      )}

      {enrolled.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="school-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No courses yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Browse available courses to start learning</Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(student)/courses")}
          >
            <Text style={styles.browseBtnText}>Browse Courses</Text>
          </TouchableOpacity>
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
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  heroName: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingTop: 16,
  },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  emptyState: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  browseBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
