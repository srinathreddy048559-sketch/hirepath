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
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load history");
      const data: HistoryItem[] = await res.json();
      setItems(data);
    } catch (e: any) {
      setErr(e.message ?? "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const onClear = async () => {
    if (!confirm("Delete ALL runs?")) return;
    setClearing(true);
    try {
      // naive: delete one by one
      for (const it of items) {
        await fetch(`/api/history/${it.id}`, { method: "DELETE" });
      }
      setItems([]);
    } catch {
      // ignore
    } finally {
      setClearing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Previous Runs</h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 rounded-lg border text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              ← Back to Generate
            </a>
            <button
              disabled={clearing || items.length === 0}
              onClick={onClear}
              className={`px-4 py-2 rounded-lg text-white ${
                clearing || items.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {err && <p className="text-red-500">Error: {err}</p>}

        {!loading && items.length === 0 && (
          <p className="text-gray-500">No records yet.</p>
        )}

        <div className="mt-4 space-y-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(it.createdAt).toLocaleString()}
                </div>
                <details className="w-full">
                  <summary className="cursor-pointer font-medium">
                    Summary: {it.summary.slice(0, 120)}{it.summary.length > 120 ? "…" : ""}
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-1">Summary</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {it.summary}
                    </pre>
                    <h3 className="font-semibold mt-3 mb-1">Message</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {it.message}
                    </pre>
                  </div>
                </details>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const text = `Summary:\n${it.summary}\n\nMessage:\n${it.message}`;
                    navigator.clipboard.writeText(text);
                    alert("Copied summary + message");
                  }}
                  className="px-3 py-2 rounded border text-blue-700 border-blue-200 hover:bg-blue-50 text-sm"
                >
                  Copy
                </a>
                <button
                  onClick={() => onDelete(it.id)}
                  disabled={deletingId === it.id}
                  className={`px-3 py-2 rounded text-white text-sm ${
                    deletingId === it.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingId === it.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
