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
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function InstructorAssignments() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, assignments, submissions, addAssignment, deleteAssignment, gradeSubmission } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [asgTitle, setAsgTitle] = useState("");
  const [asgDesc, setAsgDesc] = useState("");
  const [dueDate, setDueDate] = useState("2025-07-01");
  const [maxScore, setMaxScore] = useState("100");
  const [gradeModal, setGradeModal] = useState<{ submissionId: string; studentName: string; max: number } | null>(null);
  const [gradeScore, setGradeScore] = useState("");

  const myCourses = courses.filter((c) => c.instructorId === user!.id);
  const myAssignments = assignments.filter((a) => myCourses.some((c) => c.id === a.courseId));

  const handleAdd = () => {
    if (!asgTitle.trim() || !selectedCourseId) {
      Alert.alert("Missing Info", "Please fill title and select a course.");
      return;
    }
    const course = myCourses.find((c) => c.id === selectedCourseId);
    addAssignment({
      courseId: selectedCourseId,
      courseName: course?.title ?? "",
      title: asgTitle.trim(),
      description: asgDesc.trim(),
      dueDate,
      maxScore: parseInt(maxScore, 10) || 100,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddModal(false);
    setAsgTitle("");
    setAsgDesc("");
    setSelectedCourseId("");
  };

  const handleGrade = () => {
    if (!gradeModal) return;
    const score = parseInt(gradeScore, 10);
    if (isNaN(score) || score < 0 || score > gradeModal.max) {
      Alert.alert("Invalid Score", `Score must be between 0 and ${gradeModal.max}`);
      return;
    }
    gradeSubmission(gradeModal.submissionId, score);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGradeModal(null);
    setGradeScore("");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Create Assignment</Text>
        </TouchableOpacity>

        {myAssignments.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No assignments yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Create assignments for your courses</Text>
          </View>
        ) : (
          myAssignments.map((a) => {
            const subs = submissions.filter((s) => s.assignmentId === a.id);
            const pending = subs.filter((s) => s.status === "submitted");
            const graded = subs.filter((s) => s.status === "graded");
            return (
              <View key={a.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{a.title}</Text>
                    <Text style={[styles.cardCourse, { color: colors.primary }]}>{a.courseName}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Alert.alert("Delete", `Delete "${a.title}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteAssignment(a.id) },
                    ])}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{a.description}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Due {a.dueDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="trophy-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{a.maxScore} pts</Text>
                  </View>
                </View>
                {subs.length > 0 && (
                  <View style={styles.subsSection}>
                    <Text style={[styles.subsTitle, { color: colors.foreground }]}>
                      Submissions: {graded.length} graded, {pending.length} pending
                    </Text>
                    {subs.map((sub) => (
                      <View key={sub.id} style={[styles.subRow, { borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.subName, { color: colors.foreground }]}>{sub.studentName}</Text>
                          <Text style={[styles.subDate, { color: colors.mutedForeground }]}>Submitted {sub.submittedAt}</Text>
                        </View>
                        {sub.status === "graded" ? (
                          <View style={[styles.scoreBadge, { backgroundColor: "#40C05718" }]}>
                            <Text style={{ color: "#40C057", fontSize: 13, fontWeight: "700" }}>
                              {sub.score}/{a.maxScore}
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.gradeBtn, { backgroundColor: colors.primary }]}
                            onPress={() => { setGradeModal({ submissionId: sub.id, studentName: sub.studentName, max: a.maxScore }); setGradeScore(""); }}
                          >
                            <Text style={styles.gradeBtnText}>Grade</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Create Assignment</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Course *</Text>
              {myCourses.map((c) => (
                <TouchableOpacity key={c.id}
                  style={[styles.courseChip, { borderColor: selectedCourseId === c.id ? colors.primary : colors.border, backgroundColor: selectedCourseId === c.id ? colors.secondary : colors.muted }]}
                  onPress={() => setSelectedCourseId(c.id)}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: selectedCourseId === c.id ? colors.primary : colors.mutedForeground }}>{c.title}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Title *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                value={asgTitle} onChangeText={setAsgTitle} placeholder="Assignment title" placeholderTextColor={colors.mutedForeground} />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 10 }]}>Description</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, height: 80, textAlignVertical: "top" }]}
                value={asgDesc} onChangeText={setAsgDesc} placeholder="Description..." placeholderTextColor={colors.mutedForeground} multiline />
              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Due Date</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Max Score</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    value={maxScore} onChangeText={setMaxScore} placeholder="100" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
                </View>
              </View>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Create Assignment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!gradeModal} animationType="fade" transparent presentationStyle="overFullScreen">
        <View style={styles.overlay}>
          <View style={[styles.gradeSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground, marginBottom: 8 }]}>
              Grade {gradeModal?.studentName}
            </Text>
            <Text style={[styles.gradeHint, { color: colors.mutedForeground }]}>
              Enter score (0 – {gradeModal?.max})
            </Text>
            <TextInput
              style={[styles.gradeInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={gradeScore}
              onChangeText={setGradeScore}
              placeholder="Score"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.gradeActions}>
              <TouchableOpacity style={[styles.gradeCancelBtn, { borderColor: colors.border }]} onPress={() => setGradeModal(null)}>
                <Text style={[styles.gradeCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.gradeSubmitBtn, { backgroundColor: colors.primary }]} onPress={handleGrade}>
                <Text style={styles.gradeSubmitText}>Save Grade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 0 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12, marginBottom: 16 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  empty: { borderRadius: 16, borderWidth: 1, padding: 40, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  cardCourse: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  subsSection: { gap: 8, marginTop: 4 },
  subsTitle: { fontSize: 13, fontWeight: "600" },
  subRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 8, gap: 10 },
  subName: { fontSize: 13, fontWeight: "500" },
  subDate: { fontSize: 11 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  gradeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  gradeBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%", paddingBottom: 32 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 12 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  fieldLabel: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 2 },
  courseChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  gradeSheet: { margin: 24, borderRadius: 20, padding: 24, gap: 12, alignSelf: "center", width: "90%", position: "absolute", top: "35%", left: "5%" },
  gradeHint: { fontSize: 13 },
  gradeInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 24, fontWeight: "700", textAlign: "center" },
  gradeActions: { flexDirection: "row", gap: 10 },
  gradeCancelBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  gradeCancelText: { fontSize: 15, fontWeight: "600" },
  gradeSubmitBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  gradeSubmitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
