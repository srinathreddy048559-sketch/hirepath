import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-white">
        <nav className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-3 font-semibold">
            Hire<span className="text-blue-600">Path</span>.ai
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
