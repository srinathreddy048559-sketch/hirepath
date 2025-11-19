// app/jobs/mine/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { redirect } from "next/navigation";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function MyJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    // not logged in → send to login
    redirect("/login?callbackUrl=/jobs/mine");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-sm font-bold text-white shadow-sm">
                H
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-50">
                  HirePath
                </p>
                <p className="text-xs text-slate-400">
                  Find the job. Fix the resume.
                </p>
              </div>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-slate-300">
            We couldn&apos;t find a user record for this account.
          </p>
        </main>
      </div>
    );
  }

  const jobs = await prisma.job.findMany({
    where: { postedById: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top nav */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-sm font-bold text-white shadow-sm">
              H
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-50">
                HirePath
              </p>
              <p className="text-xs text-slate-400">
                Recruiter dashboard
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/jobs/new"
              className="rounded-xl bg-sky-500 px-3.5 py-1.5 font-semibold text-white shadow-sm shadow-sky-500/30 hover:bg-sky-600"
            >
              + Post new job
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              My posted jobs
            </h1>
            <p className="text-xs text-slate-400">
              Signed in as{" "}
              <span className="text-sky-300">
                {session.user.email}
              </span>
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-xs text-slate-400 hover:text-sky-300"
          >
            ← Back to all jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
            <p>You haven&apos;t posted any jobs yet.</p>
            <p className="mt-2 text-xs text-slate-500">
              Use the &quot;Post new job&quot; button above to add your
              first opening to HirePath.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-100 shadow-sm shadow-slate-950/40"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-50">
                      {job.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {job.company && <span>{job.company}</span>}
                      {job.company && job.location && <span> · </span>}
                      {job.location && (
                        <span className="text-slate-200">
                          {job.location}
                        </span>
                      )}
                    </p>
                    {job.salaryRange && (
                      <p className="mt-1 text-xs text-emerald-300">
                        {job.salaryRange}
                      </p>
                    )}
                    <p className="mt-2 line-clamp-2 max-w-xl text-xs text-slate-200">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right text-[11px] text-slate-400">
                    <span>
                      Posted on {formatDate(job.createdAt as Date)}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                      >
                        View details
                      </Link>
                      <Link
                        href={`/tailor?jobId=${job.id}`}
                        className="rounded-xl border border-sky-500 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/20"
                      >
                        Tailor resume for this job
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
