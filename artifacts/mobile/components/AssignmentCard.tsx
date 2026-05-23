import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Assignment, Submission } from "@/context/DataContext";

interface Props {
  assignment: Assignment;
  submission?: Submission;
  onPress?: () => void;
  showCourse?: boolean;
}

export default function AssignmentCard({ assignment, submission, onPress, showCourse = true }: Props) {
  const colors = useColors();

  const isOverdue = !submission && new Date(assignment.dueDate) < new Date();
  const statusColor = submission?.status === "graded"
    ? colors.success
    : submission?.status === "submitted"
    ? "#4C6EF5"
    : isOverdue
    ? colors.destructive
    : colors.warning;

  const statusLabel = submission?.status === "graded"
    ? `Graded: ${submission.score}/${assignment.maxScore}`
    : submission?.status === "submitted"
    ? "Submitted"
    : isOverdue
    ? "Overdue"
    : "Pending";

  const statusIcon: keyof typeof Ionicons.glyphMap = submission?.status === "graded"
    ? "checkmark-circle"
    : submission?.status === "submitted"
    ? "time"
    : isOverdue
    ? "alert-circle"
    : "ellipse-outline";

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{assignment.title}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "18" }]}>
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {showCourse && (
          <Text style={[styles.course, { color: colors.primary }]}>{assignment.courseName}</Text>
        )}
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{assignment.description}</Text>
        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.due, { color: isOverdue && !submission ? colors.destructive : colors.mutedForeground }]}>
            Due {assignment.dueDate}
          </Text>
          <View style={styles.score}>
            <Ionicons name="trophy-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.scoreText, { color: colors.mutedForeground }]}>{assignment.maxScore} pts</Text>
          </View>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statusDot: {
    width: 4,
    borderRadius: 2,
    alignSelf: "stretch",
  },
  content: { flex: 1, gap: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  course: {
    fontSize: 12,
    fontWeight: "600",
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  due: {
    fontSize: 12,
    flex: 1,
  },
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scoreText: {
    fontSize: 12,
  },
});
