export type ResumeSectionKind =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education";

export type SummarySection   = { kind: "summary";   bullets: string[] };
export type SkillsSection    = { kind: "skills";    bullets: string[] };
export type ExperienceSection= { kind: "experience";bullets: string[] };
export type ProjectsSection  = { kind: "projects";  bullets: string[] };
export type EducationSection = { kind: "education"; bullets: string[] };

export type ResumeSection =
  | SummarySection
  | SkillsSection
  | ExperienceSection
  | ProjectsSection
  | EducationSection;

export type TailoredResume = {
  name: string;        // never undefined
  contact?: string;
  sections: ResumeSection[];
};
