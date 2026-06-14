import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Get initial preference from localStorage, default to 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme-preference") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let activeTheme = theme;
      
      if (theme === "system") {
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = systemIsDark ? "dark" : "light";
      }

      if (activeTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      // Update localStorage
      localStorage.setItem("theme-preference", theme);
    };

    applyTheme();

    // Listen for system changes if system mode is selected
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => {
        applyTheme();
      };
      
      // Modern event listener support
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemChange);
      } else {
        mediaQuery.addListener(handleSystemChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleSystemChange);
        } else {
          mediaQuery.removeListener(handleSystemChange);
        }
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
