// app/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AskHirePathBubble from "./components/ui/AskHirePathBubble";
import AskHirePathChat from "./components/ui/AskHirePathChat";

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
  description: string;
  tags?: string | null;
  createdAt: string; // ISO string from API
};

const TRENDING_CATEGORIES: { label: string; keyword: string }[] = [
  { label: "AI & ML", keyword: "AI ML" },
  { label: "Data Science", keyword: "Data Scientist" },
  { label: "Backend & APIs", keyword: "Backend" },
  { label: "Cloud & DevOps", keyword: "DevOps" },
  { label: "Full-stack", keyword: "Full stack" },
];

export default function HomePage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<"Any" | JobType>("Any");
  const [workModeFilter, setWorkModeFilter] =
    useState<"Any" | WorkMode>("Any");

  // 🔹 selected job for "View details"
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // 🔹 Load jobs from /api/jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoadingJobs(true);
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = await res.json();
        setJobs(data.jobs ?? []);
      } catch (err) {
        console.error("Jobs load error", err);
      } finally {
        setLoadingJobs(false);
      }
    }

    loadJobs();
  }, []);

  // 🔹 Filter logic for search bar
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const kw = keyword.toLowerCase();
      const loc = location.toLowerCase();

      const matchesKeyword =
        !kw ||
        job.title.toLowerCase().includes(kw) ||
        (job.company ?? "").toLowerCase().includes(kw) ||
        job.description.toLowerCase().includes(kw);

      const matchesLocation =
        !loc || (job.location ?? "").toLowerCase().includes(loc);

      const matchesType =
        jobTypeFilter === "Any" ||
        (job.jobType ?? "").toLowerCase() === jobTypeFilter.toLowerCase();

      const matchesMode =
        workModeFilter === "Any" ||
        (job.workMode ?? "").toLowerCase() === workModeFilter.toLowerCase();

      return (
        matchesKeyword && matchesLocation && matchesType && matchesMode
      );
    });
  }, [jobs, keyword, location, jobTypeFilter, workModeFilter]);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleTailor(job: Job) {
  if (typeof window !== "undefined") {
    // save full job so /tailor can auto-fill JD + title
    window.localStorage.setItem("hirepath-last-job", JSON.stringify(job));
  }

  // we don’t need the id in the URL any more
  router.push("/tailor");
}


  // 🔹 open / close details
  function handleViewDetails(job: Job) {
    setSelectedJob(job);
  }

  function closeDetails() {
    setSelectedJob(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      {/* ---------- HERO (Job-first) ---------- */}
<section className="relative">
  {/* soft blue background bubble behind hero */}
  <div className="pointer-events-none absolute inset-x-0 top-4 -bottom-6 -z-10 flex justify-center">
    <div className="h-full w-full max-w-6xl rounded-[2.5rem] bg-gradient-to-br from-sky-100 via-sky-50 to-white" />
  </div>

  <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-8 md:grid-cols-[minmax(0,2.1fr)_minmax(0,3fr)] md:items-center">
    {/* Left: avatar bubbles */}
    <div className="relative flex h-full items-center justify-center md:justify-start">
      <div className="pointer-events-none absolute inset-y-4 -left-6 -right-10 rounded-[2.5rem] bg-sky-900/5 blur-2xl" />

      <div className="relative flex flex-col gap-6">
        {/* Srinath bubble */}
        <div className="flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100 ring-1 ring-slate-100">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-sky-200 bg-sky-50 shadow-sm">
            <Image
              src="/avatars/srinath.png"
              alt="Srinath from HirePath"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">
              Srinath · AI/ML Engineer
            </p>

            <p className="text-xs leading-snug text-slate-500">
              “HirePath helped me find better roles and tailor my resume in minutes.”
            </p>

            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
              <span className="mr-1 text-[13px]">✔</span>
              Matched to GenAI roles
            </span>
          </div>
        </div>

        {/* Bubble 2 */}
        <div className="ml-10 flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-sky-100 bg-sky-50">
            <Image
              src="/avatars/dev1.png"
              alt="Full-stack developer avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-900">
              Full-stack dev · Remote
            </p>
            <p className="text-[11px] text-slate-500">
              Found remote roles + ATS-safe resume in one place.
            </p>
          </div>
        </div>

        {/* Bubble 3 */}
        <div className="ml-4 flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-sm shadow-sky-100">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-sky-100 bg-sky-50">
            <Image
              src="/avatars/dev2.png"
              alt="Data scientist avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-900">
              Data Scientist · Seattle
            </p>
            <p className="text-[11px] text-slate-500">
              “Every JD → one perfect resume.”
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Right: heading + job search bar */}
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
          AI-POWERED JOB SEARCH
        </p>

        <h1 className="text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.6rem]">
          Find your next{" "}
          <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
            tech job
          </span>
          .
        </h1>

        <p className="mt-2 text-lg font-medium text-sky-700">
          Search roles you want. Let AI fix the resume later.
        </p>

        <p className="mt-1 max-w-xl text-sm text-slate-600">
          Browse curated tech jobs by keyword, location, and work mode. HirePath
          surfaces the best matches for your profile and can generate a tailored,
          ATS-ready resume when you’re ready to apply.
        </p>
      </div>

      {/* Search panel */}
      <div className="rounded-[1.6rem] bg-white/95 p-4 shadow-md shadow-sky-100">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.7fr)] md:items-center">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Keyword
              </label>
              <input
                type="text"
                placeholder="Job title, skill, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Job type
                </label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) =>
                    setJobTypeFilter(e.target.value as "Any" | JobType)
                  }
                  className="w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                >
                  <option value="Any">Any job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Work mode
                </label>
                <select
                  value={workModeFilter}
                  onChange={(e) =>
                    setWorkModeFilter(e.target.value as "Any" | WorkMode)
                  }
                  className="w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                >
                  <option value="Any">Any work mode</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Location
              </label>
              <input
                type="text"
                placeholder="City, state, or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {/* CTA is job-first now */}
            <button
              type="button"
              onClick={() => {
                setKeyword((k) => k.trim());
                setLocation((l) => l.trim());
              }}
              className="flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
            >
              Search matching roles
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredJobs.length}
            </span>{" "}
            matching roles from your job board.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {TRENDING_CATEGORIES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setKeyword(item.keyword)}
                className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 shadow-sm hover:border-sky-300 hover:shadow-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ---------- TRUSTED STRIP ---------- */}
<section className="border-y border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80">
  <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:flex-row md:items-center md:justify-between">
    <div className="max-w-md space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
        Trusted by job seekers
      </p>
      <p className="text-sm">
        <span className="text-base font-semibold text-slate-900">
          3,200+ people
        </span>{" "}
        finding tech roles faster with HirePath.
      </p>
      <p className="text-[11px] text-slate-500">
        From entry-level developers to senior AI/ML engineers, job seekers use
        HirePath to discover better roles and stand out in recruiter inboxes.
      </p>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="flex">
          {"★★★★★".split("").map((star, idx) => (
            <span key={idx} className="text-amber-400">
              ★
            </span>
          ))}
        </span>
        <span>
          <span className="font-semibold text-slate-800">4.8/5</span>{" "}
          average satisfaction
        </span>
        <span className="text-slate-400">·</span>
        <span>1,200+ private reviews</span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white bg-slate-200 shadow-sm">
          <Image
            src="/avatars/dev1.png"
            alt="Job seeker avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white bg-slate-200 shadow-sm">
          <Image
            src="/avatars/dev2.png"
            alt="Job seeker avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white bg-sky-100 text-[11px] font-semibold text-sky-700 shadow-sm">
          +3k
        </div>
      </div>
      <p className="max-w-xs text-[11px] text-slate-500">
        Job seekers from India, US, Canada, and Europe testing AI-ready resumes
        every day.
      </p>
    </div>

    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        Remote tech job boards
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        LinkedIn recruiters
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        AI / ML roles
      </span>
    </div>
  </div>
</section>



      {/* ---------- JOB LIST ---------- */}
<section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
  {loadingJobs ? (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-sky-100/70 animate-pulse"
        />
      ))}
    </div>
  ) : filteredJobs.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-sm text-slate-500">
      No roles match your filters. Try clearing them or searching a
      broader keyword.
    </div>
  ) : (
    <div className="space-y-4">
      {filteredJobs.map((job) => {
        const tags = job.tags
          ? job.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        const jobTypeLabel = job.jobType || "Job";
        const workModeLabel = job.workMode || "";

        const descriptionPreview =
          job.description.length > 260
            ? job.description.slice(0, 260) + "…"
            : job.description;

        return (
          <article
            key={job.id}
            className="rounded-2xl border border-sky-100 bg-white/95 p-5 shadow-sm shadow-sky-100"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              {/* LEFT SIDE CONTENT */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {job.title}
                  </h2>

                  {jobTypeLabel && (
                    <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-sky-700">
                      {jobTypeLabel}
                    </span>
                  )}
                  {workModeLabel && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-700">
                      {workModeLabel}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {job.company && <span>{job.company}</span>}
                  {job.company && job.location && <span> · </span>}
                  {job.location && (
                    <span className="text-slate-700">{job.location}</span>
                  )}
                </p>

                {job.salaryRange && (
                  <p className="text-xs text-emerald-600">
                    {job.salaryRange}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-700">
                  {descriptionPreview}
                </p>

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE BUTTONS */}
<div className="flex flex-col items-end gap-[4px] text-right text-[11px] text-slate-500">

  <span>
    Posted on{" "}
    <span className="font-medium text-slate-700">
      {formatDate(job.createdAt)}
    </span>
  </span>

  <div className="flex items-center gap-[10px]">

    {/* LinkedIn style — ultra minimal */}
    <button
      type="button"
      onClick={() => handleViewDetails(job)}
      className="group inline-flex items-center gap-[2px] 
                 text-[11.5px] font-medium text-slate-700
                 hover:text-sky-700 transition"
    >
      <span className="group-hover:underline leading-none">
        View details
      </span>
      <span
        className="text-[13px] text-slate-400 group-hover:text-sky-700 
                   transition-transform duration-150 ease-out 
                   group-hover:translate-x-[1px] leading-none"
      >
        ›
      </span>
    </button>

    {/* Tailor CTA — unchanged */}
    <button
      type="button"
      // NEW
onClick={() => handleTailor(job)}

      className="rounded-lg bg-sky-600 px-4 py-1.5 text-[11.5px] font-semibold 
                 text-white shadow-sm hover:bg-sky-700 transition"
    >
      Tailor
    </button>

  </div>
</div>

            </div>
          </article>
        );
      })}
    </div>
  )}
</section>




      {/* Your existing chat docked bottom-right */}
      <AskHirePathChat />

      {/* ---------- VIEW DETAILS MODAL ---------- */}
      {selectedJob && (
        <div className="fixed inset-0 z-40 flex items-end justify-center px-3 pb-4 sm:items-center sm:px-4 sm:pb-6">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeDetails}
          />
          {/* Panel */}
          <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  {selectedJob.title}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {selectedJob.company && <span>{selectedJob.company}</span>}
                  {selectedJob.company && selectedJob.location && <span> · </span>}
                  {selectedJob.location && (
                    <span className="text-slate-700">
                      {selectedJob.location}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedJob.jobType && (
                    <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-700">
                      {selectedJob.jobType}
                    </span>
                  )}
                  {selectedJob.workMode && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700">
                      {selectedJob.workMode}
                    </span>
                  )}
                  {selectedJob.salaryRange && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      {selectedJob.salaryRange}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Job description
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.tags && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Skills / tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 pb-1 sm:flex-row sm:items-center">
                <p className="text-[11px] text-slate-500">
                  Posted on{" "}
                  <span className="font-medium text-slate-700">
                    {formatDate(selectedJob.createdAt)}
                  </span>
                </p>
                <div className="flex gap-2">
                  {/* Minimal ghost Back button */}
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Back to list
                  </button>
                  {/* Clean compact Tailor CTA */}
                  <button
  type="button"
  onClick={() => {
    if (!selectedJob) return;
    handleTailor(selectedJob);      // ✅ pass full Job
    closeDetails();
  }}
  className="inline-flex items-center rounded-full bg-sky-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-700"
>
  Tailor this job
</button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
