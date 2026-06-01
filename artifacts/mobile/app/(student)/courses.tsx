import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import CourseCard from "@/components/CourseCard";
import SearchBar from "@/components/SearchBar";

export default function StudentCourses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, enrollInCourse, getUserProgress } = useData();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"enrolled" | "explore">("enrolled");

  const enrolled = courses.filter((c) => c.enrolledStudents.includes(user!.id));
  const available = courses.filter(
    (c) => !c.enrolledStudents.includes(user!.id) && c.isPublished,
  );

  const filter = (list: typeof courses) =>
    list.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(search.toLowerCase()),
    );

  const display = tab === "enrolled" ? filter(enrolled) : filter(available);

  const handleEnroll = (courseId: string, courseTitle: string) => {
    Alert.alert("Enroll in Course", `Join "${courseTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Enroll",
        onPress: () => {
          enrollInCourse(user!.id, courseId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      <View style={styles.searchRow}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search courses..."
        />
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
        {(["enrolled", "explore"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tabBtn,
              tab === t && { backgroundColor: colors.card },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t === "enrolled"
                ? `My Courses (${enrolled.length})`
                : `Explore (${available.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.list}>
        {display.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={40}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search
                ? "No courses match your search"
                : tab === "enrolled"
                  ? "Not enrolled in any courses yet"
                  : "No available courses"}
            </Text>
          </View>
        ) : (
          display.map((course) => {
            const p = getUserProgress(user!.id, course.id);
            const isEnrolled = course.enrolledStudents.includes(user!.id);
            return (
              <View key={course.id}>
                <CourseCard
                  course={course}
                  progress={isEnrolled ? (p?.percentage ?? 0) : undefined}
                  onPress={() => {
                    if (isEnrolled) {
                      router.push(`/course/${course.id}`);
                    } else {
                      handleEnroll(course.id, course.title);
                    }
                  }}
                />
                {!isEnrolled && (
                  <TouchableOpacity
                    style={[
                      styles.enrollBtn,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleEnroll(course.id, course.title)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.enrollBtnText}>Enroll Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 16 },
  searchRow: {},
  tabRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  list: { gap: 0 },
  empty: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  enrollBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: -8,
    marginBottom: 14,
  },
  enrollBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
