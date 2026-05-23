import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { users, courses, assignments, submissions } = useData();
  const [allowEnrollment, setAllowEnrollment] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will clear all stored data and reset to factory defaults. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await AsyncStorage.multiRemove([
              "@ols_courses",
              "@ols_assignments",
              "@ols_submissions",
              "@ols_progress",
              "@ols_users",
              "@auth_user",
            ]);
            Alert.alert("Reset Complete", "Data has been cleared. The app will restart.", [
              { text: "OK", onPress: () => router.replace("/(auth)/login") },
            ]);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const SYSTEM_STATS = [
    { label: "Total Users", value: users.length, icon: "people" as const, color: "#3B5BDB" },
    { label: "Total Courses", value: courses.length, icon: "book" as const, color: "#9B59B6" },
    { label: "Total Assignments", value: assignments.length, icon: "document-text" as const, color: "#FAB005" },
    { label: "Total Submissions", value: submissions.length, icon: "create" as const, color: "#0CA678" },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#4A1882", "#7B2FBE"]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Ionicons name="settings" size={32} color="rgba(255,255,255,0.3)" style={styles.headerBgIcon} />
        <Text style={styles.headerTitle}>System Settings</Text>
        <Text style={styles.headerSub}>Configure your platform</Text>
      </LinearGradient>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>System Overview</Text>
        <View style={styles.statsGrid}>
          {SYSTEM_STATS.map((stat) => (
            <View key={stat.label} style={[styles.statItem, { backgroundColor: stat.color + "12" }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Platform Controls</Text>
        {[
          { label: "Allow Student Enrollment", sub: "Students can enroll in new courses", value: allowEnrollment, setter: setAllowEnrollment, color: "#0CA678" },
          { label: "Maintenance Mode", sub: "Temporarily restrict access to the platform", value: maintenanceMode, setter: setMaintenanceMode, color: "#FA5252" },
          { label: "Email Notifications", sub: "Send notifications for assignments and grades", value: emailNotifications, setter: setEmailNotifications, color: "#3B5BDB" },
        ].map((item, i) => (
          <View key={item.label} style={[styles.settingRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={(v) => { item.setter(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ false: colors.muted, true: item.color + "80" }}
              thumbColor={item.value ? item.color : colors.mutedForeground}
            />
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Data Management</Text>
        <TouchableOpacity
          style={[styles.actionRow, { borderColor: colors.border }]}
          onPress={handleResetData}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.destructive + "12" }]}>
            <Ionicons name="refresh" size={18} color={colors.destructive} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionLabel, { color: colors.destructive }]}>Reset All Data</Text>
            <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>Clear and restore to factory defaults</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.appInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.appName, { color: colors.foreground }]}>LearnHub</Text>
        <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>Online Learning System v1.0.0</Text>
        <Text style={[styles.appCopy, { color: colors.mutedForeground }]}>Educational Management Platform</Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "33" }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 0 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  headerBgIcon: { position: "absolute", right: 20, top: 20 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 8 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  section: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { flex: 1, minWidth: "45%", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  settingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  settingLabel: { fontSize: 14, fontWeight: "600" },
  settingSub: { fontSize: 12, marginTop: 1, lineHeight: 16 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 14, fontWeight: "600" },
  actionSub: { fontSize: 12, marginTop: 1 },
  appInfo: { margin: 16, marginBottom: 0, borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", gap: 4 },
  appName: { fontSize: 20, fontWeight: "800" },
  appVersion: { fontSize: 13 },
  appCopy: { fontSize: 12 },
  logoutBtn: { margin: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, padding: 14 },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
