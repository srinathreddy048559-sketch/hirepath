import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { parsed, jd } = await req.json();

    if (!parsed || !jd) {
      return NextResponse.json({ error: "parsed and jd are required" }, { status: 400 });
    }

    const profile = extractProfile(parsed);
    const keywords = extractKeywords(jd);

    const md = buildMarkdown(profile, keywords, parsed, jd);

    return NextResponse.json({ ok: true, markdown: md });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Generate failed" }, { status: 400 });
  }
}

/** ---------- helpers ---------- **/

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: string[];
  skills: string[]; // best-effort
  headline?: string; // first line or derived
};

function extractProfile(text: string): Profile {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // heuristics
  const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
  const phone = (text.match(/(\+?\d[\d\s\-().]{8,}\d)/) || [])[0];
  const links = Array.from(new Set(
    (text.match(/\b(https?:\/\/|www\.)[^\s)]+/gi) || [])
      .map(x => x.replace(/[),.;]+$/, ""))
  ));

  // name = first line that doesn't contain email/phone/url and is not ALL CAPS junk
  let name: string | undefined;
  for (const l of lines.slice(0, 8)) {
    if (email && l.includes(email)) continue;
    if (phone && l.includes(phone)) continue;
    if (/(https?:\/\/|www\.)/i.test(l)) continue;
    // reasonable name line: 2–5 words, starts with letter
    if (/^[A-Za-z].{1,60}$/.test(l) && l.split(/\s+/).length <= 6) {
      name = l.replace(/\s{2,}/g, " ").trim();
      break;
    }
  }

  // location: a line that looks like "City, ST" or has a US state abbr
  const location = lines.find(l => /,\s*[A-Z]{2}(?:\s+\d{5})?/.test(l));

  // headline: second candidate line near name
  const headline = lines
    .slice(0, 10)
    .find(l =>
      l !== name &&
      !/(https?:\/\/|www\.)/i.test(l) &&
      !l.includes(email || "") &&
      !l.includes(phone || "") &&
      l.length > 6 &&
      l.split(/\s+/).length <= 12
    );

  // skills: grab from a "Skills" section if present, else infer top tokens
  let skills: string[] = [];
  const skillsIdx = lines.findIndex(l => /^skills\b/i.test(l));
  if (skillsIdx >= 0) {
    const bucket: string[] = [];
    for (let i = skillsIdx + 1; i < Math.min(lines.length, skillsIdx + 8); i++) {
      const row = lines[i];
      if (/^[A-Z][A-Za-z\s]{0,20}:$/.test(row)) break; // next section?
      bucket.push(row);
    }
    skills = tokenize(bucket.join(", ")).slice(0, 24);
  }
  if (skills.length === 0) {
    skills = inferSkills(text).slice(0, 24);
  }

  return {
    name,
    email,
    phone,
    location,
    links,
    skills,
    headline
  };
}

function extractKeywords(text: string): string[] {
  const words = (text || "").toLowerCase().match(/[a-z][a-z0-9+\-#\.]{2,}/g) ?? [];
  const stop = new Set([
    "and","the","with","for","you","are","that","this","job","role","will","work",
    "team","we","our","your","on","of","to","in","a","an","as","be"
  ]);
  const freq = new Map<string, number>();
  for (const w of words) if (!stop.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k])=>k);
}

function buildMarkdown(p: Profile, keywords: string[], parsed: string, jd: string): string {
  const headerName = p.name || "Your Name";
  const contact = [
    p.location,
    p.email,
    p.phone,
    ...p.links
  ].filter(Boolean).join(" • ");

  const skillsLine = p.skills.length ? p.skills.join(", ") : "Python, SQL, ML, LLMs, RAG";

  return [
    `# ${headerName}`,
    p.headline ? `${p.headline}` : `AI/ML Engineer`,
    contact && `\n${contact}`,
    "",
    "## Summary",
    `Results-driven engineer. This version is **tailored** to the provided JD.`,
    "",
    "## Skills",
    skillsLine,
    "",
    "## Tailored Highlights (from JD)",
    keywords.length ? keywords.map(k => `- ${k}`).join("\n") : "- (JD keywords not detected)",
    "",
    "## Experience (from your resume)",
    "_This section is condensed. The full text of your uploaded resume is included below for reference._",
    "",
    "## Full Parsed Resume (Reference Only — remove before sending)",
    "```",
    parsed.trim(),
    "```",
    "",
    "## Job Description (Reference)",
    "```",
    jd.trim(),
    "```"
  ].filter(Boolean).join("\n");
}

function tokenize(s: string): string[] {
  return (s.match(/[A-Za-z][A-Za-z0-9+\-#\.]{1,}/g) || [])
    .map(w => w.replace(/\.$/, ""))
    .filter(w => w.length >= 2);
}

function inferSkills(text: string): string[] {
  // crude dictionary to bubble up common tech terms
  const dict = [
    "python","sql","pandas","numpy","pytorch","tensorflow","scikit-learn","spark",
    "aws","gcp","azure","docker","kubernetes","airflow","mlflow","terraform",
    "langchain","rag","faiss","pinecone","vertex","sagemaker","fastapi","react",
    "postgres","bigquery","git","bash","linux"
  ];
  const lower = text.toLowerCase();
  const seen: string[] = [];
  for (const k of dict) if (lower.includes(k)) seen.push(k);
  return seen;
}
