"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const root = document.documentElement;
        const saved = localStorage.getItem("shalizar-theme");
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const dark = saved ? saved === "dark" : systemDark;
        if (dark) root.classList.add("dark");
        else root.classList.remove("dark");
      } catch (e) {}
    };

    // Run immediately on mount
    initializeTheme();

    // Also listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "shalizar-theme") {
        initializeTheme();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null;
}