import { createContext, useContext } from "react";

export const THEME_STORAGE_KEY = "tasksphere-theme";

// Light is the default; the choice is remembered on this device
export const readStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
