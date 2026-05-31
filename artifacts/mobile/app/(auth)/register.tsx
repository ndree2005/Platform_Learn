import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth, type RegisterRole } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ROLE_OPTIONS: Array<{
  label: string;
  role: RegisterRole;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  { label: "Student", role: "student", icon: "person", color: "#0CA678" },
  { label: "Guru", role: "instructor", icon: "school", color: "#3B5BDB" },
];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { addUser } = useData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert("Data belum lengkap", "Isi nama, email, dan password terlebih dahulu.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      Alert.alert("Email tidak valid", "Gunakan alamat email yang benar.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password terlalu pendek", "Gunakan minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password berbeda", "Konfirmasi password harus sama.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await register({ name: trimmedName, email: trimmedEmail, password, role });
    setIsLoading(false);

    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Registrasi gagal", result.error);
      return;
    }

    addUser({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      isActive: true,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0CA678", "#1C7ED6"]}
        style={[styles.header, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="person-add" size={38} color="#fff" />
        </View>
        <Text style={styles.appName}>LearnHub</Text>
        <Text style={styles.tagline}>Create your learning account</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Register</Text>

            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((option) => {
                const selected = role === option.role;

                return (
                  <TouchableOpacity
                    key={option.role}
                    style={[
                      styles.roleOption,
                      {
                        backgroundColor: selected ? option.color + "18" : colors.card,
                        borderColor: selected ? option.color : colors.border,
                      },
                    ]}
                    onPress={() => setRole(option.role)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={option.icon} size={20} color={selected ? option.color : colors.mutedForeground} />
                    <Text style={[styles.roleText, { color: selected ? option.color : colors.foreground }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Nama</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nama lengkap"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nama@email.edu"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Konfirmasi Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ulangi password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="person-add-outline" size={18} color="#fff" />
                  <Text style={styles.registerBtnText}>Create Account</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.authSwitch}>
              <Text style={[styles.authSwitchText, { color: colors.mutedForeground }]}>Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")} activeOpacity={0.75}>
                <Text style={[styles.authSwitchLink, { color: colors.primary }]}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
    gap: 6,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
  },
  tagline: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
  },
  scroll: {
    padding: 20,
  },
  form: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleOption: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "700",
  },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  registerBtn: {
    minHeight: 50,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  authSwitch: {
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  authSwitchText: {
    fontSize: 13,
  },
  authSwitchLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
