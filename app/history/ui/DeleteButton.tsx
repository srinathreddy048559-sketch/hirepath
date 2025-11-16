// app/history/ui/DeleteButton.tsx
"use client";

import { useState } from "react";

type Props = {
  id: string;
  onDeleted?: (id: string) => void;
};

export default function DeleteButton({ id, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this run?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted?.(id);
      } else {
        alert("Failed to delete this run.");
      }
    } catch {
      alert("Network error while deleting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
      aria-label="Delete history row"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
