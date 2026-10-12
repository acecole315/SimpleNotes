import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  input: string;
  placeholder: string;
  button: string;
  buttonText: string;
};

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

const THEME_KEY = "@simple_notes_theme";

const lightColors: ThemeColors = {
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#202124",
  secondaryText: "#5F6368",
  border: "#E1E4E8",
  input: "#FFFFFF",
  placeholder: "#888888",
  button: "#202124",
  buttonText: "#FFFFFF",
};

const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  secondaryText: "#BDBDBD",
  border: "#333333",
  input: "#1E1E1E",
  placeholder: "#888888",
  button: "#FFFFFF",
  buttonText: "#121212",
};

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<ThemeMode>("light");

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(
        THEME_KEY,
        theme
      );
    }
  }, [theme, loaded]);

  const loadTheme = async () => {
    try {
      const savedTheme =
        await AsyncStorage.getItem(THEME_KEY);

      if (
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log(
        "Failed to load theme:",
        error
      );
    } finally {
      setLoaded(true);
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  const colors =
    theme === "light"
      ? lightColors
      : darkColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
