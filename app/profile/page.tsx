// app/profile/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type Skill = {
  name: string;
  years: number;
  current?: boolean;
};

type Profile = {
  name: string;
  email: string;
  headline: string;
  phone: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  workAuth: string;
  shortSummary: string;
  resumeFileName: string;
  preferredJobTitle: string;
  preferredLocations: string;
  preferredWorkStyle: string;
  linkedinUrl: string;
  githubUrl: string;
  profileVisibility: boolean;
  skills: Skill[];
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment: string | null;
  description: string;
  requirements: string;
};

// ---------- Default empty profile ----------
const EMPTY_PROFILE: Profile = {
  name: "",
  email: "",
  headline: "",
  phone: "",
  locationCity: "",
  locationState: "",
  locationCountry: "",
  workAuth: "",
  shortSummary: "",
  resumeFileName: "",
  preferredJobTitle: "",
  preferredLocations: "",
  preferredWorkStyle: "",
  linkedinUrl: "",
  githubUrl: "",
  profileVisibility: true,
  skills: [
    { name: "Machine Learning", years: 4, current: true },
    { name: "Generative AI / LLMs", years: 3, current: true },
    { name: "Python", years: 5, current: true },
    { name: "MLOps (Docker, K8s, CI/CD)", years: 3, current: true },
    { name: "Cloud (AWS / GCP)", years: 4, current: true },
  ],
};

// ---------- Map DB user -> UI profile ----------
function mapUserToProfile(user: any): Profile {
  if (!user) return EMPTY_PROFILE;

  // location stored as single string in DB, e.g. "Manchester, CT"
  const rawLocation: string = user.location ?? "";
  const [city, state] = rawLocation.split(",").map((s) => s.trim());

  return {
    ...EMPTY_PROFILE,
    name: user.name ?? "",
    email: user.email ?? "",
    headline: user.headline ?? "",
    phone: user.phone ?? "",
    locationCity: city ?? "",
    locationState: state ?? "",
    locationCountry: "United States", // can edit in UI
    workAuth: user.workAuth ?? "",
    shortSummary: user.shortSummary ?? "",
    resumeFileName: user.resumeUrl ?? "",
    preferredJobTitle: user.preferredRoles ?? "",
    preferredLocations: user.preferredLocations ?? "",
    preferredWorkStyle: "Full-time · Remote or Hybrid",
    linkedinUrl: user.linkedin ?? "",
    githubUrl: user.github ?? "",
    profileVisibility: true,
    skills: EMPTY_PROFILE.skills,
  };
}

// ---------- Completeness ----------
function computeCompleteness(p: Profile): number {
  const checks = [
    p.headline,
    p.shortSummary,
    p.phone,
    p.locationCity || p.locationCountry,
    p.preferredJobTitle,
    p.preferredLocations,
    p.preferredWorkStyle,
    p.linkedinUrl,
    p.githubUrl,
    p.skills.length ? "skills" : "",
    p.resumeFileName,
  ];

  const filled = checks.filter(
    (v) => !!v && v.toString().trim().length > 0
  ).length;
  const pct = Math.min(100, Math.round((filled / checks.length) * 100));
  return pct || 10;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAuthLoading = status === "loading";
  const isAuthed = !!session?.user;

  // ---------- Load profile + jobs ----------
  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // Load profile
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();

        // NOTE: /api/profile should return { ok: true, profile: user }
        if (data?.ok && data.profile) {
          setProfile(mapUserToProfile(data.profile));
        } else {
          setProfile(EMPTY_PROFILE);
        }

        // Load jobs for recommendations
        const jobsRes = await fetch("/api/jobs", { cache: "no-store" });
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs ?? []);
      } catch (e) {
        console.error("Failed to load profile/jobs", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthed]);

  // ---------- Save profile ----------
  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to save profile");
      }

      setMessage("Profile updated ✔");
      setTimeout(() => setMessage(null), 2500);
    } catch (e: any) {
      console.error(e);
      setMessage(e.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Sync with HirePath ----------
  async function handleSync() {
    try {
      setSyncing(true);
      setMessage(null);

      const res = await fetch("/api/profile/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Sync failed");
      }

      setProfile((prev) => ({
        ...prev,
        shortSummary: data.profile?.shortSummary ?? prev.shortSummary,
        preferredJobTitle:
          data.profile?.preferredJobTitle ?? prev.preferredJobTitle,
        resumeFileName:
          data.profile?.resumeFileName ?? prev.resumeFileName,
      }));

      setMessage("Synced with your latest HirePath resume ✔");
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      console.error(e);
      setMessage(e.message || "Could not sync profile");
    } finally {
      setSyncing(false);
    }
  }

  // ---------- Handle resume upload (label only for now) ----------
  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfile((prev) => ({
      ...prev,
      resumeFileName: file.name,
    }));
    setMessage("Resume name updated (local only for now)");
    setTimeout(() => setMessage(null), 2000);
  }

  function triggerResumeUpload() {
    fileInputRef.current?.click();
  }

  // ---------- Skills helpers ----------
  function updateSkill(index: number, patch: Partial<Skill>) {
    setProfile((prev) => {
      const copy = [...prev.skills];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, skills: copy };
    });
  }

  function addSkill() {
    setProfile((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { name: "New skill", years: 1, current: true },
      ],
    }));
  }

  function removeSkill(index: number) {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  // ---------- Job recommendations ----------
  const recommendedJobs: Job[] = (() => {
    if (!jobs.length || !profile.skills.length) return [];
    const skillNames = profile.skills.map((s) => s.name.toLowerCase());

    const scored = jobs
      .map((job) => {
        const haystack = (
          job.title +
          " " +
          job.description +
          " " +
          job.requirements
        ).toLowerCase();
        let score = 0;
        for (const s of skillNames) {
          if (s && haystack.includes(s)) score += 1;
        }
        return { job, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.job);

    return scored;
  })();

  const completeness = computeCompleteness(profile);

  // ---------- Loading states ----------
  if (isAuthLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50/80 flex items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm text-sm text-slate-600">
          Loading your HirePath profile…
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-50/80 flex items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm text-sm text-slate-700">
          Please log in to view your profile.
        </div>
      </main>
    );
  }

  // ---------- Main UI ----------
  return (
    <main className="min-h-screen bg-slate-50 pb-12 pt-6">
      <div className="mx-auto max-w-6xl px-4 space-y-6">
        {/* Breadcrumb */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
          HIREPATH · PROFILE
        </p>

        {/* --- HERO CARD --- */}
        <section className="rounded-[1.8rem] bg-gradient-to-r from-sky-950 via-sky-900 to-sky-800 px-6 py-5 text-slate-50 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-700 text-lg font-semibold shadow-lg">
                {profile.name
                  ? profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "HP"}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl font-semibold">
                  {profile.name || session.user?.name || "Your HirePath profile"}
                </h1>
                <p className="text-xs text-sky-100">
                  {profile.headline ||
                    "Add a headline so recruiters know your focus."}
                </p>
                <p className="text-[11px] text-sky-200">
                  {profile.locationCity
                    ? `${profile.locationCity}, ${
                        profile.locationState || ""
                      } ${profile.locationCountry || ""}`
                    : "Add your location for better matches."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              {/* Profile visibility + completeness */}
              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="uppercase tracking-[0.18em] text-sky-200">
                    Profile visibility
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        profileVisibility: !p.profileVisibility,
                      }))
                    }
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition ${
                      profile.profileVisibility
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                        : "border-slate-500 bg-slate-800/60 text-slate-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        profile.profileVisibility
                          ? "bg-emerald-300"
                          : "bg-slate-400"
                      }`}
                    />
                    {profile.profileVisibility
                      ? "ON – recruiters can find you"
                      : "Hidden"}
                  </button>
                </div>

                {/* completeness bar */}
                <div className="w-56">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-sky-100">
                    <span>Profile completeness</span>
                    <span>{completeness}% complete</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sky-900/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-300 to-indigo-300"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sync button */}
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center justify-center rounded-full bg-sky-100/90 px-3.5 py-1 text-[11px] font-semibold text-sky-900 shadow-sm hover:bg-white disabled:opacity-70"
              >
                {syncing ? "Syncing…" : "Sync with HirePath"}
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 shadow-sm">
            {message}
          </div>
        )}

        {/* --- MAIN GRID --- */}
        <div className="grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* About & contact */}
            <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                About & contact
              </h2>

              <div className="grid gap-3 text-xs md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Email address
                  </label>
                  <input
                    disabled
                    value={profile.email || session.user?.email || ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Phone number
                  </label>
                  <input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="(000) 000-0000"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Headline
                  </label>
                  <input
                    value={profile.headline}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, headline: e.target.value }))
                    }
                    placeholder="Machine learning / AI engineer"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Work authorization
                  </label>
                  <input
                    value={profile.workAuth}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, workAuth: e.target.value }))
                    }
                    placeholder="Employment Authorization Document (EAD)"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    City
                  </label>
                  <input
                    value={profile.locationCity}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        locationCity: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="flex gap-2 space-y-1">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">
                      State
                    </label>
                    <input
                      value={profile.locationState}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          locationState: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">
                      Country
                    </label>
                    <input
                      value={profile.locationCountry}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          locationCountry: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Short summary */}
              <div className="mt-4 space-y-1">
                <label className="text-[11px] font-medium text-slate-500">
                  Short professional summary
                </label>
                <textarea
                  rows={4}
                  value={profile.shortSummary}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      shortSummary: e.target.value,
                    }))
                  }
                  placeholder="AI/ML engineer focusing on Generative AI, LLMs, and MLOps — building production-ready models, RAG pipelines, and cloud-native workloads."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </section>

            {/* Resume + ideal job */}
            <section className="space-y-4 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Resume
                </h2>
                <button
                  type="button"
                  onClick={triggerResumeUpload}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600"
                >
                  Upload new resume
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleResumeChange}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">
                    {profile.resumeFileName || "No resume uploaded yet"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    This label will sync from your latest tailored resume.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleSync}
                    className="rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-600"
                  >
                    Tailor for a job
                  </button>
                </div>
              </div>

              <div className="grid gap-3 text-xs md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Preferred job title
                  </label>
                  <input
                    value={profile.preferredJobTitle}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        preferredJobTitle: e.target.value,
                      }))
                    }
                    placeholder="Machine Learning Engineer, Generative AI Engineer"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Preferred locations
                  </label>
                  <input
                    value={profile.preferredLocations}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        preferredLocations: e.target.value,
                      }))
                    }
                    placeholder="Remote · Seattle, WA · Austin, TX · Bay Area, CA"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    Work style
                  </label>
                  <input
                    value={profile.preferredWorkStyle}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        preferredWorkStyle: e.target.value,
                      }))
                    }
                    placeholder="Full-time · Remote or Hybrid"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Social profiles */}
            <section className="space-y-3 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Social profiles
              </h2>
              <p className="mb-1 text-[11px] text-slate-500">
                Add links so recruiters can quickly see your work.
              </p>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    LinkedIn
                  </label>
                  <input
                    value={profile.linkedinUrl}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        linkedinUrl: e.target.value,
                      }))
                    }
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">
                    GitHub
                  </label>
                  <input
                    value={profile.githubUrl}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        githubUrl: e.target.value,
                      }))
                    }
                    placeholder="https://github.com/username"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Skills snapshot */}
            <section className="space-y-3 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Skills snapshot
                </h2>
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600"
                >
                  + Add skill
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {profile.skills.map((skill, idx) => {
                  const pct = Math.max(
                    10,
                    Math.min(100, (skill.years / 10) * 100)
                  );
                  return (
                    <div
                      key={`${skill.name}-${idx}`}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <input
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(idx, { name: e.target.value })
                            }
                            className="w-40 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={skill.years}
                              onChange={(e) =>
                                updateSkill(idx, {
                                  years: Number(e.target.value || 0),
                                })
                              }
                              className="w-14 rounded-md border border-slate-200 px-1.5 py-1 text-[11px]"
                            />
                            <span className="text-[11px] text-slate-500">
                              yrs · Current
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSkill(idx)}
                              className="text-[11px] text-slate-400 hover:text-rose-500"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recommended roles */}
            <section className="space-y-3 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Recommended roles for you
              </h2>
              <p className="text-[11px] text-slate-500">
                Based on your skills and preferences from HirePath.
              </p>

              {recommendedJobs.length === 0 && (
                <p className="text-xs text-slate-500">
                  Once you start saving jobs and tailoring resumes, we’ll
                  surface the closest matches here.
                </p>
              )}

              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs hover:border-sky-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {job.company} · {job.location || "Remote"}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                        Suggested
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tip card */}
            <section className="rounded-[1.6rem] bg-slate-900 px-4 py-3 text-[11px] text-slate-100 shadow-sm">
              <p className="mb-1 font-semibold">
                Tip: sync HirePath with job boards
              </p>
              <p>
                Once you’re happy with your profile and tailored resume, you
                can reuse this data on Dice, LinkedIn, and other portals for
                faster applications.
              </p>
            </section>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </main>
  );
}
