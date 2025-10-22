"use client";
import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  resume: string;
  jd: string;
  summary: string;
  message: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load history");
      setItems(await res.json());
    } catch (e: any) {
      setErr(e.message ?? "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems(prev => prev.filter(i => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function clearAll() {
    if (!confirm("Delete ALL runs?")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Clear failed");
      setItems([]);
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Previous Runs</h1>
          <div className="space-x-2">
            <a href="/" className="text-sm text-blue-600 hover:underline">← Back to Generate</a>
            <button
              onClick={clearAll}
              disabled={clearing || items.length === 0}
              className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}
        {!loading && items.length === 0 && <p className="text-gray-500">No records yet.</p>}

        <ul className="divide-y">
          {items.map((it) => (
            <li key={it.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <p className="font-semibold">{new Date(it.createdAt).toLocaleString()}</p>
                  <p className="text-gray-600 truncate">
                    <span className="font-medium">Summary:</span> {it.summary || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <details>
                    <summary className="cursor-pointer px-3 py-1.5 rounded border">View</summary>
                    <div className="mt-2 p-3 border rounded bg-gray-50 w-[70vw] max-w-3xl">
                      <h3 className="font-semibold mb-1">Summary</h3>
                      <pre className="whitespace-pre-wrap text-sm">{it.summary}</pre>
                      <h3 className="font-semibold mt-3 mb-1">Message</h3>
                      <pre className="whitespace-pre-wrap text-sm">{it.message}</pre>
                    </div>
                  </details>
                  <button
                    onClick={() => remove(it.id)}
                    disabled={deletingId === it.id}
                    className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
                  >
                    {deletingId === it.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
