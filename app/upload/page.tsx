"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const MAX_BYTES = 10 * 1024 * 1024;

function UploadInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "buggy" ? "buggy" : "fixed";

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setResult("Pick a file first.");
      return;
    }
    if (mode === "fixed" && file.size > MAX_BYTES) {
      setResult(`Rejected: file is ${(file.size / 1024 / 1024).toFixed(1)} MB — exceeds the 10MB limit.`);
      return;
    }
    setResult(`Uploaded ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upload</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
            mode === "fixed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {mode}
        </span>
      </header>

      <p className="text-sm text-slate-600">
        The intended limit is 10MB. In <code>buggy</code> mode the size check is bypassed and oversize files succeed.
        Open <code>?mode=fixed</code> to see the guard in action.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        <button
          data-testid="upload-submit"
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Upload
        </button>
        <div data-testid="upload-result" className="text-sm text-slate-700">
          {result}
        </div>
      </form>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <UploadInner />
    </Suspense>
  );
}
