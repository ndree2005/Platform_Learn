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
import { useData, type AppUser } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import UserCard from "@/components/UserCard";
import SearchBar from "@/components/SearchBar";

type RoleFilter = "all" | "student" | "instructor" | "admin";
type UserRole = "student" | "instructor" | "admin";

export default function AdminUsers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { users, addUser, deleteUser } = useData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("student");

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts: Record<RoleFilter, number> = {
    all: users.length,
    student: users.filter((u) => u.role === "student").length,
    instructor: users.filter((u) => u.role === "instructor").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert("Missing Info", "Name and email are required.");
      return;
    }
    addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      isActive: true,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setNewName("");
    setNewEmail("");
    setNewRole("student");
  };

  const handleDelete = (u: AppUser) => {
    Alert.alert("Delete User", `Remove "${u.name}" from the system?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteUser(u.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const ROLES: RoleFilter[] = ["all", "student", "instructor", "admin"];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search users..."
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.chip,
              {
                borderColor: colors.border,
                backgroundColor:
                  roleFilter === r ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setRoleFilter(r)}
          >
            <Text
              style={[
                styles.chipText,
                { color: roleFilter === r ? "#fff" : colors.mutedForeground },
              ]}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)} ({counts[r]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No users found
            </Text>
          </View>
        ) : (
          filtered.map((u) => (
            <UserCard key={u.id} user={u} onDelete={() => handleDelete(u)} />
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                Add User
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text
                style={[styles.fieldLabel, { color: colors.mutedForeground }]}
              >
                Full Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.field}>
              <Text
                style={[styles.fieldLabel, { color: colors.mutedForeground }]}
              >
                Email *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="user@email.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.field}>
              <Text
                style={[styles.fieldLabel, { color: colors.mutedForeground }]}
              >
                Role
              </Text>
              <View style={styles.roleRow}>
                {(["student", "instructor", "admin"] as UserRole[]).map((r) => {
                  const roleColors: Record<UserRole, string> = {
                    student: "#0CA678",
                    instructor: "#3B5BDB",
                    admin: "#9B59B6",
                  };
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleChip,
                        {
                          borderColor:
                            newRole === r ? roleColors[r] : colors.border,
                          backgroundColor:
                            newRole === r ? roleColors[r] + "18" : colors.muted,
                        },
                      ]}
                      onPress={() => setNewRole(r)}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            newRole === r
                              ? roleColors[r]
                              : colors.mutedForeground,
                          textTransform: "capitalize",
                        }}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.saveBtnText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 4 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterScroll: { maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  content: { padding: 16 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 14 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  field: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: "500" },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  roleRow: { flexDirection: "row", gap: 10 },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
