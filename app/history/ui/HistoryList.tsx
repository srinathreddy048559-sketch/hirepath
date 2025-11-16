// app/history/ui/HistoryList.tsx
"use client";

import { useMemo, useState } from "react";
type Item = {
  id: string;
  createdAt: string | Date;
  summary?: string;
  jd?: string;
  message?: string;
};
import DeleteButton from "./DeleteButton";

type Props = {
  /** Can be array, null, undefined, or even `{ items: Item[] }` */
  items?: Item[] | { items?: Item[] } | null;
};

export default function HistoryList({ items }: Props) {
  // normalize *anything* into an array
  const initialArray = useMemo<Item[]>(() => {
    const raw =
      (Array.isArray(items) && items) ||
      ((items && "items" in items && Array.isArray(items.items) && items.items) as Item[] | false) ||
      [];
    // convert createdAt to Date
    return raw.map((it) => ({
      ...it,
      createdAt: new Date(it.createdAt),
    }));
  }, [items]);

  // Local state so we can remove rows immediately after deletion
  const [list, setList] = useState<Item[]>(initialArray);

  const handleDeleted = (id: string) => {
    setList((prev) => prev.filter((x) => x.id !== id));
  };

  if (!list.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No history yet. Generate your first insight on the Home page.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((it) => (
        <li
          key={it.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <p className="text-xs text-slate-400">
              {it.createdAt instanceof Date ? it.createdAt.toLocaleString() : String(it.createdAt)}
            </p>
            <DeleteButton id={it.id} onDeleted={handleDeleted} />
          </div>

          <h2 className="mt-1 text-sm font-semibold text-slate-800">Summary</h2>
          <p className="whitespace-pre-wrap text-xs text-slate-700">{it.summary}</p>

          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-slate-600">
              View more
            </summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">Job Description</h3>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-5 text-slate-700">
{it.jd}
                </pre>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-800">Message</h3>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-5 text-slate-700">
{it.message}
                </pre>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
