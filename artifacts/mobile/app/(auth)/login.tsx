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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "student@demo.com", password: "password123", icon: "person" as const, color: "#0CA678" },
  { label: "Guru", email: "instructor@demo.com", password: "password123", icon: "school" as const, color: "#3B5BDB" },
  { label: "Admin", email: "admin@demo.com", password: "password123", icon: "shield-checkmark" as const, color: "#9B59B6" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Failed", result.error ?? "Invalid credentials");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    }
  };

  const handleDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#3B5BDB", "#1C3A99"]}
        style={[styles.header, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="book" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>LearnHub</Text>
        <Text style={styles.tagline}>Your gateway to knowledge</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sign In</Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.edu"
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
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                  <Text style={styles.loginBtnText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.authSwitch}>
              <Text style={[styles.authSwitchText, { color: colors.mutedForeground }]}>
                Pendaftaran hanya bisa dilakukan oleh Admin
              </Text>
            </View>
          </View>

          <View style={styles.demoSection}>
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>Try a demo account</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.demoGrid}>
              {DEMO_ACCOUNTS.map((acc) => (
                <TouchableOpacity
                  key={acc.label}
                  style={[styles.demoCard, { backgroundColor: colors.card, borderColor: acc.color + "44" }]}
                  onPress={() => handleDemo(acc)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.demoIcon, { backgroundColor: acc.color + "18" }]}>
                    <Ionicons name={acc.icon} size={22} color={acc.color} />
                  </View>
                  <Text style={[styles.demoLabel, { color: colors.foreground }]}>{acc.label}</Text>
                  <Text style={[styles.demoEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{acc.email}</Text>
                </TouchableOpacity>
              ))}
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
    paddingBottom: 32,
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
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  card: { gap: 14 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
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
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
  demoSection: { gap: 14 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: "500" },
  demoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  demoCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  demoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  demoLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  demoEmail: {
    fontSize: 10,
    textAlign: "center",
  },
});
