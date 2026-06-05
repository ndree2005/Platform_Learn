import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/constants/api";

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

const SESSION_KEY = "@auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((data) => {
      if (data) setUser(JSON.parse(data));
      setIsLoading(false);
    });
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.post<AuthUser>("/auth/login", { email, password });
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(result));
      setUser(result);
      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      const clean = message.replace(/^API error \d+: /, "").replace(/^"(.*)"$/, "$1");
      const parsed = (() => {
        try { return JSON.parse(clean); } catch { return null; }
      })();
      return {
        success: false,
        error: parsed?.error ?? clean ?? "Invalid email or password",
      };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout", {}); } catch { /* stateless */ }
    await AsyncStorage.removeItem(SESSION_KEY);
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