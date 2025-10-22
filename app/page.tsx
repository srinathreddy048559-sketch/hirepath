"use client";

import { useState } from "react";

/** Small reusable copy button with “Copied!” feedback */
function CopyButton({
  getText,
  label = "Copy",
  className = "",
}: {
  getText: () => string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = getText() ?? "";
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op; clipboard may be blocked in some contexts
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className={
        "px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition " +
        className
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function Page() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
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

      // Update UI
      setSummary(data.run?.summary || data.summary || "No summary generated.");
      setMessage(data.run?.message || data.message || "No message generated.");

      // Redirect to /history shortly after updating UI
      setTimeout(() => {
        window.location.href = "/history";
      }, 300);
    } catch (err: any) {
      console.error("Error in handleGenerate:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {error && (
            <p className="text-red-500 font-medium text-center mt-2">{error}</p>
          )}
        </div>

        {(summary || message) && (
          <div className="mt-6 border-t pt-4 space-y-6">
            {/* Summary */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
                <CopyButton
                  label="Copy summary"
                  getText={() => summary}
                />
              </div>
              <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
            </section>

            {/* Message */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-800">Message</h2>
                <CopyButton
                  label="Copy message"
                  getText={() => message}
                />
              </div>
              <p className="whitespace-pre-wrap text-gray-700">{message}</p>
            </section>
          </div>
        )}

        <p className="text-gray-400 text-sm text-center mt-6">
          Tip: Press <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate.
        </p>
      </div>
    </main>
  );
}
