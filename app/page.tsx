// app/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      {/* ---------- HERO ---------- */}
      <section className="relative">
        {/* soft blue background bubble */}
        <div className="pointer-events-none absolute inset-x-0 top-6 -bottom-8 -z-10 flex justify-center">
          <div className="h-full w-full max-w-6xl rounded-[2.5rem] bg-gradient-to-br from-sky-100 via-sky-50 to-white" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-10 md:grid-cols-[minmax(0,2.1fr)_minmax(0,3fr)] md:items-center">
          {/* Left: success stories */}
          <div className="relative flex h-full items-center justify-center md:justify-start">
            <div className="pointer-events-none absolute inset-y-4 -left-6 -right-10 rounded-[2.5rem] bg-sky-900/5 blur-2xl" />

            <div className="relative flex flex-col gap-6">
              {/* Founder bubble (authentic) */}
              <div className="flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100 ring-1 ring-slate-100">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-sky-200 bg-sky-50 shadow-sm">
                  <Image
                    src="/avatars/srinath.png"
                    alt="Srinath (builder of HirePath)"
                    fill
                    sizes="64px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900">
                    Srinath · Building HirePath
                  </p>

                  <p className="text-xs leading-snug text-slate-500">
                    “I built HirePath to tailor my resume faster during my job
                    search — and I’m improving it based on real user feedback.”
                  </p>

                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                    <span className="mr-1 text-[13px]">✔</span>
                    Beta · Feedback-driven
                  </span>
                </div>
              </div>

              {/* Bubble 2 */}
              <div className="ml-10 flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100 ring-1 ring-slate-100">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-sky-100 bg-sky-50">
                  <Image
                    src="/avatars/dev1.png"
                    alt="Job seeker avatar"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900">
                    Built for real job seekers
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Designed to convert any JD into a resume that feels specific,
                    readable, and ATS-friendly.
                  </p>
                </div>
              </div>

              {/* Bubble 3 */}
              <div className="ml-4 flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100 ring-1 ring-slate-100">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-sky-100 bg-sky-50">
                  <Image
                    src="/avatars/dev2.png"
                    alt="Job seeker avatar"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900">
                    Not generic AI
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tailoring is JD-aware — focused on the skills that matter for
                    your target role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: main hero copy */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                TECH JOBS · AI RESUMES · MOCK INTERVIEWS
              </p>

              <h1 className="text-[2.3rem] font-black leading-tight text-slate-900 md:text-[2.7rem]">
                Tailor your resume to any{" "}
                <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  job description
                </span>{" "}
                in minutes.
              </h1>

              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                Paste your resume and a job description. HirePath rewrites your
                bullets to match the role, highlights missing keywords, and
                generates a clean ATS-friendly output — so you can apply with
                confidence.
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-sky-100">
                🧠 JD-aware bullet rewrites
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
                ✅ Keyword gap checklist
              </span>
              <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 ring-1 ring-violet-100">
                🎤 Mock interview prep (rolling out)
              </span>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary */}
              <Link
                href="/tailor"
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
              >
                Tailor my resume
              </Link>

              {/* Secondary */}
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm hover:border-sky-300 hover:bg-sky-50"
              >
                Find jobs on HirePath
              </Link>

              {/* Tertiary */}
              <Link
                href="/mock-interview"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
              >
                Practice a mock interview →
              </Link>
            </div>

            <p className="text-[11px] text-slate-500">
              Try tailoring without signup. Your feedback helps shape the next
              features.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- BEFORE / AFTER DEMO ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
              Example job description
            </p>
            <p className="mt-2 text-xs text-slate-700">
              Looking for a Python engineer to build APIs, integrate LLMs, and
              deploy on AWS. Experience with FastAPI, PostgreSQL, and vector
              databases preferred.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {["Python", "FastAPI", "AWS", "PostgreSQL", "LLMs", "Vector DB"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full bg-sky-50 px-2 py-1 font-medium text-sky-700 ring-1 ring-sky-100"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Before
            </p>
            <p className="mt-2 text-xs text-slate-700">
              Built backend services and worked on APIs for the application.
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              Too generic — doesn’t match the JD keywords.
            </p>
          </div>

          <div className="rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              After (HirePath)
            </p>
            <p className="mt-2 text-xs text-slate-800">
              Built <span className="font-semibold text-sky-700">FastAPI</span>{" "}
              endpoints in{" "}
              <span className="font-semibold text-sky-700">Python</span>,
              integrated{" "}
              <span className="font-semibold text-sky-700">LLM</span>-powered
              workflows, and deployed services on{" "}
              <span className="font-semibold text-sky-700">AWS</span> with{" "}
              <span className="font-semibold text-sky-700">PostgreSQL</span>{" "}
              persistence.
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              More specific + keyword-aligned + recruiter-readable.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- TRUST (BETA + PRIVACY) ---------- */}
      <section className="border-y border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-3 md:items-center">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
              Beta launch
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Built to make resume tailoring fast, specific, and ATS-friendly.
            </p>
            <p className="text-[11px] text-slate-500">
              HirePath is in active development. Feedback directly shapes what we
              build next.
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600">
            <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">
              What you get right now
            </p>
            <ul className="space-y-1">
              <li>✅ JD-aware bullet rewrites (role-specific)</li>
              <li>✅ Keyword gap checklist (what you’re missing)</li>
              <li>✅ Clean, ATS-friendly output</li>
            </ul>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600">
            <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">
              Privacy-first
            </p>
            <ul className="space-y-1">
              <li>🔒 Your resume isn’t sold or shared</li>
              <li>🗑️ You control what you save</li>
              <li>⚡ Try it without signup</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto mt-8 max-w-6xl px-4 pb-14">
        <div className="rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
            HOW HIREPATH WORKS
          </p>

          <div className="mt-3 grid gap-4 text-sm text-slate-700 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-slate-900">1 · Paste</p>
              <p className="mt-1 text-xs text-slate-600">
                Upload your resume and paste any job description — LinkedIn,
                recruiter email, or job portal.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">2 · Tailor</p>
              <p className="mt-1 text-xs text-slate-600">
                HirePath analyzes the JD, rewrites your bullets, and highlights
                the skills that matter for that specific role.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                3 · Apply (and practice)
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Download a clean ATS-friendly output. Mock interview practice is
                rolling out next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto mb-10 max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-sky-50/80 px-5 py-5 text-center shadow-sm shadow-sky-100 md:flex-row md:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Ready to tailor your resume for your next role?
            </p>
            <p className="mt-1 max-w-xl text-[11px] text-slate-600">
              Paste a JD, get role-specific bullet suggestions, and apply with a
              resume that matches what recruiters search for.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/tailor"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
            >
              Start tailoring my resume
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-4 py-2.5 text-xs font-semibold text-sky-700 shadow-sm hover:border-sky-300 hover:bg-sky-50"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
