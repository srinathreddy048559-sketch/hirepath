"use client";

export default function EmailPreview({ subject, body }: { subject: string; body: string }) {
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const downloadEML = () => {
    const eml = [
      "From: ",
      "To: ",
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ].join("\r\n");
    const blob = new Blob([eml], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email_to_recruiter.eml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Recruiter Email (ready-to-send)</div>
        <div className="flex gap-2">
          <a href={mailto} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
            Open in Mail
          </a>
          <button onClick={downloadEML} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
            Download .eml
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-800 whitespace-pre-wrap">{body}</div>
    </div>
  );
}
