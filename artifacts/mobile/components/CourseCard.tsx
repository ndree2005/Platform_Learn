import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Course } from "@/context/DataContext";
import ProgressBar from "./ProgressBar";

interface Props {
  course: Course;
  progress?: number;
  onPress: () => void;
  variant?: "default" | "compact";
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Programming: "code-slash",
  Design: "color-palette",
  "Data Science": "bar-chart",
  "Web Dev": "globe",
  Mathematics: "calculator",
  Science: "flask",
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#40C057",
  Intermediate: "#FAB005",
  Advanced: "#FA5252",
};

export default function CourseCard({ course, progress, onPress, variant = "default" }: Props) {
  const colors = useColors();

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.compactIcon, { backgroundColor: course.color + "22" }]}>
          <Ionicons name={CATEGORY_ICONS[course.category] ?? "book"} size={22} color={course.color} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>{course.title}</Text>
          <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>{course.instructorName}</Text>
          {progress !== undefined && (
            <View style={styles.progressRow}>
              <ProgressBar progress={progress} color={course.color} height={4} />
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{progress}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.banner, { backgroundColor: course.color + "22" }]}>
        <View style={[styles.iconBadge, { backgroundColor: course.color }]}>
          <Ionicons name={CATEGORY_ICONS[course.category] ?? "book"} size={28} color="#fff" />
        </View>
        <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[course.level] + "22" }]}>
          <Text style={[styles.levelText, { color: LEVEL_COLORS[course.level] }]}>{course.level}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.category, { color: course.color }]}>{course.category}</Text>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{course.title}</Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]} numberOfLines={1}>
          {course.instructorName}
        </Text>
        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {course.enrolledStudents.length} students
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.duration}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FAB005" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{course.rating > 0 ? course.rating : "New"}</Text>
          </View>
        </View>
        {progress !== undefined && (
          <View style={{ marginTop: 10 }}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Progress</Text>
              <Text style={[styles.progressPct, { color: course.color }]}>{progress}%</Text>
            </View>
            <ProgressBar progress={progress} color={course.color} height={6} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  banner: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "600",
  },
  body: {
    padding: 14,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: "auto",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: "700",
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  compactIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  compactMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 28,
  },
});
