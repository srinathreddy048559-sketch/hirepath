import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <div className="font-extrabold text-lg">
          <span className="text-gray-900">Hire</span>
          <span className="text-indigo-600">Path</span>
          <span className="text-gray-900">.ai</span>
        </div>

        <nav className="text-sm flex gap-6 text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/history">History</Link>
          <Link href="/about">About</Link>
        </nav>

        <Link
          href="/"
          className="hidden sm:inline-block bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          Get Started →
        </Link>
      </div>
    </header>
  );
}