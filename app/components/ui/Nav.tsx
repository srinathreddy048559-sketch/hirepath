// app/components/ui/Nav.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

type Theme = "light" | "dark";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const user = session?.user;

  const [theme, setTheme] = useState<Theme>("light");
  const [scrolled, setScrolled] = useState(false);

  // ---------- Theme bootstrapping ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("hirepath-theme") as
      | Theme
      | null;

    let initial: Theme = "light";

    if (stored) {
      initial = stored;
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      initial = "dark";
    }

    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ---------- Shrink / shadow on scroll ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";

      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("hirepath-theme", next);
      }

      return next;
    });
  }

  function goPostJob() {
    router.push("/jobs/new");
  }

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // 🔹 New nav structure: clear Home + Job search + Mock interviews
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Job search", href: "/jobs" },
    { label: "Tailor resume", href: "/tailor" },
    { label: "Mock interviews", href: "/mock-interview" },
    { label: "History", href: "/history" },
    { label: "My jobs", href: "/jobs/mine" },
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur-xl transition-all duration-200 dark:bg-neutral-950/80 dark:border-neutral-800 ${
        scrolled
          ? "shadow-[0_8px_20px_rgba(15,23,42,0.08)] border-slate-200/80"
          : "shadow-none border-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 ${
          scrolled ? "py-1.5" : "py-2.5"
        }`}
      >
        {/* ---------- LEFT: LOGO ---------- */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 via-sky-400 to-teal-400 shadow-sm ring-1 ring-sky-300/70">
            <Image
              src="/logo.png"
              alt="HirePath logo"
              fill
              className="object-contain p-[3px]"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[18px] font-semibold text-slate-900 dark:text-slate-50">
              HirePath
            </span>
            <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-sky-600">
              Tech jobs · AI resumes
            </span>
          </div>
        </button>

        {/* ---------- CENTER: NAV LINKS ---------- */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => {
            // smarter active logic
            let isActive = pathname === link.href;

            if (link.href === "/") {
              isActive = pathname === "/";
            }

            if (link.href === "/jobs") {
              isActive =
                pathname?.startsWith("/jobs") &&
                !pathname?.startsWith("/jobs/mine");
            }

            if (link.href === "/jobs/mine") {
              isActive = pathname?.startsWith("/jobs/mine");
            }

            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`group relative text-sm transition-colors ${
                  isActive
                    ? "text-sky-700 dark:text-sky-300"
                    : "text-slate-600 hover:text-sky-600 dark:text-slate-300"
                }`}
              >
                {link.label}
                <span
                  className={`pointer-events-none absolute left-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 transition-all duration-300 ${
                    isActive
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* ---------- RIGHT: CONTROLS ---------- */}
        <div className="flex items-center gap-3 text-sm">
          {/* Theme toggle – glowing macOS-style */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`hidden h-9 w-9 items-center justify-center rounded-full border bg-white/80 shadow-sm backdrop-blur-md transition-all duration-200 sm:flex ${
              theme === "light"
                ? "border-slate-200 text-amber-400 hover:shadow-md"
                : "border-sky-500/70 bg-sky-950/70 text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.5)] hover:shadow-[0_0_18px_rgba(56,189,248,0.7)]"
            }`}
          >
            <span className="text-lg transition-transform duration-200">
              {theme === "light" ? "☀️" : "🌙"}
            </span>
          </button>

          {isLoading && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Checking session…
            </span>
          )}

          {/* ---------- LOGGED IN ---------- */}
          {!isLoading && user && (
            <>
              {/* Recruiter CTA */}
              <button
                type="button"
                onClick={goPostJob}
                className="hidden rounded-full border border-sky-500/80 bg-sky-500/10 px-3.5 py-1 text-[11px] font-semibold text-sky-700 shadow-sm hover:bg-sky-500/15 dark:border-sky-400/70 dark:bg-sky-400/10 dark:text-sky-200 sm:inline-flex"
              >
                For recruiters – post job
              </button>

              {/* Profile button (initials + email) */}
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700 shadow-sm group-hover:border-sky-500 group-hover:bg-sky-100 dark:border-sky-700/40 dark:bg-sky-900/40 dark:text-sky-200">
                  {userInitials}
                </div>
                <div className="hidden flex-col leading-tight text-left sm:flex">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Profile
                  </span>
                  <span className="max-w-[160px] truncate text-[11px] text-gray-900 group-hover:text-sky-600 dark:text-gray-50">
                    {user.email}
                  </span>
                </div>
              </button>

              {/* Sign out */}
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-500"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </>
          )}

          {/* ---------- LOGGED OUT ---------- */}
          {!isLoading && !user && (
            <>
              <button
                onClick={() => router.push("/login")}
                className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200 sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="rounded-full border border-sky-500 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-500/20 dark:border-sky-400 dark:text-sky-200"
              >
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
