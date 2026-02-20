"use client";

import { useEffect, useState } from "react";
import AskHirePathChat from "./AskHirePathChat";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  // listen for global toggle event from the button
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleToggle = () => {
      setOpen((prev) => !prev);
    };

    window.addEventListener("hirepath-chat-toggle", handleToggle);
    return () => window.removeEventListener("hirepath-chat-toggle", handleToggle);
  }, []);

  // tell the button we opened (so it can stop pulsing)
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("hirepath-chat-open"));
  }, [open]);

  function close() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      {/* overlay */}
      <button
        type="button"
        onClick={close}
        aria-label="Close chat overlay"
        className="hirepath-overlay absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
      />

      {/* modal */}
      <div className="relative z-50 w-full max-w-4xl px-3 sm:px-0">
        <div className="hirepath-modal-enter mx-auto w-full translate-y-4 sm:translate-y-0">
          <AskHirePathChat />
        </div>
      </div>
    </div>
  );
}
