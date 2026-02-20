"use client";

import React, { useState, useEffect } from "react";
import AskHirePathChat from "./AskHirePathChat";

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration flicker
  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    setOpen((prev) => !prev);
  }

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/35 backdrop-blur-sm opacity-0 animate-fade-in-fast"
          onClick={toggle}
        />
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-5xl px-3 sm:px-5 animate-chat-pop"
          >
            <AskHirePathChat />
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Ask HirePath AI"
        className="fixed bottom-4 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-300/60 outline-none
                   hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-300
                   animate-float-soft"
      >
        {/* main bubble */}
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-sky-500">
          {/* pulse glow */}
          <span className="absolute inset-0 rounded-full bg-sky-400/40 blur-md animate-pulse-soft" />
          {/* three dots */}
          <span className="relative flex gap-[3px]">
            <span className="h-[5px] w-[5px] rounded-full bg-white/90 animate-typing-dot [animation-delay:-0.25s]" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/90 animate-typing-dot [animation-delay:-0.1s]" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/90 animate-typing-dot" />
          </span>
        </span>

        {/* floating mini bubbles */}
        <span className="pointer-events-none absolute -top-1 -left-1 h-3 w-3 rounded-full bg-sky-300/80 blur-[1px] animate-bubble-up" />
        <span className="pointer-events-none absolute -bottom-1 -right-3 h-2.5 w-2.5 rounded-full bg-sky-400/70 blur-[1px] animate-bubble-up-slow" />
      </button>
    </>
  );
}
