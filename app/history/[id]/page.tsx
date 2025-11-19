"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type TailoredSection = {
  kind: string;
  bullets: string[];
};

type Tailored = {
  name?: string;
  sections?: TailoredSection[];
};

type HistoryItem = {
  id: string;
  createdAt: string;
  title: string;
  jd: string;
  resume: string;
  tailored: string; // JSON string from backend
};

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // hit the single-history API (we’ll add it in step 2)
        const res = await fetch(`/api/history/${id}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load history item");
        }

        setItem(data.item);
      } catch (err: any) {
        console.error("History detail fetch error", err);
        setError(err.message || "Failed to load history item");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this history row?")) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to delete history item");
      }
      // go back to list
      router.push("/history");
      router.refresh();
    } catch (err: any) {
      console.error("Delete error", err);
      alert(err.message || "Failed to delete history item");
    } finally {
      setDeleting(false);
    }
  }

  // parse tailored JSON (safe)
  let tailoredParsed: Tailored | null = null;
  if (item?.tailored) {
    try {
      tailoredParsed = JSON.parse(item.tailored);
    } catch {
      tailoredParsed = null;
    }
  }

  const createdAt =
    item &&
    new Date(item.createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Tailored run details
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Saved run for: <span className="text-sky-300">{item?.title}</span>
            {createdAt && <> • {createdAt}</>}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <Link
            href="/history"
            className="rounded-xl border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-sky-500"
          >
            Back to history
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Loading run details…</p>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && item && (
        <div className="space-y-6">
          {/* JD + Resume */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-300 mb-2">
                Job Description
              </h2>
              <pre className="whitespace-pre-wrap text-xs text-slate-200">
                {item.jd}
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-300 mb-2">
                Resume input
              </h2>
              <pre className="whitespace-pre-wrap text-xs text-slate-200">
                {item.resume}
              </pre>
            </div>
          </div>

          {/* Tailored view */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-300 mb-3">
              Tailored resume (structured)
            </h2>

            {tailoredParsed ? (
              <div className="space-y-4 text-xs text-slate-200">
                {tailoredParsed.name && (
                  <div className="font-semibold text-base mb-2">
                    {tailoredParsed.name}
                  </div>
                )}

                {tailoredParsed.sections?.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-semibold uppercase tracking-wide text-[11px] text-slate-300">
                      {sec.kind}
                    </div>
                    <ul className="list-disc ml-5 space-y-1">
                      {sec.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-slate-200">
                {item.tailored}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
