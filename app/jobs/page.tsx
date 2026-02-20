// app/jobs/page.tsx
import prisma from "@/lib/prisma";
import AskHirePathBubble from "../components/ui/AskHirePathBubble";
import Link from "next/link";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  jobType: string | null;
  workMode: string | null;
  salaryRange?: string | null;
  description: string;
  tags?: string | null;
  createdAt: Date;
};

export default async function JobsPage() {
  const jobs: Job[] = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Top intro strip */}
        <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
              Open roles on HirePath
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Browse tech jobs shared with HirePath.
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Roles posted here are structured so HirePath can generate a tailored,
              ATS-friendly resume and a clean cover email.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 text-xs text-slate-500 md:items-end">
            <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              Showing {jobs.length} open role{jobs.length === 1 ? "" : "s"}
            </span>

            <span>
              Want to add a role?{" "}
              <Link
                href="/jobs/new"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Post a job
              </Link>
            </span>
          </div>
        </section>

        {/* Jobs list */}
        {jobs.length === 0 ? (
          <section className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
            {/* Empty state card */}
            <div className="rounded-3xl border border-dashed border-sky-200 bg-white/80 p-6 shadow-sm shadow-sky-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                No jobs posted yet
              </p>

              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                This job board is new — you can still use HirePath today.
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Most users paste a job description from LinkedIn or a recruiter email
                into the Tailor page and generate role-specific resume bullets.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/tailor"
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
                >
                  Tailor my resume (paste a JD)
                </Link>

                <Link
                  href="/jobs/new"
                  className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm hover:border-sky-300 hover:bg-sky-50"
                >
                  Post a job
                </Link>

                <Link
                  href="/mock-interview"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                >
                  Mock interview (beta)
                </Link>
              </div>

              <div className="mt-5 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
                <p className="text-xs font-semibold text-slate-900">
                  Try these example roles:
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {[
                    "Python Developer",
                    "GenAI Engineer",
                    "Data Engineer",
                    "ML Engineer",
                    "Backend Engineer (FastAPI)",
                    "Azure OpenAI",
                  ].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-sky-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Side info panel */}
            <div className="rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-sm shadow-sky-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                What you can do here
              </p>

              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">1)</span> Post a job
                  you found (recruiter email / LinkedIn) so it’s structured.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">2)</span> Tailor your
                  resume for a role in minutes using JD-aware suggestions.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">3)</span> Practice
                  role-specific interview questions (beta).
                </li>
              </ul>

              <div className="mt-5 rounded-2xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-semibold text-emerald-800">
                  Pro tip
                </p>
                <p className="mt-1 text-xs text-emerald-800/90">
                  For best results, paste the full job description + required skills
                  section into Tailor.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: Job) => {
              const tags = job.tags
                ? job.tags
                    .split(",")
                    .map((t: string) => t.trim())
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
                  className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm shadow-sky-100"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    {/* Left: content */}
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
                          {tags.map((tag: string) => (
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

                    {/* Right: actions */}
                    <div className="flex flex-col items-end gap-2 text-right text-[11px] text-slate-500">
                      <span>
                        Posted on{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(job.createdAt)}
                        </span>
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700"
                        >
                          View details
                        </Link>

                        <Link
                          href={`/tailor?jobId=${job.id}`}
                          className="inline-flex items-center rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
                        >
                          Tailor resume for this job
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 🌟 Floating AskHirePath chat button */}
      <div className="fixed bottom-5 right-5 z-40 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-105">
        <AskHirePathBubble />
      </div>
    </div>
  );
}
