"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { seedChat, type ChatMessage } from "../../lib/seed";

function ChatInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "buggy" ? "buggy" : "fixed";

  const [messages, setMessages] = useState<ChatMessage[]>(seedChat);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fixed: pin scroll to bottom only on append; preserve user's scroll otherwise.
  useEffect(() => {
    if (!scrollRef.current) return;
    if (mode === "fixed") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      // Buggy: clobber to top on every render.
      scrollRef.current.scrollTop = 0;
    }
  }, [mode, messages.length]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { id: `m-${Date.now()}`, author: "user", text, ts: Date.now() },
    ]);
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
            mode === "fixed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {mode}
        </span>
      </header>

      <p className="text-sm text-slate-600">
        In <code>buggy</code> mode the scroll container resets to top on every render. In <code>fixed</code> mode it stays pinned to the latest message.
      </p>

      <div
        ref={scrollRef}
        data-testid="chat-scroll"
        data-pinned={mode === "fixed" ? "true" : "false"}
        className="h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4"
      >
        <ul className="space-y-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`flex ${m.author === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[75%] rounded-lg px-3 py-1.5 text-sm ${
                  m.author === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <ChatInner />
    </Suspense>
  );
}
