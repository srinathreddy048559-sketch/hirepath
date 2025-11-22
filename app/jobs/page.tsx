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
  createdAt: Date; // prisma gives a Date
};

export default async function JobsPage() {
  // 👇 Explicit type so TS knows jobs is Job[]
  const jobs: Job[] = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
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
              These roles come from recruiter emails and portals. Each posting
              is structured so HirePath can generate a perfectly tailored,
              ATS-friendly resume and cover email.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 text-xs text-slate-500 md:items-end">
            <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              Showing {jobs.length} open roles
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
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 p-6 text-sm text-slate-600">
            No jobs yet. Be the first to{" "}
            <Link
              href="/jobs/new"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              post an opening
            </Link>{" "}
            and let candidates generate AI-ready resumes for your role.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: Job) => {
              const tags = job.tags
                ? job.tags
                    .split(",")
                    .map((t: string) => t.trim()) // 👈 type t
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
                          <span className="text-slate-700">
                            {job.location}
                          </span>
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
                          href={`/?jobId=${job.id}`}
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

      {/* Floating chat bubble on jobs page too */}
      <AskHirePathBubble />
    </div>
  );
}
