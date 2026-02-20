// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Nav from "./components/ui/Nav";
import { Providers } from "@/lib/providers";
import FloatingChatButton from "./components/ui/FloatingChatButton";
import FloatingChat from "./components/ui/FloatingChat";

export const metadata: Metadata = {
  title: "HirePath.ai",
  description: "Your path to the perfect job.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-white dark:bg-neutral-950 relative">
        <Providers>
          {/* Global Navigation */}
          <Nav />

          {/* Page Content */}
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

          {/* Floating Chat (always loaded) */}
          <FloatingChatButton />
          <FloatingChat />
        </Providers>
      </body>
    </html>
  );
}
