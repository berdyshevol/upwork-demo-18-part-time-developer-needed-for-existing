# App Health Dashboard

Triage demo for an "existing" Next.js app. Three intentionally buggy features
(file upload, chat, slow dashboard) plus a `/health` issue tracker so a client
can see how a part-time dev would surface, document, and close findings.

## What this demonstrates

- Jumping into an existing app and **flagging bugs with repro + root cause**, not just fixing them blind.
- Side-by-side **buggy vs. fixed** views via a URL flag (`?mode=buggy` / `?mode=fixed`).
- A lightweight in-memory **error feed** that captures client-side errors via `window.onerror`.
- A toggleable **"Fix Applied"** status per issue — what a triage hand-off looks like before a PR.

## Routes

- `/` — landing with the three demo features and the global buggy/fixed toggle
- `/upload` — file upload (bug: silently accepts files >10MB)
- `/chat` — chat UI (bug: scroll snaps to top on every re-render)
- `/dashboard` — three widgets (bug: serial waterfall fetch)
- `/health` — issue tracker with severity / repro / root cause + client error feed

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # Playwright behavioral tests
pnpm build
```

## Reproduce each bug

1. Upload — `/upload?mode=buggy`, choose any file >10MB, click Upload — the toast says "Uploaded" despite the size violation.
2. Chat — `/chat?mode=buggy`, scroll inside the message list, send a new message — the scroll snaps to top.
3. Dashboard — `/dashboard?mode=buggy`, watch the three widgets fill in one-by-one; total load > 700ms vs. ~270ms in parallel mode.
4. Error feed — open `/health`, click **Trigger client error** — the captured error appears in the feed within 2s.

## Deploy URL

_(replace after deploy)_ — https://<vercel-alias>.vercel.app
