"use client";

import Link from "next/link";
import { useState } from "react";

type Mode = "fixed" | "buggy";

export default function Landing() {
  const [mode, setMode] = useState<Mode>("fixed");
  const other: Mode = mode === "fixed" ? "buggy" : "fixed";

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">App Health Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          A miniature legacy Next.js app with three flagged features. Use the toggle to flip
          every demo between its buggy and fixed variants — like a side-by-side code review.
          Issue tracker and live error feed live at <Link className="text-emerald-700" href="/health">/health</Link>.
        </p>
      </section>

      <section className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-medium">Demo mode</span>
        <span
          data-testid="mode-indicator"
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
            mode === "fixed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {mode}
        </span>
        <button
          data-testid="mode-toggle"
          onClick={() => setMode(other)}
          className="ml-auto rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
        >
          Switch to {other}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          testId="upload-link"
          href={`/upload?mode=${mode}`}
          title="File upload"
          summary="Drop a binary larger than 10MB and see how validation breaks (or holds) in each mode."
          bugTag="ISSUE-101 · size guard"
        />
        <FeatureCard
          testId="chat-link"
          href={`/chat?mode=${mode}`}
          title="Chat"
          summary="Scroll-position regression on re-render — the kind of bug nobody files but everyone hates."
          bugTag="ISSUE-102 · scroll pin"
        />
        <FeatureCard
          testId="dashboard-link"
          href={`/dashboard?mode=${mode}`}
          title="Dashboard"
          summary="Three widgets, one waterfall fetch chain. Compare TTI before and after parallelizing."
          bugTag="ISSUE-103 · waterfall"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  testId,
  href,
  title,
  summary,
  bugTag,
}: {
  testId: string;
  href: string;
  title: string;
  summary: string;
  bugTag: string;
}) {
  return (
    <Link
      data-testid={testId}
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{summary}</p>
      <div className="mt-3 inline-flex rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        {bugTag}
      </div>
    </Link>
  );
}
