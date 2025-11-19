// app/jobs/[id]/page.tsx
import React from "react";

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
  createdAt: string;
};

async function getJob(id: string): Promise<Job | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${baseUrl}/api/jobs/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load job");
  }

  const data = await res.json();
  return data.job as Job;
}

// ⚠️ NOTE:
// Next 15’s generated PageProps type makes `params` a Promise in .next/types.
// To avoid type conflicts, we let props be `any` here and just `await` params.
// This works whether Next gives us a Promise or a plain object.
export default async function Page({ params }: any) {
  const resolvedParams = await params;
  const id = resolvedParams?.id ?? params?.id;

  const job = await getJob(id);

  if (!job) {
    return (
      <div className="px-10 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">
          Job not found
        </h1>
        <p className="mt-2 text-slate-500">
          This job may have been removed or is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="px-10 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>

      <p className="text-lg mt-2 text-slate-700">
        {job.company}{" "}
        {job.location && (
          <span className="text-sm ml-2 text-slate-500">{job.location}</span>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        {job.jobType && (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {job.jobType}
          </span>
        )}
        {job.workMode && (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {job.workMode}
          </span>
        )}
        {job.salaryRange && (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {job.salaryRange}
          </span>
        )}
      </div>

      <div className="mt-6 whitespace-pre-wrap text-slate-800 leading-relaxed">
        {job.description}
      </div>

      {job.tags && (
        <div className="mt-6 text-sm text-slate-500">
          Tags:{" "}
          {job.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .join(" • ")}
        </div>
      )}
    </div>
  );
}
