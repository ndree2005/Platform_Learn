import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

type Palette = typeof colors.light;

export function useColors(): Palette & { radius: number } {
  const { theme } = useTheme();
  const palette: Palette = theme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
