import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { type Course } from "@/context/DataContext";

type CourseComboboxProps = {
  courses: Course[];
  isOpen: boolean;
  query: string;
  selectedCourseId: string;
  onOpenChange: (isOpen: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelect: (course: Course) => void;
};

export function CourseCombobox({
  courses,
  isOpen,
  query,
  selectedCourseId,
  onOpenChange,
  onQueryChange,
  onSelect,
}: CourseComboboxProps) {
  const colors = useColors();
  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCourses = normalizedQuery
    ? courses.filter((course) => {
        const searchableText = [
          course.title,
          course.category,
          course.level,
          course.description,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
    : courses;
  const visibleCourses = filteredCourses.slice(0, 8);

  return (
    <View style={styles.comboContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpenChange(true)}
        style={[
          styles.comboInputWrap,
          {
            backgroundColor: colors.muted,
            borderColor: isOpen ? colors.primary : colors.border,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={isOpen ? colors.primary : colors.mutedForeground}
        />
        <TextInput
          style={[styles.comboInput, { color: colors.foreground }]}
          value={isOpen ? query : (selectedCourse?.title ?? query)}
          onChangeText={(value) => {
            onQueryChange(value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          placeholder="Search course by title, category, or level"
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="search"
        />
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {selectedCourse && !isOpen && (
        <View
          style={[
            styles.selectedCoursePill,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={[styles.selectedCourseText, { color: colors.primary }]}>
            {selectedCourse.title}
          </Text>
        </View>
      )}

      {isOpen && (
        <View
          style={[
            styles.comboMenu,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {visibleCourses.length === 0 ? (
            <Text
              style={[styles.comboEmpty, { color: colors.mutedForeground }]}
            >
              No courses match your search
            </Text>
          ) : (
            visibleCourses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.comboOption,
                    {
                      backgroundColor: isSelected
                        ? colors.secondary
                        : colors.card,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => onSelect(course)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.comboOptionTitle,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={1}
                    >
                      {course.title}
                    </Text>
                    <Text
                      style={[
                        styles.comboOptionMeta,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={1}
                    >
                      {course.category} - {course.level}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
          {filteredCourses.length > visibleCourses.length && (
            <Text style={[styles.comboHint, { color: colors.mutedForeground }]}>
              Keep typing to narrow {filteredCourses.length} matches
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  comboContainer: { marginBottom: 8 },
  comboInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  comboInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  selectedCoursePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  selectedCourseText: {
    fontSize: 13,
    fontWeight: "600",
  },
  comboMenu: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 300,
  },
  comboEmpty: {
    padding: 12,
    fontSize: 13,
    textAlign: "center",
  },
  comboOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comboOptionTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  comboOptionMeta: {
    fontSize: 12,
  },
  comboHint: {
    padding: 8,
    fontSize: 11,
    textAlign: "center",
    fontStyle: "italic",
  },
});
