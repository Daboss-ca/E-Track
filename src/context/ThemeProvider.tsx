"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme") as Theme | null;
  return savedTheme === "dark" ? "dark" : "light";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};