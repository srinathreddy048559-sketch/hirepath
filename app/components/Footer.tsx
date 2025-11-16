"use client";

export default function Footer() {
  return (
    <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="flex items-center gap-1">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-800">HirePath.ai</span> — Empowering Careers with AI
        </p>
        <p className="flex items-center gap-1">
          <span className="text-red-500">❤️</span> Built by{" "}
          <span className="font-semibold text-gray-800">Srinath Reddy</span>
        </p>
      </div>
    </footer>
  );
}
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/srinathreddynalla"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.039-1.852-3.039-1.853 0-2.136 1.447-2.136 2.943v5.665H9.352V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.369-1.852 3.603 0 4.268 2.372 4.268 5.457v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.999 20.452H3.671V9h3.328v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729V22.27C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.27V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/srinathreddy-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.15 8.96 7.51 10.41.55.11.75-.24.75-.53 0-.26-.01-1.11-.02-2.02-3.05.66-3.69-1.3-3.69-1.3-.5-1.27-1.23-1.61-1.23-1.61-.99-.68.07-.67.07-.67 1.09.08 1.66 1.12 1.66 1.12.98 1.67 2.56 1.19 3.18.91.1-.72.38-1.19.69-1.46-2.43-.28-4.99-1.22-4.99-5.43 0-1.2.43-2.18 1.12-2.95-.11-.28-.49-1.41.11-2.95 0 0 .92-.29 3.01 1.12a10.5 10.5 0 0 1 5.48 0c2.08-1.41 3-1.12 3-1.12.6 1.54.22 2.67.11 2.95.69.77 1.12 1.75 1.12 2.95 0 4.22-2.57 5.15-5.01 5.43.39.33.74.98.74 1.98 0 1.42-.01 2.56-.01 2.91 0 .29.2.64.76.53C19.87 20.46 23.02 16.35 23.02 11.5 23.02 5.24 18.27.5 12 .5z"/>
            </svg>
          </a>
        </div>
      

