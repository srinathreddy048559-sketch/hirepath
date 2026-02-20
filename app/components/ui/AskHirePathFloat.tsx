"use client";

import React, { useEffect, useState } from "react";
import AskHirePathChat from "./AskHirePathChat";

export default function AskHirePathFloat() {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating chat panel */}
      <div
        className={`fixed inset-0 z-40 flex items-end justify-end pointer-events-none`}
      >
        <div
          className={`
            pointer-events-auto
            m-3 md:m-6
            transition-all duration-200 ease-out
            ${
              open
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-3 opacity-0 scale-95 pointer-events-none"
            }
          `}
        >
          <div className="relative">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/90 text-[11px] font-semibold text-white shadow-lg shadow-slate-500/40"
            >
              ✕
            </button>

            {/* Your existing chat UI */}
            <AskHirePathChat />
          </div>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30
          inline-flex items-center gap-2
          rounded-full bg-sky-600 px-4 py-2
          text-xs font-semibold text-white shadow-xl shadow-sky-400/40
          transition-transform duration-150 hover:scale-105 hover:bg-sky-700
        `}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[14px]">
          🤖
        </span>
        <span className="hidden sm:inline">Ask HirePath AI</span>
        <span className="sm:hidden">Chat</span>
      </button>
    </>
  );
}
