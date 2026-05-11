export type Severity = "low" | "medium" | "high";
export type IssueStatus = "open" | "fixed";

export type Issue = {
  id: string;
  feature: "upload" | "chat" | "dashboard";
  title: string;
  severity: Severity;
  repro: string;
  rootCause: string;
  status: IssueStatus;
};

export type ErrorLog = {
  id: string;
  ts: number;
  source: "client" | "server";
  message: string;
  stack?: string;
};

export type ChatMessage = {
  id: string;
  author: "user" | "support";
  text: string;
  ts: number;
};

export const seedIssues: Issue[] = [
  {
    id: "ISSUE-101",
    feature: "upload",
    title: "Upload silently accepts files larger than 10MB",
    severity: "high",
    repro:
      "1. Open /upload?mode=buggy  2. Choose a file >10MB  3. Click Upload  4. Observe success toast despite size violation.",
    rootCause:
      "Size check uses `file.size > 10_000_000` but the early-return is gated behind a falsy default; the handler proceeds to call onUpload regardless.",
    status: "open",
  },
  {
    id: "ISSUE-102",
    feature: "chat",
    title: "Chat scroll position resets on every re-render",
    severity: "medium",
    repro:
      "1. Open /chat?mode=buggy  2. Scroll up to read older messages  3. Send a new message  4. Observe scroll snaps back to top.",
    rootCause:
      "The list uses index-based keys plus a `scrollTo(0,0)` inside a useEffect that depends on `messages.length`, clobbering the user's scroll on append.",
    status: "open",
  },
  {
    id: "ISSUE-103",
    feature: "dashboard",
    title: "Dashboard waterfall: three sequential fetches inflate TTI",
    severity: "high",
    repro:
      "1. Open /dashboard?mode=buggy  2. Note three loading spinners appearing one-by-one  3. Total load ≥ 2.1s.",
    rootCause:
      "Each widget awaits the previous fetch in series inside the parent component instead of using `Promise.all` or parallel server components.",
    status: "open",
  },
];

export const seedChat: ChatMessage[] = [
  { id: "m1", author: "support", text: "Hi! How can we help triage your app today?", ts: Date.now() - 60_000 },
  { id: "m2", author: "user", text: "The /upload page lets through a 50MB binary.", ts: Date.now() - 50_000 },
  { id: "m3", author: "support", text: "Confirmed — that's ISSUE-101. Flipping it to fixed in the tracker.", ts: Date.now() - 40_000 },
];

export const seedErrors: ErrorLog[] = [
  {
    id: "err-seed-1",
    ts: Date.now() - 120_000,
    source: "server",
    message: "GET /api/widgets/3 timed out after 2000ms",
  },
];
