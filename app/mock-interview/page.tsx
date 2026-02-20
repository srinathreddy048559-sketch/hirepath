// app/mock-interview/page.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
} from "react";

type TargetRole =
  | "ALL"
  | "AI/ML"
  | "Data Science"
  | "Backend"
  | "Frontend"
  | "DevOps";
type Level = "Junior" | "Mid-level" | "Senior";
type FocusMode = "Behavioral" | "Technical" | "Mixed";

type InterviewerMode =
  | "Friendly"
  | "Strict"
  | "AmazonBarRaiser"
  | "GoogleMLL5";

type QuestionKind = "behavioral" | "technical";

type Question = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  approxMinutes: number;
  kind: QuestionKind;
};

type FeedbackState = {
  text: string;
  loading: boolean;
  error: string | null;
};

type TranscriptItem = {
  questionTitle: string;
  questionBody: string;
  answer: string;
  feedback?: string;
  createdAt: string;
};

const BASE_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Round 1 · Behavioral",
    body:
      "Tell me about a time you shipped an ML or software project that didn’t perform as expected in production. What went wrong and how did you fix it?",
    tags: ["Behavioral", "AI / ML", "Impact", "Ownership", "Post-mortem"],
    approxMinutes: 4,
    kind: "behavioral",
  },
  {
    id: 2,
    title: "Round 2 · Technical",
    body:
      "Walk me through how you would design a retrieval-augmented generation (RAG) system for a support chatbot. How would you store documents, retrieve context, and evaluate quality?",
    tags: ["Technical", "System design", "RAG", "LLMs", "Evaluation"],
    approxMinutes: 6,
    kind: "technical",
  },
  {
    id: 3,
    title: "Round 3 · Depth",
    body:
      "Describe a time you improved latency, reliability, or cost for a model or backend service. What was the baseline, what did you change, and what measurable result did you achieve?",
    tags: ["Depth", "Metrics", "Optimization", "Impact"],
    approxMinutes: 5,
    kind: "behavioral",
  },
];

const QUESTION_SECONDS_DEFAULT = 4 * 60; // 4 minutes per question

const STAR_TEMPLATE =
  "S (Situation):\nT (Task):\nA (Action):\nR (Result – add metrics):";
const SAO_TEMPLATE =
  "Situation:\nAction (what YOU did):\nOutcome (quantify impact):";
const ICARO_TEMPLATE =
  "Intent (goal):\nContext:\nAction:\nResult:\nOutcome / learning:";

function buildQuestionSet(targetRole: TargetRole, focus: FocusMode): Question[] {
  let list = [...BASE_QUESTIONS];

  if (focus === "Behavioral") {
    list = list.filter((q) => q.kind === "behavioral");
  } else if (focus === "Technical") {
    list = list.filter((q) => q.kind === "technical");
  }

  if (list.length === 0) return BASE_QUESTIONS.slice(0, 2);
  return list.slice(0, 3);
}

// remove emojis / non-ASCII so pdf-lib WinAnsi is safe
function sanitize(text: string): string {
  return (text || "").replace(/[^\x00-\x7F]/g, "");
}

export default function MockInterviewPage() {
  const [targetRole, setTargetRole] = useState<TargetRole>("AI/ML");
  const [level, setLevel] = useState<Level>("Mid-level");
  const [focusMode, setFocusMode] = useState<FocusMode>("Mixed");
  const [interviewerMode, setInterviewerMode] =
    useState<InterviewerMode>("Friendly");

  const [questions, setQuestions] = useState<Question[]>(() =>
    buildQuestionSet("AI/ML", "Mixed")
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(
    QUESTION_SECONDS_DEFAULT
  );
  const [timerRunning, setTimerRunning] = useState(true);

  const [feedback, setFeedback] = useState<FeedbackState>({
    text: "",
    loading: false,
    error: null,
  });

  const [bulletFeedback, setBulletFeedback] = useState<FeedbackState>({
    text: "",
    loading: false,
    error: null,
  });

  const [autoHint, setAutoHint] = useState<string | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];

  // ---------- Timer ----------
  useEffect(() => {
    if (!timerRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // ---------- Auto hints ----------
  useEffect(() => {
    if (!timerRunning) {
      if (hintRef.current) clearTimeout(hintRef.current);
      return;
    }

    const HINTS: string[] =
      currentQuestion?.kind === "technical"
        ? [
            "Talk through trade-offs, not just the happy path.",
            "Mention data flow: where data comes from and where it goes.",
            "Include at least one metric: latency, throughput, or accuracy.",
            "Explain how you would monitor and roll back issues.",
          ]
        : [
            "Use STAR: Situation → Task → Action → Result.",
            "Say what YOU did, not what the team did.",
            "Add one metric: revenue, latency, users, or uptime.",
            "Finish with what you learned and how you’d do it better next time.",
          ];

    hintRef.current = setTimeout(() => {
      const idx = Math.floor(Math.random() * HINTS.length);
      setAutoHint(HINTS[idx]);
    }, 30_000);

    return () => {
      if (hintRef.current) clearTimeout(hintRef.current);
    };
  }, [timerRunning, currentQuestion?.id, currentQuestion?.kind]);

  const minutes = Math.floor(timerSecondsLeft / 60);
  const seconds = timerSecondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const timerProgress = useMemo(
    () => 1 - timerSecondsLeft / QUESTION_SECONDS_DEFAULT,
    [timerSecondsLeft]
  );

  // ---------- Voice input ----------
  function setupRecognition() {
    if (typeof window === "undefined") return null;

    const AnyWindow = window as any;
    const SpeechRecognition =
      AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer((prev) =>
        prev.length ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()
      );
    };

    recognition.onerror = () => {
      setVoiceActive(false);
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    return recognition;
  }

  function toggleVoice() {
    if (voiceActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceActive(false);
      return;
    }

    const rec = setupRecognition();
    if (!rec) {
      alert("Voice input is not supported in this browser yet.");
      return;
    }
    recognitionRef.current = rec;
    rec.start();
    setVoiceActive(true);
  }

  // ---------- Helpers ----------
  function flashSaveMessage(msg: string) {
    setSaveMessage(msg);
    setTimeout(() => {
      setSaveMessage(null);
    }, 3500);
  }

  async function saveAnswerToHistory(
    q: Question,
    answerText: string,
    feedbackText?: string
  ) {
    try {
      const res = await fetch("/api/mock-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionTitle: q.title,
          questionBody: q.body,
          answer: answerText,
          feedback: feedbackText ?? "",
          targetRole,
          level,
          focusMode,
        }),
      });

      if (!res.ok) {
        console.error("Save history error:", await res.text());
        flashSaveMessage(
          "Couldn't save to History (but local transcript is OK)."
        );
        return;
      }

      flashSaveMessage("Saved this answer to History ✓");
    } catch (err) {
      console.error("Save history exception:", err);
      flashSaveMessage("Couldn't save to History (check console).");
    }
  }

  function resetInterview() {
    const newQs = buildQuestionSet(targetRole, focusMode);
    setQuestions(newQs);
    setCurrentIndex(0);
    setAnswer("");
    setTimerSecondsLeft(QUESTION_SECONDS_DEFAULT);
    setTimerRunning(true);
    setFeedback({ text: "", loading: false, error: null });
    setBulletFeedback({ text: "", loading: false, error: null });
    setQuestionsAnswered(0);
    setAutoHint(null);
    setTranscript([]);
    setSaveMessage(null);
  }

  // ---------- AI calls ----------
  async function fetchFromAI(
    mode: "feedback" | "bullet",
    signal?: AbortSignal
  ): Promise<string> {
    const payload = {
      mode: "mock-interview",
      submode: mode,
      question: currentQuestion?.body,
      answer,
      targetRole,
      level,
      focusMode,
      interviewerMode,
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    const json: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        json?.error ||
          json?.message ||
          "HirePath AI had trouble responding. Try again."
      );
    }

    const text: string =
      json?.reply ||
      json?.answer ||
      json?.message ||
      (typeof json === "string" ? json : JSON.stringify(json, null, 2));

    return text;
  }

  async function handleGetFeedback(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!answer.trim() || feedback.loading) return;

    const controller = new AbortController();

    setFeedback({ text: "", loading: true, error: null });
    try {
      const text = await fetchFromAI("feedback", controller.signal);
      setFeedback({ text, loading: false, error: null });
    } catch (err: any) {
      console.error(err);
      setFeedback({
        text: "",
        loading: false,
        error:
          err?.message ||
          "Something went wrong getting interview feedback. Try again.",
      });
    }
  }

  async function handleGenerateBullet() {
    if (!answer.trim() || bulletFeedback.loading) return;

    const controller = new AbortController();
    setBulletFeedback({ text: "", loading: true, error: null });

    try {
      const text = await fetchFromAI("bullet", controller.signal);
      setBulletFeedback({ text, loading: false, error: null });
    } catch (err: any) {
      console.error(err);
      setBulletFeedback({
        text: "",
        loading: false,
        error:
          err?.message ||
          "Something went wrong generating a resume bullet. Try again.",
      });
    }
  }

  // ---------- Save + next ----------
  async function handleSaveAndNext() {
    const q = currentQuestion;
    const trimmed = answer.trim();
    const fb = feedback.text;

    if (q && trimmed) {
      const item: TranscriptItem = {
        questionTitle: q.title,
        questionBody: q.body,
        answer: trimmed,
        feedback: fb || undefined,
        createdAt: new Date().toISOString(),
      };

      setTranscript((prev) => [...prev, item]);
      await saveAnswerToHistory(q, trimmed, fb);
    }

    const lastIndex = questions.length - 1;

    if (q && trimmed) {
      setQuestionsAnswered((prev) => prev + 1);
    }

    if (currentIndex < lastIndex) {
      setCurrentIndex((idx) => idx + 1);
      setAnswer("");
      setTimerSecondsLeft(QUESTION_SECONDS_DEFAULT);
      setTimerRunning(true);
      setFeedback({ text: "", loading: false, error: null });
      setBulletFeedback({ text: "", loading: false, error: null });
      setAutoHint(null);
    } else {
      setTimerRunning(false);
    }
  }

  // ---------- PDF transcript ----------
  async function handleDownloadTranscriptPdf() {
    try {
      // Build full transcript including current question if not saved yet
      const blocks: TranscriptItem[] = [...transcript];

      if (currentQuestion && answer.trim()) {
        blocks.push({
          questionTitle: currentQuestion.title,
          questionBody: currentQuestion.body,
          answer: answer.trim(),
          feedback: feedback.text || undefined,
          createdAt: new Date().toISOString(),
        });
      }

      if (blocks.length === 0) {
        alert("No answers yet. Answer at least one question before exporting.");
        return;
      }

      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const { saveAs } = await import("file-saver");

      const pdfDoc = await PDFDocument.create();
      const pageWidth = 595.28; // A4 width
      const pageHeight = 841.89;
      const marginX = 40;
      const marginY = 40;

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const lineHeight = 12;
      const fontSize = 10;
      const maxWidth = pageWidth - marginX * 2;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - marginY;

      function writeLine(text: string, opts?: { bold?: boolean }) {
        const f = opts?.bold ? fontBold : font;
        const safe = sanitize(text);
        if (y <= marginY) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - marginY;
        }
        page.drawText(safe, {
          x: marginX,
          y,
          size: fontSize,
          font: f,
        });
        y -= lineHeight;
      }

      function writeWrapped(text: string, opts?: { bold?: boolean }) {
        const f = opts?.bold ? fontBold : font;
        const safe = sanitize(text);
        const words = safe.split(/\s+/);
        let line = "";

        for (const word of words) {
          const candidate = line ? `${line} ${word}` : word;
          const width = f.widthOfTextAtSize(candidate, fontSize);
          if (width > maxWidth && line) {
            writeLine(line, opts);
            line = word;
          } else {
            line = candidate;
          }
        }
        if (line) writeLine(line, opts);
      }

      writeLine("HirePath · Mock Interview Transcript", { bold: true });
      writeLine(new Date().toLocaleString());
      writeLine("");

      blocks.forEach((item, idx) => {
        writeLine(`Question ${idx + 1}: ${item.questionTitle}`, {
          bold: true,
        });
        writeWrapped(item.questionBody);
        writeLine("");

        writeLine("Your answer:", { bold: true });
        writeWrapped(item.answer);

        if (item.feedback) {
          writeLine("");
          writeLine("AI feedback:", { bold: true });
          writeWrapped(item.feedback);
        }

        writeLine("");
        writeLine("—");
        writeLine("");
      });

      const pdfBytes = await pdfDoc.save();
      // TS is being strict about BlobPart, so we cast to any.
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      saveAs(blob, "HirePath-Mock-Interview-Transcript.pdf");
    } catch (err) {
      console.error("PDF transcript error:", err);
      alert("Sorry, something went wrong while generating the PDF transcript.");
    }
  }

  // ---------- Derived stats ----------
  const totalQuestions = questions.length;
  const completed = Math.min(questionsAnswered, totalQuestions);
  const sessionProgressPct =
    totalQuestions === 0 ? 0 : Math.round((completed / totalQuestions) * 100);

  const estimatedScoreLabel = useMemo(() => {
    if (!answer.trim()) return "—";
    const length = answer.trim().split(/\s+/).length;
    if (length < 80) return "Needs more detail";
    if (length < 160) return "Decent answer";
    return "Strong, detailed answer";
  }, [answer]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {/* Top heading */}
        <section className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
            Practice → Confidence → Offers
          </p>
          <h1 className="mt-1 text-[2.1rem] font-black leading-tight text-slate-900 md:text-[2.4rem]">
            Mock interviews{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              for tech roles
            </span>
            .
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Simulate a real onsite loop with AI-guided questions, timers, and
            resume-friendly feedback. Practice here, reuse your best answers in
            recruiter screens, and let HirePath handle the resumes.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
              <span className="text-[13px]">✔</span> Focused on AI/ML, data,
              backend, and cloud roles
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-sky-100">
              ⏱ Time-boxed answers like a real round
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-slate-100 px-3 py-1 font-medium">
              🤖 AI feedback + resume bullet generator + History saving
            </span>
          </div>
        </section>

        {/* Main grid */}
        <section className="grid gap-5 md:grid-cols-[minmax(0,1.45fr)_minmax(0,2.1fr)_minmax(0,1.2fr)]">
          {/* LEFT: Setup + outline */}
          <div className="space-y-4">
            {/* Setup card */}
            <div className="rounded-3xl bg-white/95 p-4 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                Interview setup
              </p>

              <div className="mt-3 space-y-3 text-[11px] text-slate-700">
                {/* Target role */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-900">
                    Target role
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        "ALL",
                        "AI/ML",
                        "Data Science",
                        "Backend",
                        "Frontend",
                        "DevOps",
                      ] as TargetRole[]
                    ).map((item) => {
                      const active = targetRole === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setTargetRole(item)}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                            active
                              ? "bg-sky-600 text-white shadow-sm shadow-sky-300"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                          }`}
                        >
                          {item === "ALL" ? "All / Mix" : item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level + focus */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-900">
                      Level
                    </p>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as Level)}
                      className="w-full rounded-xl border border-sky-100 bg-sky-50/70 px-2.5 py-1.5 text-[11px] text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-900">
                      Interview focus
                    </p>
                    <select
                      value={focusMode}
                      onChange={(e) =>
                        setFocusMode(e.target.value as FocusMode)
                      }
                      className="w-full rounded-xl border border-sky-100 bg-sky-50/70 px-2.5 py-1.5 text-[11px] text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="Mixed">Mixed</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Technical">Technical</option>
                    </select>
                  </div>
                </div>

                {/* Interviewer mode */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-900">
                    Interviewer mode
                  </p>
                  <select
                    value={interviewerMode}
                    onChange={(e) =>
                      setInterviewerMode(e.target.value as InterviewerMode)
                    }
                    className="w-full rounded-xl border border-sky-100 bg-sky-50/70 px-2.5 py-1.5 text-[11px] text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="Friendly">Friendly coach</option>
                    <option value="Strict">Strict interviewer</option>
                    <option value="AmazonBarRaiser">Amazon Bar Raiser</option>
                    <option value="GoogleMLL5">Google ML L5</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={resetInterview}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
                >
                  Restart interview
                </button>
              </div>
            </div>

            {/* Outline card */}
            <div className="rounded-3xl bg-white/95 p-4 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                Interview outline
              </p>
              <div className="mt-3 space-y-3 text-[11px] text-slate-700">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-2 rounded-2xl px-3 py-2 ${
                      idx === currentIndex
                        ? "bg-sky-50 ring-1 ring-sky-100"
                        : "bg-slate-50/70"
                    }`}
                  >
                    <div className="mt-[2px] text-[10px] font-semibold text-sky-600">
                      {idx + 1}.
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{q.title}</p>
                      <p className="line-clamp-2 text-[11px] text-slate-500">
                        {q.body}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        ~{q.approxMinutes} min •{" "}
                        {q.kind === "technical"
                          ? "Technical depth"
                          : "Behavioral / leadership"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: Question + answer */}
          <div className="space-y-4">
            {/* Goal banner */}
            <div className="rounded-3xl bg-slate-900 text-slate-50 px-4 py-3 shadow-sm shadow-slate-900/40">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
                Goal · More offers
              </p>
              <p className="mt-1 text-[13px] font-medium">
                Treat every session here like a real onsite. Save your strongest
                answers to History, reuse them in recruiter screens, and let
                HirePath fix the resumes.
              </p>
            </div>

            {/* Question + answer card */}
            <div className="rounded-3xl bg-white/95 p-4 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {currentQuestion?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="mt-2 text-[15px] font-semibold text-slate-900">
                {currentQuestion?.body}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Your answer (pretend you’re speaking to a real interviewer).
              </p>

              {/* Templates */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() =>
                    setAnswer((prev) =>
                      prev.trim().length ? `${prev}\n\n${STAR_TEMPLATE}` : STAR_TEMPLATE
                    )
                  }
                  className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Insert STAR template
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAnswer((prev) =>
                      prev.trim().length ? `${prev}\n\n${SAO_TEMPLATE}` : SAO_TEMPLATE
                    )
                  }
                  className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Insert SAO template
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAnswer((prev) =>
                      prev.trim().length
                        ? `${prev}\n\n${ICARO_TEMPLATE}`
                        : ICARO_TEMPLATE
                    )
                  }
                  className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  Insert ICARO template
                </button>
              </div>

              {/* Answer textarea */}
              <form onSubmit={handleGetFeedback} className="mt-3 space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Use a clear structure (e.g. Situation → Task → Action → Result). Talk through trade-offs, metrics, and what YOU personally did."
                  rows={8}
                  className="w-full resize-none rounded-2xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-xs text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium shadow-sm ${
                        voiceActive
                          ? "bg-rose-600 text-white shadow-rose-300 animate-pulse"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>{voiceActive ? "Stop voice" : "Speak answer"}</span>
                      <span>{voiceActive ? "🎙️" : "🎤"}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Tip: answer out loud, then refine the text.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateBullet}
                      className="inline-flex items-center rounded-full bg-emerald-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-300 hover:bg-emerald-700"
                    >
                      Turn this into a resume bullet
                    </button>
                    <button
                      type="submit"
                      disabled={!answer.trim() || feedback.loading}
                      className="inline-flex items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {feedback.loading ? "Getting AI feedback…" : "Get AI feedback"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndNext}
                      className="inline-flex items-center rounded-full bg-sky-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
                    >
                      Save & next question
                    </button>
                    {saveMessage && (
                      <span className="text-[10px] text-emerald-700">
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>
              </form>

              {/* AI feedback bubble */}
              {(feedback.text || feedback.error || autoHint) && (
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
                  <div className="rounded-2xl bg-slate-900 text-slate-50 px-3 py-3 shadow-md shadow-slate-900/40">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
                      HirePath AI feedback
                    </p>
                    {feedback.error && (
                      <p className="mt-1 text-[11px] text-rose-300">
                        {feedback.error}
                      </p>
                    )}
                    {feedback.text && (
                      <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed">
                        {feedback.text}
                      </p>
                    )}
                    {!feedback.text && !feedback.error && autoHint && (
                      <p className="mt-1 text-[11px] text-slate-100">
                        {autoHint}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-slate-50 to-sky-50 px-3 py-3 text-[11px] text-slate-600 ring-1 ring-sky-100">
                    <p className="mb-1 text-[11px] font-semibold text-slate-900">
                      Quick health check
                    </p>
                    <p className="text-[11px]">
                      <span className="font-semibold">Answer strength: </span>
                      {estimatedScoreLabel}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Aim for clear structure, concrete numbers, and what you
                      personally owned. Practice here, then copy your best
                      responses into recruiter screens and onsite loops.
                    </p>
                  </div>
                </div>
              )}

              {/* Bullet result */}
              {(bulletFeedback.text || bulletFeedback.error) && (
                <div className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900 ring-1 ring-emerald-200">
                  <p className="mb-1 text-[11px] font-semibold text-emerald-800">
                    Resume bullet from this answer
                  </p>
                  {bulletFeedback.error ? (
                    <p className="text-rose-600">{bulletFeedback.error}</p>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {bulletFeedback.text}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-emerald-700">
                    Tip: save your strongest bullets, then use the Tailor page
                    to align them with real JDs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Timer + stats + PDF */}
          <div className="space-y-4">
            {/* Timer card */}
            <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-900 px-4 py-4 text-slate-50 shadow-md shadow-slate-900/40">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
                Time for this question
              </p>

              <div className="relative mb-2 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl" />
                <svg
                  className="relative h-28 w-28 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-700"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-sky-400 transition-all duration-300 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={
                      (1 - timerProgress) * (2 * Math.PI * 42)
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold">
                    {formattedTime}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Aim for 3–5 minutes
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-600"
                >
                  {timerRunning ? "Pause timer" : "Resume timer"}
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSecondsLeft(QUESTION_SECONDS_DEFAULT)}
                  className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700"
                >
                  Reset
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                You can keep speaking after the timer, but practice getting to
                the point.
              </p>
            </div>

            {/* Progress card */}
            <div className="rounded-3xl bg-white/95 px-4 py-3 text-[11px] text-slate-700 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
                Session progress
              </p>
              <div className="mb-2 flex items-center justify-between">
                <p>
                  <span className="font-semibold text-slate-900">
                    {completed}/{totalQuestions}
                  </span>{" "}
                  questions answered
                </p>
                <p className="text-[10px] text-slate-400">
                  Mode: {focusMode} · Role: {targetRole}
                </p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 transition-all duration-300"
                  style={{ width: `${sessionProgressPct}%` }}
                />
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                Save your best answers. They’re stored in History and can be
                exported as a PDF transcript for future prep.
              </p>
            </div>

            {/* Next step + PDF card */}
            <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-sky-50 px-4 py-3 text-[11px] text-slate-700 ring-1 ring-sky-100">
              <p className="mb-1 text-[11px] font-semibold text-slate-900">
                Next step after practice
              </p>
              <p className="text-[11px] text-slate-600">
                Take your best answers, turn them into 3–5 strong bullets, and
                use the <span className="font-semibold">Tailor resume</span>{" "}
                page to align them with live job descriptions from your inbox.
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Practice here → copy bullets → paste into Tailor → download
                ATS-friendly PDF → send to recruiters.
              </p>

              <button
                type="button"
                onClick={handleDownloadTranscriptPdf}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700"
              >
                Download session transcript (PDF)
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
