// Browser side of /tools/agent-readiness: calls the Worker endpoint and renders the report.
// Everything from the scanned site (evidence, summaries, URLs) goes in with textContent, never as HTML.
import { CATEGORIES, fixPrompt, type CheckResult, type Report, type Status } from "../data/agent-readiness.ts";

const LABEL: Record<Status, string> = { pass: "Pass", warn: "Partial", fail: "Fail", unverified: "Could not verify", info: "Info" };

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, string> = {}, ...kids: (Node | string | null | undefined)[]) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const kid of kids) if (kid != null) node.append(kid);
  return node;
}

async function copy(text: string, btn: HTMLButtonElement) {
  try {
    await navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = old), 1600);
  } catch {
    btn.textContent = "Copy failed";
  }
}

export function copyButton(label: string, text: () => string, cls = "btn btn-sm") {
  const b = el("button", { type: "button", class: cls, text: label });
  b.addEventListener("click", () => copy(text(), b));
  return b;
}

export function codeBlock(lang: string, body: string, label: string) {
  return el(
    "div",
    { class: "code ar-code" },
    el("div", { class: "code-head" }, el("span", { class: "code-lang", text: lang }), copyButton(`Copy ${label}`, () => body, "btn btn-sm btn-ghost")),
    el("pre", {}, el("code", { text: body })),
  );
}

function checkRow(c: CheckResult, report: Report) {
  const open = c.status === "fail" || c.status === "warn";
  const details = el(
    "details",
    { class: `ar-check ar-${c.status}`, ...(open ? { open: "" } : {}) },
    el(
      "summary",
      {},
      el("span", { class: `ar-badge ar-badge-${c.status}`, text: LABEL[c.status] }),
      el("span", { class: "ar-check-title", text: c.title }),
      c.optional ? el("span", { class: "ar-tag", text: "optional" }) : null,
      el("span", { class: "ar-check-summary", text: c.summary }),
    ),
    el("div", { class: "ar-check-body" },
      el("p", { class: "ar-label", text: "Evidence" }),
      el("pre", { class: "ar-evidence" }, el("code", { text: c.evidence })),
      c.fix ? el("p", { class: "ar-label", text: "Fix" }) : null,
      c.fix ? el("p", { class: "ar-fix", text: c.fix }) : null,
      c.fix ? el("div", { class: "pkg-actions" }, copyButton("Copy fix prompt", () => fixPrompt(report, c.id))) : null,
      c.status === "unverified" ? el("p", { class: "pkg-set-note", text: "Not counted in the score: a request we could not complete is never treated as a fail." }) : null,
    ),
  );
  return details;
}

function render(root: HTMLElement, report: Report) {
  root.replaceChildren();
  const failing = report.checks.filter((c) => c.status === "fail" || c.status === "warn");
  const head = el(
    "div",
    { class: "ar-head" },
    el("div", { class: `ar-score ar-grade-${report.grade}`, role: "img", "aria-label": `Score ${report.score} out of 100, grade ${report.grade}` },
      el("span", { class: "ar-score-num", text: String(report.score) }),
      el("span", { class: "ar-score-of", text: "/ 100" }),
      el("span", { class: "ar-score-grade", text: `Grade ${report.grade}` }),
    ),
    el("div", { class: "ar-meta" },
      el("h2", { text: "Result" }),
      el("p", {}, "Scanned ", el("a", { href: report.finalUrl, rel: "nofollow noopener", target: "_blank", text: report.finalUrl })),
      el("p", { class: "pkg-set-note", text: `${report.checks.filter((c) => c.status === "pass").length} passed, ${failing.length} to fix, ${report.checks.filter((c) => c.status === "unverified").length} could not be verified. ${report.fetches} requests, ${new Date(report.scannedAt).toLocaleString()}.` }),
      ...report.notes.map((n) => el("p", { class: "pkg-set-note", text: n })),
      el("div", { class: "pkg-actions" },
        failing.length ? copyButton("Copy all fixes as one prompt", () => fixPrompt(report), "btn btn-primary btn-sm") : null,
        (() => {
          const b = el("button", { type: "button", class: "btn btn-sm", text: "Download JSON" });
          b.addEventListener("click", () => {
            const a = el("a", { href: URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })), download: `agent-readiness-${new URL(report.finalUrl).hostname}.json` });
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          });
          return b;
        })(),
        copyButton("Copy link to this result", () => location.href),
      ),
    ),
  );
  const cats = el("div", { class: "ar-cats" }, ...report.categories.map((c) =>
    el("a", { class: "ar-cat", href: `#ar-${c.id}` },
      el("span", { class: "ar-cat-title", text: c.title }),
      el("span", { class: "ar-cat-score", text: c.score === null ? "n/a" : `${c.score}` }),
      el("span", { class: "ar-bar" }, el("span", { style: `width:${c.score ?? 0}%` })),
      el("span", { class: "ar-cat-count", text: `${c.passed}/${c.total} passed` }),
    )));
  const groups = CATEGORIES.map((cat) => {
    const rows = report.checks.filter((c) => c.category === cat.id);
    return el("section", { class: "ar-group", id: `ar-${cat.id}` },
      el("h3", { text: cat.title }),
      el("p", { class: "pkg-set-note", text: cat.lead }),
      ...rows.map((c) => checkRow(c, report)));
  });
  const files = el("section", { class: "ar-group" },
    el("h3", { text: "Generated files" }),
    el("p", { class: "pkg-set-note", text: "Starting points built from what the scan read. Edit them before you publish: keep your own rules and pick your own yes/no answers." }),
    codeBlock("robots.txt", report.generated.robots, "robots.txt"),
    codeBlock("llms.txt", report.generated.llms, "llms.txt"),
  );
  root.append(head, cats, ...groups, files);
  root.hidden = false;
}

export function initAgentReadiness() {
  const form = document.querySelector<HTMLFormElement>("form[data-ar-form]");
  const out = document.querySelector<HTMLElement>("[data-ar-result]");
  const status = document.querySelector<HTMLElement>("[data-ar-status]");
  if (!form || !out || !status) return;
  const input = form.querySelector<HTMLInputElement>("input[name=url]")!;
  const buttons = [...form.querySelectorAll<HTMLButtonElement>("button")];

  const run = async (url: string, push = true) => {
    if (!url.trim()) { status.textContent = "Enter a URL to scan."; input.focus(); return; }
    input.value = url;
    buttons.forEach((b) => (b.disabled = true));
    status.textContent = "Scanning: fetching the page and up to 14 public files on the same host…";
    out.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(`/api/tools/agent-readiness?url=${encodeURIComponent(url.trim())}`, { headers: { Accept: "application/json" } });
      const body = (await res.json().catch(() => ({ error: `The scan failed (HTTP ${res.status}).` }))) as Report | { error: string };
      if ("error" in body) { status.textContent = body.error; out.hidden = true; return; }
      render(out, body);
      status.textContent = `Score ${body.score}/100, grade ${body.grade}.`;
      if (push) history.replaceState(null, "", `${location.pathname}?url=${encodeURIComponent(url.trim())}`);
      out.querySelector<HTMLElement>(".ar-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      status.textContent = "The scan could not reach our server. Check your connection and try again.";
    } finally {
      buttons.forEach((b) => (b.disabled = false));
      out.removeAttribute("aria-busy");
    }
  };

  form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); });
  form.querySelector<HTMLButtonElement>("[data-ar-example]")?.addEventListener("click", () => run("https://laravel-vuejs.space/"));
  const initial = new URLSearchParams(location.search).get("url");
  if (initial) run(initial, false);
}
