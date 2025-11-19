"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AskHirePathBubble() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/tailor")}
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-3
        rounded-2xl border border-slate-200
        bg-white/95 backdrop-blur
        px-4 py-2.5
        shadow-lg shadow-slate-300/40
        hover:shadow-xl hover:-translate-y-0.5
        transition-all duration-200
      "
    >
      {/* Bubble icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-lg">
        💬
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight text-left">
        <span className="text-xs font-semibold text-slate-900">
          Ask HirePath AI
        </span>
        <span className="text-[10px] text-slate-500">
          Resume help instantly
        </span>
      </div>
    </button>
  );
}
