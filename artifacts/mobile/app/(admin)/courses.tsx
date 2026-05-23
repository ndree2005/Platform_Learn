import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import SearchBar from "@/components/SearchBar";

export default function AdminCourses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, updateCourse, deleteCourse } = useData();
  const [search, setSearch] = useState("");

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Course", `Delete "${title}"? All enrollments and assignments will be lost.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => { deleteCourse(id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); },
      },
    ]);
  };

  const togglePublish = (id: string, current: boolean) => {
    updateCourse(id, { isPublished: !current });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    Programming: "#3B5BDB",
    Design: "#E64980",
    "Data Science": "#0CA678",
    "Web Dev": "#F76707",
    Mathematics: "#9B59B6",
    Science: "#1098AD",
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search courses..." />
      <View style={styles.summary}>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} · {courses.filter((c) => c.isPublished).length} published
        </Text>
      </View>
      {filtered.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No courses found</Text>
        </View>
      ) : (
        filtered.map((course) => (
          <View key={course.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardAccent, { backgroundColor: course.color }]} />
            <View style={styles.cardBody}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/course/${course.id}`)} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                  <View style={[styles.catBadge, { backgroundColor: (CATEGORY_COLORS[course.category] ?? "#3B5BDB") + "18" }]}>
                    <Text style={[styles.catText, { color: CATEGORY_COLORS[course.category] ?? "#3B5BDB" }]}>{course.category}</Text>
                  </View>
                  <Text style={[styles.levelText, { color: colors.mutedForeground }]}>{course.level}</Text>
                </View>
                <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={2}>{course.title}</Text>
                <Text style={[styles.instructorName, { color: colors.primary }]}>{course.instructorName}</Text>
                <View style={styles.courseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.enrolledStudents.length} enrolled</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="book-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.lessons.length} lessons</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{course.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
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
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: colors.destructive + "12" }]}
                  onPress={() => handleDelete(course.id, course.title)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12 },
  summary: { alignItems: "flex-end" },
  summaryText: { fontSize: 12 },
  empty: { borderRadius: 16, borderWidth: 1, padding: 40, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden", flexDirection: "row" },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: "700" },
  levelText: { fontSize: 11 },
  courseTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20, marginBottom: 3 },
  instructorName: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  courseMeta: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11 },
  cardActions: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  publishRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  publishLabel: { fontSize: 13, fontWeight: "500" },
  deleteBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
