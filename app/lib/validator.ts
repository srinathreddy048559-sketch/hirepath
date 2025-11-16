// app/lib/validator.ts
import { z } from "zod";

// --- Structured result the API will return & we save in DB ---
export const TailoredResultSchema = z.object({
  summary_bullets: z.array(z.string()).default([]),

  email: z.object({
    subject: z.string().default(""),
    body: z.string().default(""),
  }).default({ subject: "", body: "" }),

  resume: z.object({
    header: z.object({
      name: z.string().default(""),
      title: z.string().default(""),
      location: z.string().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      links: z.array(z.string()).default([]),
    }).default({} as any),

    summary: z.string().default(""),

    skills: z.array(z.object({
      category: z.string(),
      items: z.array(z.string())
    })).default([]),

    experience: z.array(z.object({
      company: z.string(),
      role: z.string(),
      location: z.string().optional(),
      start: z.string(), // e.g. "Feb 2022"
      end: z.string(),   // e.g. "Present"
      bullets: z.array(z.string()).default([]),
    })).default([]),

    projects: z.array(z.object({
      name: z.string(),
      bullets: z.array(z.string())
    })).default([]),

    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      year: z.string().optional()
    })).default([]),
  }).default({} as any),
});

export type TailoredResult = z.infer<typeof TailoredResultSchema>;

// handy coercions
export const toText = (v: unknown): string =>
  Array.isArray(v) ? v.join("\n") : (v ?? "") + "";
