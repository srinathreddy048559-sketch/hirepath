// components/types.ts

export type Bullet = string;

export type Section =
  | { kind: "summary"; text: string }
  | { kind: "skills"; items: string[] }
  | { kind: "experience"; items: Array<{ role: string; company: string; dates: string; bullets: Bullet[] }> }
  | { kind: "education"; items: Array<{ school: string; degree: string; year: string }> };

export type Resume = {
  name: string;
  location?: string;
  email?: string;
  github?: string;
  sections: Section[];
};

export type HistoryItem = {
  id: string;
  title: string;
  resume: Resume;
  createdAt: string; // ISO string
};

export type ResumeResponse = {
  resume: Resume;
  createdAt: string; // meta about when server generated the resume
};
