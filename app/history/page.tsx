// app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Result = {
  summary_text: string;
  summary_bullets: string[];
  email_subject: string;
  email_body: string;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  resume: string;
  jd: string;
  result: Result;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleReuse(item: HistoryItem) {
    // Save chosen item to localStorage to be picked up by Home page
    localStorage.setItem("hirepath_last", JSON.stringify(item));
    // Navigate back home
    window.location.href = "/";
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">Back to Home</Link>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-gray-600">No history yet. Generate insights on the Home page to see them here.</p>
      )}

      <div className="space-y-4">
        {items.map((h) => (
          <div
            key={h.id}
            className="p-4 rounded-xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {new Date(h.createdAt).toLocaleString()}
                </p>
                <p className="font-semibold mt-1 truncate">{h.result?.email_subject}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {h.result?.summary_text}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleReuse(h)}
                  className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50"
                  title="Load this result into Home"
                >
                  Reuse
                </button>
                <details className="group">
                  <summary className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50 cursor-pointer">
                    Preview
                  </summary>
                  <div className="mt-3 text-sm grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Summary</p>
                      <p className="whitespace-pre-line">{h.result?.summary_text}</p>
                      {h.result?.summary_bullets?.length ? (
                        <>
                          <p className="text-xs text-gray-500 mt-3 mb-1">Key Points</p>
                          <ul className="list-disc ml-5">
                            {h.result.summary_bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email Subject</p>
                      <p className="font-medium">{h.result?.email_subject}</p>
                      <p className="text-xs text-gray-500 mt-3 mb-1">Email Body</p>
                      <div className="border rounded-lg p-3 bg-gray-50 whitespace-pre-line">
                        {h.result?.email_body}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
