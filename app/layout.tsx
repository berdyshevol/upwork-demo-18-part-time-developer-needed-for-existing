import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ClientErrorTrap } from "../components/client-error-trap";

export const metadata: Metadata = {
  title: "App Health Dashboard",
  description: "Triage demo: surface bugs and perf issues in an existing Next.js app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientErrorTrap />
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
              App Health Dashboard
            </Link>
            <ul className="flex gap-4 text-sm text-slate-600">
              <li><Link href="/upload" className="hover:text-slate-900">Upload</Link></li>
              <li><Link href="/chat" className="hover:text-slate-900">Chat</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
              <li><Link href="/health" className="font-medium text-emerald-700 hover:text-emerald-800">/health</Link></li>
            </ul>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-6 text-xs text-slate-500">
          Demo prototype — triage view, in-memory data, no auth.
        </footer>
      </body>
    </html>
  );
}
