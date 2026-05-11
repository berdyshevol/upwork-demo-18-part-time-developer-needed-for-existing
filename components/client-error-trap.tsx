"use client";

import { useEffect } from "react";

export function ClientErrorTrap() {
  useEffect(() => {
    function record(message: string, stack?: string) {
      try {
        const raw = localStorage.getItem("error-feed");
        const list = raw ? JSON.parse(raw) : [];
        list.unshift({
          id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ts: Date.now(),
          source: "client",
          message,
          stack,
        });
        localStorage.setItem("error-feed", JSON.stringify(list.slice(0, 50)));
        window.dispatchEvent(new CustomEvent("error-feed:update"));
      } catch {
        // localStorage may be unavailable — fail silently.
      }
    }

    function onError(ev: ErrorEvent) {
      record(ev.message ?? "Unknown client error", ev.error?.stack);
    }
    function onRejection(ev: PromiseRejectionEvent) {
      record(`Unhandled rejection: ${String(ev.reason)}`);
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
