"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        handleGenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resume, jd]);

  const handleGenerate = async () => {
    if (loading) return;

    setError("");
    setSummary("");
    setMessage("");

    if (!resume.trim() || !jd.trim()) {
      setError("Please paste both your Resume and Job Description.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd }),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to generate response.");
      }

      // Read from data.run first (what our API returns)
      setSummary(data.run?.summary || data.summary || "No summary generated.");
      setMessage(data.run?.message || data.message || "No message generated.");

      // Optional: want to stay on this page to see results.
      // If you prefer redirect to history, uncomment:
      // window.location.href = "/history";
    } catch (err: any) {
      console.error("Error in handleGenerate:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          HirePath AI
        </h1>

        <div className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste your Resume here..."
            rows={6}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste the Job Description here..."
            rows={6}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <a
              href="/history"
              className="px-4 py-3 rounded-lg border text-blue-700 border-blue-200 hover:bg-blue-50"
              title="View previous runs"
            >
              View Previous Runs →
            </a>
          </div>

          {error && (
            <p className="text-red-500 font-medium text-center mt-2">{error}</p>
          )}
        </div>

        {(summary || message) && (
          <div ref={resultRef} className="mt-6 border-t pt-4 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Summary
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Message
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">{message}</p>
            </div>
          </div>
        )}

        {/* Tip */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Tip: Press <kbd className="font-semibold">Cmd/Ctrl</kbd> +{" "}
          <kbd className="font-semibold">Enter</kbd> to generate.
        </p>
      </div>
    </main>
  );
}
