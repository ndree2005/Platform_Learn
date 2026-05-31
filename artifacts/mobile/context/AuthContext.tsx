import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "student" | "instructor" | "admin";
export type RegisterRole = Extract<UserRole, "student" | "instructor">;

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
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
}

type AuthResult = { success: true; user: AuthUser } | { success: false; error: string };
type StoredAccount = AuthUser & { password: string };

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_USER_KEY = "@auth_user";
const AUTH_TOKEN_KEY = "@auth_token";
const AUTH_ACCOUNTS_KEY = "@auth_accounts";

const DEMO_ACCOUNTS: StoredAccount[] = [
  { id: "admin-1", name: "Admin User", email: "admin@ols.edu", role: "admin", password: "admin123" },
  { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah@ols.edu", role: "instructor", password: "pass123" },
  { id: "inst-2", name: "Prof. James Wilson", email: "james@ols.edu", role: "instructor", password: "pass123" },
  { id: "stu-1", name: "Alex Johnson", email: "alex@ols.edu", role: "student", password: "pass123" },
  { id: "stu-2", name: "Maria Garcia", email: "maria@ols.edu", role: "student", password: "pass123" },
  { id: "stu-3", name: "Liam Park", email: "liam@ols.edu", role: "student", password: "pass123" },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createId(role: RegisterRole) {
  const prefix = role === "student" ? "stu" : "inst";
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toAuthUser(account: StoredAccount): AuthUser {
  const { password: _password, ...authUser } = account;
  return authUser;
}

async function getStoredAccounts(): Promise<StoredAccount[]> {
  const data = await AsyncStorage.getItem(AUTH_ACCOUNTS_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveSession(authUser: AuthUser) {
  await Promise.all([
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)),
    AsyncStorage.setItem(AUTH_TOKEN_KEY, `local-${authUser.id}-${Date.now()}`),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_USER_KEY)
      .then((data) => {
        if (data) setUser(JSON.parse(data));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const accounts = [...DEMO_ACCOUNTS, ...(await getStoredAccounts())];
    const normalizedEmail = normalizeEmail(email);
    const account = accounts.find(
      (a) => normalizeEmail(a.email) === normalizedEmail && a.password === password
    );
    if (!account) return { success: false, error: "Email atau password tidak sesuai" };

    const authUser = toAuthUser(account);
    await saveSession(authUser);
    setUser(authUser);
    return { success: true, user: authUser };
  };

  const register = async ({ name, email, password, role }: RegisterInput): Promise<AuthResult> => {
    const normalizedEmail = normalizeEmail(email);
    const storedAccounts = await getStoredAccounts();
    const allAccounts = [...DEMO_ACCOUNTS, ...storedAccounts];
    const isEmailUsed = allAccounts.some((account) => normalizeEmail(account.email) === normalizedEmail);

    if (isEmailUsed) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const account: StoredAccount = {
      id: createId(role),
      name: name.trim(),
      email: normalizedEmail,
      role,
      password,
    };
    const authUser = toAuthUser(account);

    await AsyncStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify([...storedAccounts, account]));
    await saveSession(authUser);
    setUser(authUser);

    return { success: true, user: authUser };
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_USER_KEY),
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    ]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
