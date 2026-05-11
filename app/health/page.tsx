"use client";

import { useEffect, useState } from "react";
import { seedErrors, seedIssues, type ErrorLog, type Issue } from "../../lib/seed";

export default function HealthPage() {
  const [issues, setIssues] = useState<Issue[]>(seedIssues);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function read(): ErrorLog[] {
      try {
        const raw = localStorage.getItem("error-feed");
        const list: ErrorLog[] = raw ? JSON.parse(raw) : [];
        return list;
      } catch {
        return [];
      }
    }
    function refresh() {
      const clientErrors = read();
      setErrors([...clientErrors, ...seedErrors]);
    }
    refresh();
    window.addEventListener("error-feed:update", refresh);
    const id = setInterval(refresh, 500);
    return () => {
      window.removeEventListener("error-feed:update", refresh);
      clearInterval(id);
    };
  }, []);

  function toggleFix(id: string) {
    setIssues((list) =>
      list.map((i) => (i.id === id ? { ...i, status: i.status === "fixed" ? "open" : "fixed" } : i))
    );
  }

  function triggerClientError() {
    setTimeout(() => {
      throw new Error("Synthetic client error from /health trigger button");
    }, 0);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Issue tracker</h1>
        <p className="mt-1 text-sm text-slate-600">
          Three flagged issues with repro steps and suspected root cause. Flip "Fix Applied" to mark a finding ready for the PR.
        </p>
      </section>

      <section className="space-y-3">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onToggle={() => toggleFix(issue.id)} />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Error feed</h2>
          <button
            data-testid="trigger-client-error"
            onClick={triggerClientError}
            className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Trigger client error
          </button>
        </div>
        <div data-testid="error-feed" className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {!mounted ? (
            <div className="px-4 py-3 text-sm text-slate-500">Loading feed…</div>
          ) : errors.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No errors captured yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {errors.map((e) => (
                <li key={e.id} data-testid="error-row" className="flex gap-3 px-4 py-2 text-sm">
                  <span className="font-mono text-xs text-slate-500">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                      e.source === "client" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {e.source}
                  </span>
                  <span className="flex-1 truncate">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function IssueCard({ issue, onToggle }: { issue: Issue; onToggle: () => void }) {
  const sevClass =
    issue.severity === "high"
      ? "bg-rose-100 text-rose-800"
      : issue.severity === "medium"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";

  return (
    <article
      data-testid="issue-row"
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <header className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-slate-500">{issue.id}</span>
        <span
          data-testid="issue-severity"
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${sevClass}`}
        >
          {issue.severity}
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-700">
          {issue.feature}
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{issue.title}</h3>
        <span
          data-testid="issue-status"
          className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
            issue.status === "fixed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
          }`}
        >
          {issue.status === "fixed" ? "Fix Applied ✓" : "Open"}
        </span>
        <button
          data-testid="issue-fix-toggle"
          onClick={onToggle}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          Toggle fix
        </button>
      </header>
      <dl className="mt-3 space-y-1 text-xs text-slate-700">
        <div>
          <dt className="inline font-semibold">Repro: </dt>
          <dd data-testid="issue-repro" className="inline whitespace-pre-wrap">{issue.repro}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Suspected root cause: </dt>
          <dd data-testid="issue-rootcause" className="inline">{issue.rootCause}</dd>
        </div>
      </dl>
    </article>
  );
}
