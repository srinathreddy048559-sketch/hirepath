"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const JOB_TYPES = ["Full-time", "Contract", "Internship"] as const;
type JobType = (typeof JOB_TYPES)[number];

const WORK_MODES = ["Onsite", "Remote", "Hybrid"] as const;
type WorkMode = (typeof WORK_MODES)[number];

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<JobType>("Full-time");
  const [workMode, setWorkMode] = useState<WorkMode>("Onsite");
  const [salaryRange, setSalaryRange] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState(""); // full JD

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function parseTags(raw: string): string[] {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Job description (JD) is required.");
      return;
    }

    const payload = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      jobType,
      workMode,
      salaryRange: salaryRange.trim(),
      tags: parseTags(tagsInput),
      description: description.trim(),
    };

    try {
      setLoading(true);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create job.");
      }

      setSuccess("Job posted successfully!");
      setTimeout(() => {
        router.push("/jobs"); // we’ll build this listing page next
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      {/* Top bar */}
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-600 text-white font-bold shadow-sm">
              HP
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sky-900">
                HirePath – Post a Job
              </p>
              <p className="text-xs text-sky-500">
                Structured, clean posting for GenAI-ready matching
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
          >
            ← Back to Jobs
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        {/* Title + subtitle */}
        <section>
          <h1 className="text-2xl font-bold text-sky-950">
            Create a new job posting
          </h1>
          <p className="mt-1 text-sm text-sky-600">
            Fill in the structured fields below. HirePath will use this to
            generate perfectly tailored resumes for your candidates.
          </p>
        </section>

        {/* Form card */}
        <section className="rounded-2xl bg-white shadow-md shadow-sky-100 border border-sky-100">
          <form onSubmit={handleSubmit} className="grid gap-6 p-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              {/* Job title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Generative AI Engineer"
                  className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="HealthSphere AI"
                  className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Seattle, WA"
                  className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Job type + Work mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType)}
                    className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary range */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="$140k – $180k / year"
                  className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
                <p className="mt-1 text-[11px] text-sky-400">
                  Optional. You can also use hourly or C2C rates (e.g. $70–$80/hr).
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="GenAI, LLMs, RAG, AWS, Bedrock"
                  className="mt-1 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
                <p className="mt-1 text-[11px] text-sky-400">
                  These help HirePath match and filter – skills, tools, domain, etc.
                </p>
              </div>
            </div>

            {/* Right column – JD */}
            <div className="space-y-4">
              <div className="h-full">
                <label className="block text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Full Job Description / JD{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Paste the full JD here...

Example:
- Build and deploy Generative AI solutions using Amazon Bedrock and SageMaker.
- Fine-tune LLMs (Claude, LLaMA, Mistral, etc.) for enterprise use cases.
- Design RAG pipelines with vector search (Pinecone, FAISS, OpenSearch).
- Collaborate with product and data teams to ship GenAI features to production.
`}
                  rows={16}
                  className="mt-1 h-[360px] w-full resize-none rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 placeholder-sky-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
                <p className="mt-1 text-[11px] text-sky-400">
                  HirePath will parse this JD to generate tailored resumes and
                  candidate matches.
                </p>
              </div>
            </div>

            {/* Footer: errors + buttons */}
            <div className="md:col-span-2 mt-2 flex flex-col gap-3 border-t border-sky-100 pt-4">
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {success}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-sky-400">
                  By posting this job, you&apos;re enabling HirePath to generate
                  high-quality, JD-aligned resumes for your candidates.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/jobs")}
                    className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-medium text-sky-700 shadow-sm hover:border-sky-300 hover:bg-sky-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Posting…" : "Post Job"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
