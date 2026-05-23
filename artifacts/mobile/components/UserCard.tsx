import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { AppUser } from "@/context/DataContext";

interface Props {
  user: AppUser;
  onPress?: () => void;
  onDelete?: () => void;
}

const ROLE_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  admin: { color: "#9B59B6", icon: "shield-checkmark" },
  instructor: { color: "#3B5BDB", icon: "school" },
  student: { color: "#0CA678", icon: "person" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#3B5BDB", "#E64980", "#0CA678", "#F76707", "#9B59B6", "#1098AD"];

export default function UserCard({ user, onPress, onDelete }: Props) {
  const colors = useColors();
  const roleConf = ROLE_CONFIG[user.role];
  const avatarColor = AVATAR_COLORS[user.id.charCodeAt(user.id.length - 1) % AVATAR_COLORS.length];

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{getInitials(user.name)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleConf.color + "18" }]}>
            <Ionicons name={roleConf.icon} size={11} color={roleConf.color} />
            <Text style={[styles.roleText, { color: roleConf.color }]}>{user.role}</Text>
          </View>
        </View>
        <Text style={[styles.email, { color: colors.mutedForeground }]} numberOfLines={1}>{user.email}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>Joined {user.joinDate}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  info: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  email: { fontSize: 12 },
  date: { fontSize: 11 },
  deleteBtn: { padding: 4 },
});
