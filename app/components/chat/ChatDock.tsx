// app/components/chat/ChatDock.tsx
"use client";

import React from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatDock({ className = "" }: { className?: string }) {
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { role: "assistant", content: "Hi! Paste a JD and I’ll help tailor your resume." },
  ]);
  const [text, setText] = React.useState("");

  async function send() {
    if (!text.trim()) return;
    const next = [...msgs, { role: "user" as const, content: text.trim() }];
    setMsgs(next);
    setText("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: next }),
    });
    const json = await res.json();
    setMsgs((m) => [...m, { role: "assistant", content: json.text || "…" }]);
  }

  return (
    <div className={`fixed right-4 bottom-4 w-[320px] rounded-xl border bg-white shadow ${className}`}>
      <div className="px-3 py-2 border-b font-medium">HirePath Chat</div>
      <div className="p-3 h-[240px] overflow-y-auto text-sm space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={
                "inline-block rounded px-2 py-1 " +
                (m.role === "user" ? "bg-black text-white" : "bg-gray-100")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 rounded border px-2 py-1 text-sm"
          placeholder="Ask anything about your resume…"
        />
        <button onClick={send} className="rounded bg-black text-white px-3 text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
