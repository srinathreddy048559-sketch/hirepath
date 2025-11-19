// app/login/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email/password is just UI for now (no real auth yet)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // You can wire custom credentials here later if you want.
    // For now we just prevent full-page reload.
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-start">
        {/* LEFT: Story / marketing */}
        <section className="flex-1 rounded-[1.8rem] bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50 px-6 py-7 shadow-sm ring-1 ring-sky-100">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
            Secure sign-in for job seekers
          </p>

          <h1 className="mb-3 text-[2rem] font-black leading-tight text-slate-900 md:text-[2.25rem]">
            Welcome back to{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              HirePath.
            </span>
          </h1>

          <p className="mb-5 max-w-xl text-sm text-slate-600">
            Pick up where you left off — saved jobs, tailored resumes, and AI tips
            for your next tech role. Your profile and resume stay private until
            you&apos;re ready to share.
          </p>

          <ul className="mb-6 space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✔</span>
              <span>Sync your latest tailored resume to job boards.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✔</span>
              <span>Save and track roles you&apos;ve applied to.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✔</span>
              <span>
                Let AI keep your resume aligned with every new job description.
              </span>
            </li>
          </ul>

          {/* Little “avatar group” illustration */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-sky-500/90 ring-2 ring-slate-50" />
              <div className="h-7 w-7 rounded-full bg-indigo-500/90 ring-2 ring-slate-50" />
              <div className="h-7 w-7 rounded-full bg-teal-500/90 ring-2 ring-slate-50" />
            </div>
            <p className="text-[11px] text-slate-500">
              Join other AI/ML engineers already using <span className="font-semibold text-slate-700">HirePath</span> to speed up their job search.
            </p>
          </div>
        </section>

        {/* RIGHT: Login card */}
        <section className="w-full max-w-md rounded-[1.8rem] bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Sign in to your account
              </h2>
              <p className="text-[11px] text-slate-500">
                Use your email or continue with Google.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
              HP
            </div>
          </div>

          {/* Email/password form (visual only for now) */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Keep me signed in on this device</span>
              </label>
              <button
                type="button"
                className="text-sky-600 hover:text-sky-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-2 text-[11px] text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google button with colored logo */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50"
          >
            <span className="relative h-5 w-5">
              <Image
                src="/google.svg"
                alt="Google logo"
                fill
                sizes="20px"
                className="object-contain"
              />
            </span>
            <span>Continue with Google</span>
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Don&apos;t have an account yet?{" "}
            <span className="font-medium text-sky-600">
              Sign in with Google to create one.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
