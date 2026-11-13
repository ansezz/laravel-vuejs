// Browser side of the llms.txt, AI crawler robots.txt and Markdown-for-agents tools.
// Content from other sites goes in with textContent only, never as HTML.
import { el, copyButton } from "./agent-readiness-ui.ts";
import { validateLlms, generateLlms, type Finding } from "../data/llms-txt.ts";
import { parseRobots, robotsVerdict, validSignal, AI_BOTS, BOT_KINDS } from "../data/robots.ts";

async function api<T>(path: string): Promise<T | { error: string }> {
  try {
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    return (await res.json().catch(() => ({ error: `The request failed (HTTP ${res.status}).` }))) as T | { error: string };
  } catch {
    return { error: "Could not reach our server. Check your connection and try again." };
  }
}

function busy(form: HTMLElement, on: boolean) {
  form.querySelectorAll<HTMLButtonElement>("button").forEach((b) => (b.disabled = on));
}

function download(name: string, text: string, type = "text/plain") {
  const a = el("a", { href: URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function lineView(text: string, marks: Map<number, string>, maxLines = 2500) {
  const lines = text.split(/\r?\n/);
  const pre = el("pre", { class: "ar-lines" });
  lines.slice(0, maxLines).forEach((l, i) => {
    const cls = marks.get(i + 1);
    pre.append(el("div", { class: `ar-line${cls ? ` ar-line-${cls}` : ""}`, id: `l${i + 1}` }, el("span", { text: String(i + 1) }), el("span", { text: l || " " })));
  });
  if (lines.length > maxLines) pre.append(el("div", { class: "ar-line" }, el("span", { text: "…" }), el("span", { text: `${lines.length - maxLines} more lines not shown` })));
  return pre;
}

const LEVEL = { error: "Error", warning: "Warning", info: "Info" } as const;

// ---------- llms.txt ----------

type LlmsFetch = { url: string; finalUrl: string; status: number; contentType: string; body: string; truncated: boolean; full: { url: string; status: number; contentType: string } };
type SitemapRead = { base: string; name: string; summary: string; sitemaps: { url: string; status: number; urls: number }[]; urls: string[]; capped: boolean };

export function initLlmsTool() {
  const root = document.querySelector<HTMLElement>("[data-llms]");
  if (!root) return;
  const text = root.querySelector<HTMLTextAreaElement>("textarea[name=llms]")!;
  const site = root.querySelector<HTMLInputElement>("input[name=site]")!;
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const out = root.querySelector<HTMLElement>("[data-result]")!;
  let delivery: { status: number; contentType: string } | undefined;
  let source = "";

  const validate = () => {
    const r = validateLlms(text.value, delivery);
    const marks = new Map<number, string>();
    r.findings.forEach((f) => { if (f.line && f.level !== "info" && marks.get(f.line) !== "error") marks.set(f.line, f.level); });
    const item = (f: Finding) => el("li", {}, el("span", { class: `ar-badge ar-badge-${f.level === "warning" ? "warn" : f.level}`, text: LEVEL[f.level] }),
      f.line ? el("a", { href: `#l${f.line}`, class: "ar-mono", text: `line ${f.line}` }) : el("span", { class: "ar-mono", text: "file" }), el("span", { text: f.message }));
    out.replaceChildren(
      el("div", { class: "ar-head" },
        el("div", { class: `ar-score ar-grade-${r.errors ? "F" : r.warnings ? "C" : "A"}` },
          el("span", { class: "ar-score-num", text: r.errors ? "✗" : "✓" }), el("span", { class: "ar-score-of", text: "" }),
          el("span", { class: "ar-score-grade", text: r.errors ? `${r.errors} error(s)` : r.warnings ? "Valid, with warnings" : "Valid" })),
        el("div", { class: "ar-meta" },
          el("h2", { text: "Result" }),
          source ? el("p", {}, "Fetched ", el("a", { href: source, rel: "nofollow noopener", target: "_blank", text: source })) : null,
          el("p", { class: "pkg-set-note", text: `${r.errors} error(s), ${r.warnings} warning(s), ${r.findings.length - r.errors - r.warnings} info. Title: ${r.title || "(none)"}. ${r.sections.length} section(s), ${r.links} link(s), ${(r.bytes / 1000).toFixed(1)} KB.` }),
          el("div", { class: "pkg-actions" },
            copyButton("Copy llms.txt", () => text.value, "btn btn-sm"),
            (() => { const b = el("button", { type: "button", class: "btn btn-sm", text: "Download llms.txt" }); b.addEventListener("click", () => download("llms.txt", text.value)); return b; })(),
          ),
        ),
      ),
      el("section", { class: "ar-group" }, el("h3", { text: "Findings" }),
        r.findings.length ? el("ul", { class: "ar-findings" }, ...r.findings.map(item)) : el("p", { text: "No findings: the file follows the format." })),
      el("section", { class: "ar-group" }, el("h3", { text: "The file, line by line" }), lineView(text.value, marks)),
    );
    out.hidden = false;
    status.textContent = r.errors ? `${r.errors} error(s) and ${r.warnings} warning(s).` : `Valid llms.txt${r.warnings ? `, ${r.warnings} warning(s)` : ""}.`;
  };

  const fetchLive = async (url: string) => {
    if (!url.trim()) { status.textContent = "Enter a site first."; site.focus(); return; }
    site.value = url;
    busy(root, true);
    status.textContent = "Fetching llms.txt…";
    const r = await api<LlmsFetch>(`/api/tools/llms-txt?url=${encodeURIComponent(url.trim())}`);
    busy(root, false);
    if ("error" in r) { status.textContent = r.error; return; }
    text.value = r.body;
    delivery = { status: r.status, contentType: r.contentType };
    source = r.finalUrl;
    validate();
    const full = r.full.status === 200 && !/html/.test(r.full.contentType) ? "llms-full.txt exists." : "No llms-full.txt found.";
    status.textContent = `${status.textContent} HTTP ${r.status}, ${r.contentType.split(";")[0] || "no Content-Type"}${r.truncated ? ", only the first 512 KB read" : ""}. ${full}`;
    history.replaceState(null, "", `${location.pathname}?url=${encodeURIComponent(url.trim())}`);
  };

  const generate = async (url: string) => {
    if (!url.trim()) { status.textContent = "Enter a site first."; site.focus(); return; }
    busy(root, true);
    status.textContent = "Reading the home page and sitemap…";
    const r = await api<SitemapRead>(`/api/tools/llms-txt?mode=sitemap&url=${encodeURIComponent(url.trim())}`);
    busy(root, false);
    if ("error" in r) { status.textContent = r.error; return; }
    text.value = generateLlms(r);
    delivery = undefined;
    source = "";
    validate();
    status.textContent = `Generated from ${r.urls.length} sitemap URL(s)${r.capped ? " (first 500)" : ""} in ${r.sitemaps.length} sitemap file(s). Edit the titles, add a short note after each link, and cut what does not help a reader.`;
  };

  root.querySelector("[data-validate]")?.addEventListener("click", () => { delivery = undefined; source = ""; validate(); });
  root.querySelector("[data-fetch]")?.addEventListener("click", () => fetchLive(site.value));
  root.querySelector("[data-generate]")?.addEventListener("click", () => generate(site.value));
  root.querySelector("[data-example]")?.addEventListener("click", () => fetchLive("https://laravel-vuejs.space/"));
  root.querySelector("form")?.addEventListener("submit", (e) => { e.preventDefault(); fetchLive(site.value); });
  const initial = new URLSearchParams(location.search).get("url");
  if (initial) fetchLive(initial);
}

// ---------- robots.txt ----------

type RobotsFetch = { url: string; finalUrl: string; status: number; contentType: string; body: string; path: string; note?: string };

export function initRobotsTool() {
  const root = document.querySelector<HTMLElement>("[data-robots]");
  if (!root) return;
  const text = root.querySelector<HTMLTextAreaElement>("textarea[name=robots]")!;
  const site = root.querySelector<HTMLInputElement>("input[name=site]")!;
  const path = root.querySelector<HTMLInputElement>("input[name=path]")!;
  const custom = root.querySelector<HTMLInputElement>("input[name=agent]")!;
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const out = root.querySelector<HTMLElement>("[data-result]")!;
  let note = "";

  const run = () => {
    const robots = parseRobots(text.value);
    let p = path.value.trim() || "/";
    try { if (/^https?:\/\//i.test(p)) { const u = new URL(p); p = u.pathname + u.search; } } catch { /* keep as typed */ }
    if (!p.startsWith("/")) p = `/${p}`;
    const hits = new Map<number, string>();
    const row = (name: string, owner: string, info: string) => {
      const v = robotsVerdict(robots, name, p);
      if (v.line) hits.set(v.line, "hit");
      return el("tr", {},
        el("th", { scope: "row" }, name, el("div", { class: "pkg-set-note", text: owner })),
        el("td", {}, el("span", { class: v.allowed ? "ar-yes" : "ar-no", text: v.allowed ? "Allowed" : "Blocked" })),
        el("td", { class: "ar-mono" }, v.rule ? `${v.rule} (line ${v.line}, ${v.group === "*" ? "User-agent: *" : `User-agent: ${v.group}`})` : robots.groups.length ? `No matching rule (${v.group === "*" ? "User-agent: *" : `User-agent: ${v.group}`}): allowed` : "No rules: allowed"),
        el("td", { text: info }));
    };
    const table = (rows: HTMLElement[]) => el("div", { class: "tool-table-wrap" }, el("table", { class: "tool-table" },
      el("thead", {}, el("tr", {}, ...["Crawler", "Verdict", "Deciding rule", "What it does"].map((h) => el("th", { scope: "col", text: h })))),
      el("tbody", {}, ...rows)));
    const groups = BOT_KINDS.map((k) => {
      const bots = AI_BOTS.filter((b) => b.kind === k.kind);
      const blocked = bots.filter((b) => !robotsVerdict(robots, b.name, p).allowed).length;
      return el("section", { class: "ar-group" }, el("h3", { text: `${k.title}: ${bots.length - blocked}/${bots.length} allowed` }), el("p", { class: "pkg-set-note", text: k.lead }), table(bots.map((b) => row(b.name, b.owner, b.note))));
    });
    const customName = custom.value.trim();
    const signals = robots.groups.flatMap((g) => g.signals.map((s) => ({ ...s, agents: g.agents })));
    signals.forEach((s) => hits.set(s.line, hits.get(s.line) ?? "hit"));
    robots.issues.forEach((i) => { if (i.level !== "info") hits.set(i.line, i.level); });
    out.replaceChildren(
      el("p", { class: "pkg-set-note", text: `Path tested: ${p}. ${robots.groups.length} group(s), ${robots.sitemaps.length} Sitemap line(s).${note ? ` ${note}` : ""}` }),
      ...(customName ? [el("section", { class: "ar-group" }, el("h3", { text: "Your user agent" }), table([row(customName, "Custom", "Matched by product token (case-insensitive).")]))] : []),
      ...groups,
      el("section", { class: "ar-group" }, el("h3", { text: "Content-Signal" }),
        signals.length ? el("ul", { class: "ar-findings" }, ...signals.map((s) => el("li", {},
          el("span", { class: `ar-badge ar-badge-${validSignal(s.value) ? "pass" : "warn"}`, text: validSignal(s.value) ? "Valid" : "Check" }),
          el("a", { href: `#l${s.line}`, class: "ar-mono", text: `line ${s.line}` }),
          el("span", { class: "ar-mono", text: `User-agent: ${s.agents.join(", ")} → ${s.value}` }))))
          : el("p", { text: "No Content-Signal line. Add one under User-agent: * to state your search / ai-input / ai-train preferences, e.g. Content-Signal: search=yes, ai-input=yes, ai-train=no" })),
      el("section", { class: "ar-group" }, el("h3", { text: "Syntax" }),
        robots.issues.length ? el("ul", { class: "ar-findings" }, ...robots.issues.map((i) => el("li", {},
          el("span", { class: `ar-badge ar-badge-${i.level === "warning" ? "warn" : i.level}`, text: LEVEL[i.level] }),
          el("a", { href: `#l${i.line}`, class: "ar-mono", text: `line ${i.line}` }), el("span", { text: i.message })))) : el("p", { text: "No syntax problems found." })),
      el("section", { class: "ar-group" }, el("h3", { text: "robots.txt, line by line" }), el("p", { class: "pkg-set-note", text: "Highlighted lines decide a verdict above or hold a Content-Signal." }), lineView(text.value, hits)),
    );
    out.hidden = false;
    const search = AI_BOTS.filter((b) => b.kind !== "training");
    const ok = search.filter((b) => robotsVerdict(robots, b.name, p).allowed).length;
    status.textContent = `${ok}/${search.length} AI search and user-triggered agents may fetch ${p}.`;
  };

  const fetchLive = async (url: string) => {
    if (!url.trim()) { status.textContent = "Enter a site first."; site.focus(); return; }
    site.value = url;
    busy(root, true);
    status.textContent = "Fetching robots.txt…";
    const r = await api<RobotsFetch>(`/api/tools/ai-robots?url=${encodeURIComponent(url.trim())}`);
    busy(root, false);
    if ("error" in r) { status.textContent = r.error; return; }
    text.value = r.body;
    note = r.note ?? `Fetched ${r.finalUrl} (HTTP ${r.status}).`;
    if (r.path && r.path !== "/") path.value = r.path;
    run();
    history.replaceState(null, "", `${location.pathname}?url=${encodeURIComponent(url.trim())}`);
  };

  root.querySelector("[data-test]")?.addEventListener("click", () => { note = ""; run(); });
  root.querySelector("[data-fetch]")?.addEventListener("click", () => fetchLive(site.value));
  root.querySelector("[data-example]")?.addEventListener("click", () => fetchLive("https://laravel-vuejs.space/"));
  root.querySelector("form")?.addEventListener("submit", (e) => { e.preventDefault(); fetchLive(site.value); });
  let t: number | undefined;
  [path, custom].forEach((i) => i.addEventListener("input", () => { clearTimeout(t); t = window.setTimeout(() => { if (!out.hidden) run(); }, 250); }));
  const initial = new URLSearchParams(location.search).get("url");
  if (initial) fetchLive(initial);
}

// ---------- Markdown for agents ----------

type Panel = { url: string; status: number; hops: string[]; headers: Record<string, string>; markdown: boolean; bytes: number; tokens: number; body: string; truncated: boolean; error?: string };
type Probe = { url: string; finalUrl: string; canonical: string; linked: string; html: Panel; negotiated: Panel; variant: Panel & { guessed: boolean }; notes: { status: "pass" | "warn" | "fail" | "info"; text: string }[]; saving: number | null };

export function initMarkdownTool() {
  const root = document.querySelector<HTMLElement>("[data-mdtest]");
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>("input[name=url]")!;
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const out = root.querySelector<HTMLElement>("[data-result]")!;
  const LBL = { pass: "Pass", warn: "Partial", fail: "Fail", info: "Info" } as const;

  const render = (r: Probe) => {
    const cols: [string, Panel][] = [["HTML (browser request)", r.html], ["Accept: text/markdown", r.negotiated], [r.variant.guessed ? ".md copy (guessed URL)" : ".md copy (linked)", r.variant]];
    const rows: [string, (p: Panel) => string][] = [
      ["URL", (p) => p.url + (p.hops.length ? ` (after ${p.hops.join(" → ")})` : "")],
      ["Status", (p) => (p.status ? `HTTP ${p.status}` : p.error ?? "no response")],
      ["Content-Type", (p) => p.headers["content-type"] ?? "(none)"],
      ["Vary", (p) => p.headers.vary ?? "(none)"],
      ["Link", (p) => p.headers.link ?? "(none)"],
      ["Cache-Control", (p) => p.headers["cache-control"] ?? "(none)"],
      ["x-markdown-tokens", (p) => p.headers["x-markdown-tokens"] ?? "(none)"],
      ["Markdown?", (p) => (p.markdown ? "yes" : "no")],
      ["Size", (p) => `${(p.bytes / 1000).toFixed(1)} KB`],
      ["Tokens (≈4 chars each)", (p) => p.tokens.toLocaleString("en")],
    ];
    const md = r.negotiated.markdown ? r.negotiated : r.variant.markdown ? r.variant : null;
    const max = Math.max(r.html.tokens, md?.tokens ?? 0, 1);
    const bar = (label: string, n: number) => el("div", {}, el("span", { text: label }), el("span", { class: "ar-bar" }, el("span", { style: `width:${Math.max(1, Math.round((n / max) * 100))}%` })), el("span", { class: "ar-mono", text: `≈${n.toLocaleString("en")}` }));
    out.replaceChildren(
      el("div", { class: "ar-meta" }, el("h2", { text: "Result" }),
        el("p", {}, "Tested ", el("a", { href: r.finalUrl, rel: "nofollow noopener", target: "_blank", text: r.finalUrl })),
        r.canonical ? el("p", { class: "pkg-set-note", text: `Canonical: ${r.canonical}` }) : null),
      el("section", { class: "ar-group" }, el("h3", { text: "Notes" }),
        el("ul", { class: "ar-findings" }, ...r.notes.map((n) => el("li", {}, el("span", { class: `ar-badge ar-badge-${n.status === "info" ? "info" : n.status}`, text: LBL[n.status] }), el("span", { text: n.text }))))),
      el("section", { class: "ar-group" }, el("h3", { text: "Approximate tokens" }),
        el("div", { class: "ar-tokens" }, bar("HTML", r.html.tokens), md ? bar("Markdown", md.tokens) : el("p", { text: "No Markdown version found." })),
        r.saving !== null ? el("p", { class: "pkg-set-note", text: `Markdown is ${Math.abs(r.saving)}% ${r.saving >= 0 ? "smaller" : "larger"} than the HTML.` }) : null),
      el("section", { class: "ar-group" }, el("h3", { text: "Headers" }),
        el("div", { class: "tool-table-wrap" }, el("table", { class: "tool-table ar-fixed" },
          el("thead", {}, el("tr", {}, el("th", { scope: "col", text: "" }), ...cols.map(([h]) => el("th", { scope: "col", text: h })))),
          el("tbody", {}, ...rows.map(([label, f]) => el("tr", {}, el("th", { scope: "row", text: label }), ...cols.map(([, p]) => el("td", { class: "ar-mono", text: f(p) })))))))),
      el("section", { class: "ar-group" }, el("h3", { text: "Side by side" }),
        el("div", { class: "ar-split" },
          el("div", {}, el("h3", { text: `HTML source${r.html.truncated ? " (first 40 KB)" : ""}` }), el("pre", {}, el("code", { text: r.html.body }))),
          el("div", {}, el("h3", { text: md ? `Markdown${md === r.negotiated ? " (Accept: text/markdown)" : " (.md copy)"}${md.truncated ? " (first 40 KB)" : ""}` : "Markdown" }),
            md ? el("pre", {}, el("code", { text: md.body })) : el("p", { text: "The site sent no Markdown for this page." }),
            md ? el("div", { class: "pkg-actions" }, copyButton("Copy Markdown", () => md.body)) : null))),
    );
    out.hidden = false;
  };

  const run = async (url: string) => {
    if (!url.trim()) { status.textContent = "Enter a URL to test."; input.focus(); return; }
    input.value = url;
    busy(root, true);
    status.textContent = "Fetching the HTML, the Markdown response and the .md copy…";
    const r = await api<Probe>(`/api/tools/markdown-for-agents?url=${encodeURIComponent(url.trim())}`);
    busy(root, false);
    if ("error" in r) { status.textContent = r.error; out.hidden = true; return; }
    render(r);
    const fails = r.notes.filter((n) => n.status === "fail").length;
    status.textContent = fails ? `${fails} check(s) failed.` : "Markdown for agents works on this page.";
    history.replaceState(null, "", `${location.pathname}?url=${encodeURIComponent(url.trim())}`);
  };

  root.querySelector("form")?.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); });
  root.querySelector("[data-example]")?.addEventListener("click", () => run("https://laravel-vuejs.space/"));
  const initial = new URLSearchParams(location.search).get("url");
  if (initial) run(initial);
}
