// app/history/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type HistoryItem = {
  id: string;
  createdAt: string; // ISO string from API
  title: string;
  jd: string;
  resume: string;
  tailored: string; // JSON string from /api/tailor
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthLoading = status === "loading";
  const isAuthed = !!session?.user;

  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return;
    }

    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/history", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Failed to load history");
        }

        setItems(data.histories ?? []);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Could not load history");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isAuthed]);

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  function handleViewTailor(item: HistoryItem) {
    // For now just send them to /tailor;
    // later we can prefill JD + resume using localStorage or query params.
    router.push("/tailor");
  }

  if (isAuthLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50/80 flex items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm text-sm text-slate-600">
          Loading your history…
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-50/80 flex items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm text-sm text-slate-700">
          Please log in to see your history.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 pt-6">
      <div className="mx-auto max-w-6xl px-4 space-y-6">
        {/* Breadcrumb */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
          HIREPATH · HISTORY
        </p>

        {/* Heading */}
        <header className="space-y-2">
          <h1 className="text-[2rem] font-black leading-tight text-slate-900 md:text-[2.2rem]">
            Your tailored resume history.
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Every time you run the tailor, HirePath saves the job description and
            tailored resume here — visible only to you.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {items.length === 0 && !error && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">
            No history yet. Run your first tailor from the{" "}
            <button
              type="button"
              onClick={() => router.push("/tailor")}
              className="font-semibold text-sky-600 underline-offset-2 hover:underline"
            >
              Tailor resume
            </button>{" "}
            page.
          </div>
        )}

        {items.length > 0 && (
          <section className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {item.title || "Tailored resume run"}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <span>
                      JD:{" "}
                      <span className="font-semibold">
                        {item.jd ? item.jd.length : 0} chars
                      </span>
                    </span>
                    <span>·</span>
                    <span>
                      Resume:{" "}
                      <span className="font-semibold">
                        {item.resume ? item.resume.length : 0} chars
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Job description (preview)
                    </p>
                    <p className="line-clamp-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      {item.jd || "No JD text stored."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Tailored resume (preview)
                    </p>
                    <p className="line-clamp-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 whitespace-pre-line">
                      {/* tailored is JSON string from /api/tailor; show raw for now */}
                      {item.tailored}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewTailor(item)}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600"
                  >
                    Tailor a new resume
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
