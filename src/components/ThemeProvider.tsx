"use client";

import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("shalizar-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : systemDark;

    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("shalizar-theme")) {
        if (e.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
