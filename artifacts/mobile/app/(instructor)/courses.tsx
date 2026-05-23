import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import CourseCard from "@/components/CourseCard";

const CATEGORIES = ["Programming", "Design", "Data Science", "Web Dev", "Mathematics", "Science"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COURSE_COLORS = ["#3B5BDB", "#E64980", "#0CA678", "#F76707", "#9B59B6", "#1098AD"];

export default function InstructorCourses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, addCourse, updateCourse, deleteCourse } = useData();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Beginner");
  const [duration, setDuration] = useState("8 weeks");
  const [selectedColor, setSelectedColor] = useState(COURSE_COLORS[0]);

  const myCourses = courses.filter((c) => c.instructorId === user!.id);

  const handleAdd = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Info", "Please fill in title and description.");
      return;
    }
    addCourse({
      title: title.trim(),
      description: description.trim(),
      instructorId: user!.id,
      instructorName: user!.name,
      category,
      level,
      duration,
      color: selectedColor,
      lessons: [],
      isPublished: false,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setTitle("");
    setDescription("");
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Course", `Delete "${title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteCourse(id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
    ]);
  };

  const togglePublish = (id: string, current: boolean) => {
    updateCourse(id, { isPublished: !current });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Create New Course</Text>
        </TouchableOpacity>

        {myCourses.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No courses yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Create your first course to get started</Text>
          </View>
        ) : (
          myCourses.map((course) => (
            <View key={course.id}>
              <CourseCard
                course={course}
                onPress={() => router.push(`/course/${course.id}`)}
              />
              <View style={[styles.courseActions, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.publishRow}>
                  <Text style={[styles.publishLabel, { color: colors.foreground }]}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Text>
                  <Switch
                    value={course.isPublished}
                    onValueChange={() => togglePublish(course.id, course.isPublished)}
                    trackColor={{ false: colors.muted, true: colors.primary + "80" }}
                    thumbColor={course.isPublished ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDelete(course.id, course.title)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                  <Text style={[styles.deleteText, { color: colors.destructive }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Create Course</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Title *</Text>
                <TextInput style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  value={title} onChangeText={setTitle} placeholder="Course title" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description *</Text>
                <TextInput style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, height: 80, textAlignVertical: "top" }]}
                  value={description} onChangeText={setDescription} placeholder="Course description" placeholderTextColor={colors.mutedForeground} multiline />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {CATEGORIES.map((c) => (
                      <TouchableOpacity key={c}
                        style={[styles.chip, { borderColor: category === c ? colors.primary : colors.border, backgroundColor: category === c ? colors.secondary : colors.muted }]}
                        onPress={() => setCategory(c)}>
                        <Text style={{ fontSize: 13, color: category === c ? colors.primary : colors.mutedForeground, fontWeight: "600" }}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Level</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  {LEVELS.map((l) => (
                    <TouchableOpacity key={l}
                      style={[styles.chip, { borderColor: level === l ? colors.primary : colors.border, backgroundColor: level === l ? colors.secondary : colors.muted }]}
                      onPress={() => setLevel(l)}>
                      <Text style={{ fontSize: 13, color: level === l ? colors.primary : colors.mutedForeground, fontWeight: "600" }}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Duration</Text>
                <TextInput style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  value={duration} onChangeText={setDuration} placeholder="e.g. 8 weeks" placeholderTextColor={colors.mutedForeground} />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Color</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                  {COURSE_COLORS.map((c) => (
                    <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: "#fff", shadowOpacity: selectedColor === c ? 0.4 : 0 }]}
                      onPress={() => setSelectedColor(c)} />
                  ))}
                </View>
              </View>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Create Course</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 0 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  empty: { borderRadius: 16, borderWidth: 1, padding: 40, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", color: "#868E96" },
  courseActions: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: -10,
    marginBottom: 14,
  },
  publishRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  publishLabel: { fontSize: 13, fontWeight: "500" },
  separator: { width: 1, height: 20, marginHorizontal: 12 },
  deleteAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteText: { fontSize: 13, fontWeight: "500" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%", paddingBottom: 32 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 12 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  formField: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  colorDot: { width: 32, height: 32, borderRadius: 16, shadowColor: "#000", shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
