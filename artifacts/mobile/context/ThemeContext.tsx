import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = PropsWithChildren<{
  storageKey: string;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(scheme: ReturnType<typeof useColorScheme>): ThemeMode {
  return scheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children, storageKey }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    getSystemTheme(systemScheme),
  );

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(storageKey)
      .then((storedTheme) => {
        if (!isMounted) return;
        if (storedTheme === "light" || storedTheme === "dark") {
          setThemeState(storedTheme);
          return;
        }
        setThemeState(getSystemTheme(systemScheme));
      })
      .catch(() => {
        if (isMounted) {
          setThemeState(getSystemTheme(systemScheme));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [storageKey, systemScheme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    AsyncStorage.setItem(storageKey, nextTheme).catch(() => {});
  }, [storageKey]);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      AsyncStorage.setItem(storageKey, nextTheme).catch(() => {});
      return nextTheme;
    });
  }, [storageKey]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();

  if (context) {
    return context;
  }

  const fallbackTheme = getSystemTheme(systemScheme);
  return {
    theme: fallbackTheme,
    isDark: fallbackTheme === "dark",
    setTheme: () => {},
    toggleTheme: () => {},
  };
}
