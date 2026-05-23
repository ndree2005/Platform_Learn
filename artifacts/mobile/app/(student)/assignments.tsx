import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData, type Assignment } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import AssignmentCard from "@/components/AssignmentCard";

type Filter = "all" | "pending" | "submitted" | "graded";

export default function StudentAssignments() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, assignments, getStudentSubmission, submitAssignment } = useData();
  const [filter, setFilter] = useState<Filter>("all");
  const [submitModal, setSubmitModal] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState("");

  const enrolled = courses.filter((c) => c.enrolledStudents.includes(user!.id));
  const myAssignments = assignments.filter((a) => enrolled.some((c) => c.id === a.courseId));

  const filtered = myAssignments.filter((a) => {
    const sub = getStudentSubmission(a.id, user!.id);
    if (filter === "pending") return !sub;
    if (filter === "submitted") return sub?.status === "submitted";
    if (filter === "graded") return sub?.status === "graded";
    return true;
  });

  const counts = {
    all: myAssignments.length,
    pending: myAssignments.filter((a) => !getStudentSubmission(a.id, user!.id)).length,
    submitted: myAssignments.filter((a) => getStudentSubmission(a.id, user!.id)?.status === "submitted").length,
    graded: myAssignments.filter((a) => getStudentSubmission(a.id, user!.id)?.status === "graded").length,
  };

  const handleSubmit = () => {
    if (!submitModal || !answer.trim()) {
      Alert.alert("Empty Answer", "Please write your answer before submitting.");
      return;
    }
    submitAssignment(submitModal.id, user!.id, user!.name, answer.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitModal(null);
    setAnswer("");
  };

  const FILTERS: Filter[] = ["all", "pending", "submitted", "graded"];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              { borderColor: colors.border, backgroundColor: filter === f ? colors.primary : colors.card },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.mutedForeground }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {filter === "pending" ? "All caught up!" : "No assignments here"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "pending" ? "No pending assignments." : "Nothing to show for this filter."}
            </Text>
          </View>
        ) : (
          filtered.map((a) => {
            const sub = getStudentSubmission(a.id, user!.id);
            return (
              <AssignmentCard
                key={a.id}
                assignment={a}
                submission={sub}
                onPress={!sub ? () => setSubmitModal(a) : undefined}
              />
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!submitModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
                {submitModal?.title}
              </Text>
              <TouchableOpacity onPress={() => { setSubmitModal(null); setAnswer(""); }}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>{submitModal?.description}</Text>
            <Text style={[styles.answerLabel, { color: colors.foreground }]}>Your Answer</Text>
            <TextInput
              style={[styles.answerInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Write your answer here..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterScroll: { maxHeight: 52 },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  content: { padding: 16, gap: 0 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  modalDesc: { fontSize: 14, lineHeight: 20 },
  answerLabel: { fontSize: 14, fontWeight: "600" },
  answerInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    lineHeight: 22,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
