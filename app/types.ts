// app/types.ts

export type ContactSection = {
  kind: "contact";
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
};

export type SummarySection = {
  kind: "summary";
  text: string;
};

export type SkillsSection = {
  kind: "skills";
  items: string[];
};

export type ExperienceItem = {
  header: string;              // company | role | dates line
  bullets: string[];           // responsibility/impact bullets
};

export type ExperienceSection = {
  kind: "experience";
  items: ExperienceItem[];
};

export type ProjectItem = {
  header: string;              // project name | tech
  bullets: string[];           // what you did / outcomes
};

export type ProjectsSection = {
  kind: "projects";
  items: ProjectItem[];
};

export type EducationItem = {
  header: string;              // degree | school | year
};

export type EducationSection = {
  kind: "education";
  items: EducationItem[];
};

export type ResumeSection =
  | { kind: "summary"; items: string[] }
  | { kind: "skills"; items: string[] }
  | { kind: "experience"; items: string[] }
  | { kind: "projects"; items: string[] }
  | { kind: "education"; items: string[] };


// Minimal, structured payload we return to the UI per user
export type TailoredResume = {
  markdown: string;
  name?: string;
  contact?: string;
  sections?: ResumeSection[];  // canonical structured data
};
