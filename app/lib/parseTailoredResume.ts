// app/lib/parseTailoredResume.ts
export type ResumeData = {
  name: string;
  title?: string;
  contact?: string;
  summary?: string;
  skills?: string[];
  experience?: { header: string; bullets: string[] }[];
  education?: string[];
  projects?: { header: string; text: string }[];
  raw?: string; // keep original
};

function clean(s: string) {
  return s.replace(/\r/g, "").trim();
}

export function parseTailoredResume(text: string): ResumeData {
  const raw = clean(text);
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  // naive name + title + contact from first 3–4 lines
  const name = lines[0] || "Candidate";
  const second = lines[1] || "";
  const third = lines[2] || "";
  const fourth = lines[3] || "";
  const likelyTitle = /engineer|developer|scientist|analyst|architect|lead|manager/i.test(second) ? second : "";
  const likelyContact = [third, fourth].filter(Boolean).join(" • ");

  // split sections by common headings
  const sections = raw.split(/\n\s*(SUMMARY|PROFILE|CORE SKILLS|SKILLS|PROFESSIONAL EXPERIENCE|EXPERIENCE|EDUCATION|PROJECTS|SELECT PROJECTS)\s*\n/i);

  // helper to get by name
  const get = (...names: string[]) => {
    for (let i = 1; i < sections.length; i += 2) {
      const h = sections[i].toUpperCase().trim();
      if (names.some((n) => h === n.toUpperCase())) {
        return clean(sections[i + 1] || "");
      }
    }
    return "";
  };

  const summary = get("SUMMARY", "PROFILE");
  const skillBlock = get("CORE SKILLS", "SKILLS");
  const expBlock = get("PROFESSIONAL EXPERIENCE", "EXPERIENCE");
  const eduBlock = get("EDUCATION");
  const projBlock = get("PROJECTS", "SELECT PROJECTS");

  // skills → split by bullets, commas, dots, middots
  const skills = skillBlock
    ? skillBlock.split(/[\n•\-–,•·]+/).map(s => s.trim()).filter(s => s.length > 1)
    : [];

  // experience → groups separated by blank lines or double newlines
  const experience: ResumeData["experience"] = [];
  if (expBlock) {
    const chunks = expBlock.split(/\n{2,}/);
    for (const c of chunks) {
      const [firstLine, ...rest] = c.split("\n");
      if (!firstLine) continue;
      const bullets = rest
        .map((l) => l.replace(/^[-•–]\s?/, "").trim())
        .filter(Boolean);
      experience.push({ header: firstLine.trim(), bullets: bullets.length ? bullets : [] });
    }
  }

  const education = eduBlock
    ? eduBlock.split(/\n+/).map((l) => l.replace(/^[-•–]\s?/, "").trim()).filter(Boolean)
    : [];

  const projects: ResumeData["projects"] = [];
  if (projBlock) {
    const chunks = projBlock.split(/\n{2,}/);
    for (const c of chunks) {
      const [h, ...r] = c.split("\n");
      if (!h) continue;
      projects.push({ header: h.trim(), text: r.join(" ").trim() });
    }
  }

  return {
    name,
    title: likelyTitle || undefined,
    contact: likelyContact || undefined,
    summary: summary || undefined,
    skills,
    experience,
    education,
    projects,
    raw,
  };
}
