import { test, expect } from "@playwright/test";

test.describe("App Health Dashboard", () => {
  test("landing page renders without console errors and lists the three flagged features", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /app health dashboard/i })).toBeVisible();
    await expect(page.getByText(/file upload/i).first()).toBeVisible();
    await expect(page.getByText(/chat/i).first()).toBeVisible();
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();

    // Fixed mode is the default — no console errors should appear.
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
  });

  test("all four routes render in fixed mode without console errors", async ({ page }) => {
    const errs: string[] = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errs.push(msg.text());
    });

    for (const path of ["/", "/chat", "/upload", "/dashboard", "/health"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await page.waitForTimeout(200);
    }
    expect(errs).toEqual([]);
  });

  test("/health lists at least 3 documented issues with repro steps and toggleable fix status", async ({ page }) => {
    await page.goto("/health");
    await expect(page.getByRole("heading", { name: /issue tracker/i })).toBeVisible();

    const rows = page.getByTestId("issue-row");
    await expect(rows).toHaveCount(3);

    // Each row exposes severity, repro steps, suspected root cause.
    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      await expect(row.getByTestId("issue-severity")).toBeVisible();
      await expect(row.getByTestId("issue-repro")).toBeVisible();
      await expect(row.getByTestId("issue-rootcause")).toBeVisible();
      await expect(row.getByTestId("issue-fix-toggle")).toBeVisible();
    }

    // Toggle the first issue's "Fix Applied" — status should reflect change.
    const firstRow = rows.first();
    const firstStatusBefore = await firstRow.getByTestId("issue-status").innerText();
    await firstRow.getByTestId("issue-fix-toggle").click();
    await expect(firstRow.getByTestId("issue-status")).not.toHaveText(firstStatusBefore);
  });

  test("upload feature: buggy mode silently accepts >10MB, fixed mode rejects it", async ({ page }) => {
    // Buggy mode
    await page.goto("/upload?mode=buggy");
    await expect(page.getByRole("heading", { name: /upload/i })).toBeVisible();
    const big = Buffer.alloc(11 * 1024 * 1024, 0x41); // 11 MB
    await page.setInputFiles('input[type="file"]', {
      name: "big.bin",
      mimeType: "application/octet-stream",
      buffer: big,
    });
    await page.getByTestId("upload-submit").click();
    // Buggy: silently accepts — success message shows.
    await expect(page.getByTestId("upload-result")).toContainText(/uploaded/i);

    // Fixed mode rejects.
    await page.goto("/upload?mode=fixed");
    await page.setInputFiles('input[type="file"]', {
      name: "big.bin",
      mimeType: "application/octet-stream",
      buffer: big,
    });
    await page.getByTestId("upload-submit").click();
    await expect(page.getByTestId("upload-result")).toContainText(/too large|exceeds|10 ?MB/i);
  });

  test("chat feature: buggy mode loses scroll position on re-render, fixed mode keeps it pinned", async ({ page }) => {
    await page.goto("/chat?mode=fixed");
    await expect(page.getByRole("heading", { name: /chat/i })).toBeVisible();

    // The fixed variant exposes a data-attribute so we can verify scroll behavior deterministically.
    const scroll = page.getByTestId("chat-scroll");
    await expect(scroll).toHaveAttribute("data-pinned", "true");

    await page.goto("/chat?mode=buggy");
    const buggyScroll = page.getByTestId("chat-scroll");
    await expect(buggyScroll).toHaveAttribute("data-pinned", "false");
  });

  test("dashboard feature: buggy mode shows waterfall fetch indicator, fixed mode loads in parallel", async ({ page }) => {
    await page.goto("/dashboard?mode=fixed");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByTestId("fetch-strategy")).toHaveText(/parallel/i);

    await page.goto("/dashboard?mode=buggy");
    await expect(page.getByTestId("fetch-strategy")).toHaveText(/waterfall/i);
  });

  test("triggering a client error appears in the error log feed within 2 seconds", async ({ page }) => {
    await page.goto("/health");
    await expect(page.getByTestId("error-feed")).toBeVisible();
    const before = await page.getByTestId("error-row").count();

    await page.getByTestId("trigger-client-error").click();
    // The feed updates within 2 seconds.
    await expect.poll(
      async () => await page.getByTestId("error-row").count(),
      { timeout: 2_000 }
    ).toBeGreaterThan(before);
  });

  test("mode toggle on landing page switches features between buggy and fixed", async ({ page }) => {
    await page.goto("/");
    // Default: fixed
    await expect(page.getByTestId("mode-indicator")).toHaveText(/fixed/i);
    await page.getByTestId("mode-toggle").click();
    await expect(page.getByTestId("mode-indicator")).toHaveText(/buggy/i);

    // Mode toggle propagates to feature links.
    const chatLink = page.getByTestId("chat-link");
    await expect(chatLink).toHaveAttribute("href", /mode=buggy/);
  });
});
