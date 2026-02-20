"use client";

import { useEffect } from "react";

export function Toast({
  message,
  show,
  onClose,
}: {
  message: string;
  show: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
      <div className="rounded-lg bg-slate-900 text-white px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
        <span className="text-sky-400">✓</span> {message}
      </div>
    </div>
  );
}
