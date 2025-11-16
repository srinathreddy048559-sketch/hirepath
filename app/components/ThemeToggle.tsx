"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;

  if (!mounted) {
    return (
      <button
        className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white/80 hover:bg-white dark:bg-slate-900/60 dark:border-slate-700 dark:hover:bg-slate-800 transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* sun / moon */}
      {current === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-yellow-300" fill="currentColor">
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.8 1.8 1.79-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.83-18.16l-1.79-1.8-1.8 1.8 1.8 1.79 1.79-1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM17.24 19.16l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM12 6a6 6 0 100 12 6 6 0 000-12z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-700" fill="currentColor">
          <path d="M21.64 13a9 9 0 11-10.63-10 7 7 0 0010.63 10z" />
        </svg>
      )}
    </button>
  );
}
