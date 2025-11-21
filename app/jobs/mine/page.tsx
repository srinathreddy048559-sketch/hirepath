// app/jobs/mine/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type JobType = "Full-time" | "Contract" | "Internship" | string;
type WorkMode = "Onsite" | "Remote" | "Hybrid" | string;

type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  jobType: JobType | null;
  workMode: WorkMode | null;
  salaryRange?: string | null;
  tags?: string | null;
  createdAt: string;
};

export default function MyJobsPage() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // only load once we know auth status
    if (status === "loading") return;

    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);

        // 🔹 IMPORTANT: relative URL – works in dev & on Vercel
        const res = await fetch("/api/jobs/mine", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load jobs");
        }

        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        console.error("Failed to load my jobs:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [status]);

  return (
    <main className="min-h-screen bg-[#f4f7ff]">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-slate-500">
          <span className="cursor-default text-slate-400">HirePath</span>
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="font-medium text-slate-500">Recruiter dashboard</span>
        </div>

        {/* Header row */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#071633] sm:text-3xl">
              My posted jobs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage the roles you&apos;ve posted on HirePath.
            </p>
            {session?.user?.email && (
              <p className="mt-1 text-xs text-slate-400">
                Signed in as <span className="font-medium text-slate-500">{session.user.email}</span>
              </p>
            )}
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center rounded-full bg-[#0b74ff] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#005fe0]"
          >
            + Post new job
          </Link>
        </div>

        {/* Card */}
        <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
          {status !== "authenticated" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <span className="text-lg">🔐</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Sign in to see your posted jobs
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Use the Google sign-in button in the header, then return here to
                  manage the roles you’ve posted with HirePath.
                </p>
              </div>
            </div>
          )}

          {status === "authenticated" && (
            <>
              {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b74ff]" />
                  <p className="text-sm text-slate-500">Loading your jobs…</p>
                </div>
              )}

              {!loading && error && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Couldn&apos;t load your jobs
                  </p>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    {error}
                  </p>
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4efff]">
                    <span className="text-xl">🔍</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    You haven&apos;t posted any jobs yet.
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Use the <span className="font-semibold">“Post new job”</span> button
                    above to add your first opening to HirePath.
                  </p>
                </div>
              )}

              {!loading && !error && jobs.length > 0 && (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:border-[#0b74ff33] hover:shadow-md"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-sm font-semibold text-[#071633]">
                            {job.title}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {job.company || "Company TBC"} ·{" "}
                            {job.location || "Location / Remote"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          {job.jobType && (
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                              {job.jobType}
                            </span>
                          )}
                          {job.workMode && (
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                              {job.workMode}
                            </span>
                          )}
                          {job.salaryRange && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                              {job.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
