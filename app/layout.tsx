// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Nav from "./components/ui/Nav";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "HirePath.ai",
  description: "Your path to the perfect job.",
  icons: {
    icon: "/favicon.ico", // optional – add a favicon if you have one
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-white dark:bg-neutral-950">
        <Providers>
          {/* Global top navigation */}
          <Nav />
          {/* Page content */}
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
