"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    // ⚠️ Demo only: fake signup
    setTimeout(() => {
      setLoading(false);
      alert("Signup demo only, mama. Next step we wire real auth.");
      router.push("/login");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/40">
            <span className="text-sm font-bold text-sky-400">HP</span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">
              HirePath
            </div>
            <div className="text-xs text-slate-400">
              Create your account to get started.
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-2">Create your HirePath account</h1>
        <p className="text-xs text-slate-400 mb-5">
          Save tailored resumes, track applications, and get back to the same job search anytime.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">
              Full name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="Akhil Reedy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">
              Email address
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Use at least 8 characters. In real production we&apos;ll add stronger rules.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-sky-500 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:border-sky-500/70 hover:text-sky-300"
          onClick={() => alert("Google signup coming soon, mama 😄")}
        >
          Sign up with Google
        </button>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          Already have an account?{" "}
          <span
            className="cursor-pointer text-sky-300 hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
