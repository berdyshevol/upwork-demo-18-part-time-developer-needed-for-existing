"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Widget = { id: string; label: string; value: number; loadedMs: number };

const WIDGETS: Omit<Widget, "loadedMs">[] = [
  { id: "w1", label: "Active sessions", value: 142 },
  { id: "w2", label: "Errors / min", value: 4 },
  { id: "w3", label: "Avg TTI (ms)", value: 712 },
];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function DashboardInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "buggy" ? "buggy" : "fixed";

  const [loaded, setLoaded] = useState<Widget[]>([]);
  const [totalMs, setTotalMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded([]);
    setTotalMs(null);

    const start = performance.now();

    async function load() {
      // Each "fetch" is 250ms. Buggy = serial waterfall. Fixed = parallel.
      const fetches = WIDGETS.map(async (w) => {
        await delay(250);
        return { ...w, loadedMs: Math.round(performance.now() - start) };
      });

      if (mode === "fixed") {
        const all = await Promise.all(fetches);
        if (!cancelled) setLoaded(all);
      } else {
        const results: Widget[] = [];
        for (const f of fetches) {
          const w = await f;
          if (cancelled) return;
          results.push(w);
          setLoaded([...results]);
        }
      }
      if (!cancelled) setTotalMs(Math.round(performance.now() - start));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
            mode === "fixed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {mode}
        </span>
      </header>

      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="font-medium">Fetch strategy:</span>
        <span data-testid="fetch-strategy" className="font-mono">
          {mode === "fixed" ? "parallel" : "waterfall"}
        </span>
        <span className="ml-auto text-slate-500">
          Total load: <span className="font-mono">{totalMs === null ? "…" : `${totalMs}ms`}</span>
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {WIDGETS.map((w) => {
          const got = loaded.find((x) => x.id === w.id);
          return (
            <div
              key={w.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
              data-testid={`widget-${w.id}`}
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">{w.label}</div>
              <div className="mt-1 text-2xl font-semibold">
                {got ? got.value : <span className="text-slate-300">…</span>}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                {got ? `Loaded @ ${got.loadedMs}ms` : "Loading…"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <DashboardInner />
    </Suspense>
  );
}
