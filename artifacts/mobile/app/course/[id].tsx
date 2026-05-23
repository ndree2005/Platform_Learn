import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import ProgressBar from "@/components/ProgressBar";

const LESSON_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  video: "play-circle",
  reading: "document-text",
  quiz: "help-circle",
};

const LESSON_TYPE_COLOR: Record<string, string> = {
  video: "#3B5BDB",
  reading: "#0CA678",
  quiz: "#FAB005",
};

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, enrollInCourse, updateProgress, getUserProgress } = useData();

  const course = courses.find((c) => c.id === id);
  if (!course) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEnrolled = user ? course.enrolledStudents.includes(user.id) : false;
  const progressData = user ? getUserProgress(user.id, course.id) : undefined;
  const completedLessons = progressData?.completedLessons ?? [];

  const handleMarkComplete = (lessonId: string, lessonTitle: string) => {
    if (!user || user.role !== "student") return;
    if (completedLessons.includes(lessonId)) return;
    updateProgress(user.id, course.id, lessonId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEnroll = () => {
    if (!user) return;
    Alert.alert("Enroll", `Join "${course.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Enroll",
        onPress: () => {
          enrollInCourse(user.id, course.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.banner, { backgroundColor: course.color + "18" }]}>
        <View style={[styles.iconWrap, { backgroundColor: course.color }]}>
          <Ionicons name="book" size={36} color="#fff" />
        </View>
        <View style={[styles.levelPill, { backgroundColor: course.color + "22" }]}>
          <Text style={[styles.levelPillText, { color: course.color }]}>{course.level}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.category, { color: course.color }]}>{course.category}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{course.title}</Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]}>by {course.instructorName}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{course.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.enrolledStudents.length} students</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{sortedLessons.length} lessons</Text>
          </View>
          {course.rating > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FAB005" />
              <Text style={[styles.metaText, { color: colors.foreground, fontWeight: "600" }]}>{course.rating}</Text>
            </View>
          )}
        </View>

        {isEnrolled && progressData && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.foreground }]}>Your Progress</Text>
              <Text style={[styles.progressPct, { color: course.color }]}>{progressData.percentage}%</Text>
            </View>
            <ProgressBar progress={progressData.percentage} color={course.color} height={8} />
            <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
              {completedLessons.length} of {sortedLessons.length} lessons completed
            </Text>
          </View>
        )}

        {!isEnrolled && user?.role === "student" && (
          <TouchableOpacity style={[styles.enrollBtn, { backgroundColor: course.color }]} onPress={handleEnroll}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.enrollBtnText}>Enroll in Course</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.lessonsSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Course Content
        </Text>
        {sortedLessons.length === 0 ? (
          <View style={[styles.emptyLessons, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="document-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lessons added yet</Text>
          </View>
        ) : (
          sortedLessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const canComplete = isEnrolled && user?.role === "student" && !isCompleted;
            const typeColor = LESSON_TYPE_COLOR[lesson.type] ?? "#3B5BDB";
            const typeIcon = LESSON_TYPE_ICON[lesson.type] ?? "document";
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isCompleted && { borderColor: "#40C05730", backgroundColor: "#40C05708" },
                ]}
                onPress={() => canComplete && handleMarkComplete(lesson.id, lesson.title)}
                activeOpacity={canComplete ? 0.75 : 1}
              >
                <View style={[styles.lessonNum, { backgroundColor: isCompleted ? "#40C057" : colors.muted }]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.lessonNumText, { color: colors.mutedForeground }]}>{index + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lessonTitle, { color: isCompleted ? "#40C057" : colors.foreground }]}>{lesson.title}</Text>
                  <View style={styles.lessonMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor + "18" }]}>
                      <Ionicons name={typeIcon} size={11} color={typeColor} />
                      <Text style={[styles.typeText, { color: typeColor }]}>{lesson.type}</Text>
                    </View>
                    <Text style={[styles.lessonDuration, { color: colors.mutedForeground }]}>{lesson.duration}</Text>
                  </View>
                </View>
                {canComplete && (
                  <View style={[styles.markBtn, { backgroundColor: course.color + "18" }]}>
                    <Text style={[styles.markBtnText, { color: course.color }]}>Done</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  banner: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  levelPill: {
    position: "absolute",
    top: 12,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelPillText: { fontSize: 12, fontWeight: "600" },
  info: { padding: 16, gap: 10 },
  category: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  instructor: { fontSize: 14 },
  description: { fontSize: 14, lineHeight: 22 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 14, fontWeight: "600" },
  progressPct: { fontSize: 14, fontWeight: "700" },
  progressSub: { fontSize: 12 },
  enrollBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
  },
  enrollBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  lessonsSection: { padding: 16, paddingTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyLessons: { borderRadius: 14, borderWidth: 1, padding: 32, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  lessonNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumText: { fontSize: 13, fontWeight: "700" },
  lessonTitle: { fontSize: 14, fontWeight: "600", lineHeight: 18 },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: { fontSize: 11, fontWeight: "600" },
  lessonDuration: { fontSize: 11 },
  markBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  markBtnText: { fontSize: 12, fontWeight: "700" },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontWeight: "600" },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});
