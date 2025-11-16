"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-30">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-semibold text-blue-600 hover:text-blue-700">
          HirePath.ai
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition">Home</Link>
          <Link href="/history" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition">History</Link>
          <Link href="/about" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition">About</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
