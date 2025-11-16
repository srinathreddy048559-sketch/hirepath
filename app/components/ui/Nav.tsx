"use client";

export default function Nav() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            H
          </span>
          <span className="text-lg font-semibold">HirePath</span>
        </div>
        <nav className="hidden gap-6 text-sm md:flex">
          <a href="#get-started" className="hover:underline">
            Get started
          </a>
          <a href="#how-it-works" className="hover:underline">
            How it works
          </a>
        </nav>
      </div>
    </header>
  );
}
