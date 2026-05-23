import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "student" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: "admin-1", name: "Admin User", email: "admin@ols.edu", role: "admin", password: "admin123" },
  { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah@ols.edu", role: "instructor", password: "pass123" },
  { id: "inst-2", name: "Prof. James Wilson", email: "james@ols.edu", role: "instructor", password: "pass123" },
  { id: "stu-1", name: "Alex Johnson", email: "alex@ols.edu", role: "student", password: "pass123" },
  { id: "stu-2", name: "Maria Garcia", email: "maria@ols.edu", role: "student", password: "pass123" },
  { id: "stu-3", name: "Liam Park", email: "liam@ols.edu", role: "student", password: "pass123" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("@auth_user").then((data) => {
      if (data) setUser(JSON.parse(data));
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) return { success: false, error: "Invalid email or password" };
    const { password: _, ...authUser } = account;
    await AsyncStorage.setItem("@auth_user", JSON.stringify(authUser));
    setUser(authUser);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { DEMO_ACCOUNTS };
