"use client";

import { useMemo, useState } from "react";

type Result = {
  summary_md: string;
  email_subject: string;
  email_body_plain: string;
  email_body_html: string;
  linkedin_dm: string;
  sms_text: string;
};

export default function ResultPanel({ result }: { result: Result }) {
  const [tab, setTab] = useState<"summary"|"email"|"linkedin"|"sms">("summary");

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(result.email_subject || "");
    const body = encodeURIComponent(result.email_body_plain || "");
    return `mailto:?subject=${subject}&body=${body}`;
  }, [result]);

  const linkedInIntent = useMemo(() => {
    const text = encodeURIComponent(result.linkedin_dm || "");
    return `https://www.linkedin.com/messaging/compose/?composeOptionType=UNKNOWN&text=${text}`;
  }, [result]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed.");
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 pt-3">
        {[
          {id:"summary", label:"Summary"},
          {id:"email", label:"Email"},
          {id:"linkedin", label:"LinkedIn DM"},
          {id:"sms", label:"SMS"},
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3 py-2 text-sm rounded-t-md ${tab===t.id ? "bg-slate-100 font-medium" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2 py-2">
          {tab === "email" && (
            <>
              <button onClick={() => copy(result.email_body_plain)} className="btn-subtle">Copy</button>
              <a href={mailto} className="btn-primary" target="_blank" rel="noreferrer">Open in Gmail</a>
            </>
          )}
          {tab === "summary" && (
            <button onClick={() => copy(result.summary_md)} className="btn-subtle">Copy</button>
          )}
          {tab === "linkedin" && (
            <>
              <button onClick={() => copy(result.linkedin_dm)} className="btn-subtle">Copy</button>
              <a href={linkedInIntent} className="btn-primary" target="_blank" rel="noreferrer">Open LinkedIn</a>
            </>
          )}
          {tab === "sms" && (
            <button onClick={() => copy(result.sms_text)} className="btn-subtle">Copy</button>
          )}
        </div>
      </div>

      <div className="p-4">
        {tab === "summary" && (
          <pre className="whitespace-pre-wrap text-sm">{result.summary_md}</pre>
        )}

        {tab === "email" && (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-slate-400">Subject</p>
              <p className="text-sm font-medium">{result.email_subject}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Body (Plain)</p>
              <pre className="whitespace-pre-wrap text-sm">{result.email_body_plain}</pre>
            </div>
            <details className="mt-2 rounded-md border border-slate-200 p-3 bg-slate-50">
              <summary className="cursor-pointer text-xs text-slate-500">HTML preview</summary>
              <div className="mt-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: result.email_body_html }} />
            </details>
          </div>
        )}

        {tab === "linkedin" && (
          <pre className="whitespace-pre-wrap text-sm">{result.linkedin_dm}</pre>
        )}

        {tab === "sms" && (
          <pre className="whitespace-pre-wrap text-sm">{result.sms_text}</pre>
        )}
      </div>
    </div>
  );
}
