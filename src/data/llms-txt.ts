// llms.txt validator and generator, shared by the browser (/tools/llms-txt), the Worker and the tests.
// Format: one "# Title" H1 first, an optional "> summary" blockquote, optional notes, then "## Section" headings with
// "- [Title](https://absolute-url): optional note" link lists. A section named "Optional" holds skippable links.

export type Finding = { line: number; level: "error" | "warning" | "info"; message: string };
export type LlmsReport = {
  findings: Finding[];
  errors: number;
  warnings: number;
  title: string;
  summary: string;
  sections: { name: string; links: number; line: number }[];
  links: number;
  bytes: number;
  valid: boolean; // no errors
};

const LINK = /^\s*[-*+]\s+\[([^\]]+)\]\(([^)\s]+)\)(.*)$/;

export function validateLlms(text: string, delivery?: { status: number; contentType: string }): LlmsReport {
  const findings: Finding[] = [];
  const add = (line: number, level: Finding["level"], message: string) => findings.push({ line, level, message });
  const bytes = new TextEncoder().encode(text).length;
  if (delivery) {
    if (delivery.status !== 200) add(0, "error", `The file answers HTTP ${delivery.status}, not 200.`);
    const ct = delivery.contentType.toLowerCase();
    if (/text\/html/.test(ct)) add(0, "error", "Served as text/html. Serve llms.txt as text/plain (or text/markdown).");
    else if (ct && !/text\/(plain|markdown|x-markdown)/.test(ct)) add(0, "warning", `Served as ${ct.split(";")[0]}. Use text/plain or text/markdown.`);
    if (ct && !/charset=utf-8/i.test(ct)) add(0, "info", "No charset=utf-8 in Content-Type; add it so non-ASCII text is read correctly.");
  }
  const lines = text.split(/\r?\n/);
  const sections: LlmsReport["sections"] = [];
  let title = "", summary = "", links = 0, h1s = 0;
  const seen = new Map<string, number>();
  if (!text.trim()) {
    add(1, "error", "The file is empty.");
    return finish();
  }
  if (/^\s*(<!doctype html|<html|<head|<body)/i.test(text)) {
    add(1, "error", "This is an HTML page, not Markdown. A catch-all route is probably answering /llms.txt.");
    return finish();
  }
  const firstIdx = lines.findIndex((l) => l.trim());
  const first = lines[firstIdx].trim();
  if (/^#\s+\S/.test(first)) title = first.replace(/^#\s+/, "");
  else add(firstIdx + 1, "error", 'The first line must be the H1 title: "# Site or project name".');
  const afterH1 = lines.slice(firstIdx + 1).findIndex((l) => l.trim());
  if (title && afterH1 >= 0 && /^>\s*\S/.test(lines[firstIdx + 1 + afterH1].trim())) summary = lines[firstIdx + 1 + afterH1].trim().replace(/^>\s*/, "");
  else if (title) add(firstIdx + 1, "warning", 'Add a one-line "> summary" blockquote right under the H1.');

  let section: { name: string; links: number; line: number } | null = null;
  lines.forEach((raw, i) => {
    const n = i + 1;
    const l = raw.trim();
    if (!l) return;
    if (/^#\s+\S/.test(l)) {
      h1s++;
      if (h1s > 1) add(n, "warning", "Only one H1 is expected; use ## for sections.");
      return;
    }
    if (/^##\s+\S/.test(l)) {
      section = { name: l.replace(/^##\s+/, ""), links: 0, line: n };
      sections.push(section);
      return;
    }
    if (/^#{3,6}\s+\S/.test(l)) { if (!section) add(n, "info", "Sub-heading before any ## section."); return; }
    const m = raw.match(LINK);
    if (m) {
      links++;
      if (section) section.links++;
      else add(n, "warning", "Link list before any ## section: group links under a heading such as ## Docs.");
      const url = m[2];
      if (!/^https?:\/\//i.test(url)) add(n, "error", `Relative link "${url}": use an absolute URL (https://...). Nothing can resolve a relative path from a plain text file.`);
      else {
        try { new URL(url); } catch { add(n, "error", `Malformed URL: ${url}`); }
        if (/^http:\/\//i.test(url)) add(n, "info", `Plain http:// link; prefer https://.`);
      }
      const prev = seen.get(url);
      if (prev) add(n, "warning", `Duplicate link (also on line ${prev}).`);
      else seen.set(url, n);
      if (!/:\s*\S/.test(m[3])) add(n, "info", `No ": note" after the link. A short note helps a reader pick the right page.`);
      return;
    }
    if (/^\s*[-*+]\s+/.test(raw) && section) {
      if (/\]\(/.test(l) || /\[/.test(l)) add(n, "error", 'Broken list link: use "- [Title](https://url): note".');
      else add(n, "info", "List item without a link.");
    }
  });
  if (!sections.length) add(0, "warning", 'No "## Section" headings. Group links under headings such as ## Docs or ## Guides.');
  if (!links) add(0, "error", 'No "- [Title](https://url)" links: the links are the content of the file.');
  sections.filter((s) => !s.links).forEach((s) => add(s.line, "warning", `Section "${s.name}" has no links.`));
  const opt = sections.findIndex((s) => s.name.toLowerCase() === "optional");
  if (opt >= 0 && opt !== sections.length - 1) add(sections[opt].line, "info", '"## Optional" is usually the last section (readers may skip it).');
  if (bytes > 50_000) add(0, "warning", `The file is ${Math.round(bytes / 1000)} KB. Keep llms.txt an index; put full text in llms-full.txt.`);
  return finish();

  function finish(): LlmsReport {
    findings.sort((a, b) => a.line - b.line);
    const errors = findings.filter((f) => f.level === "error").length;
    return { findings, errors, warnings: findings.filter((f) => f.level === "warning").length, title, summary, sections, links, bytes, valid: errors === 0 };
  }
}

export type GenerateInput = { name: string; summary: string; base: string; urls: (string | { loc: string; title?: string })[] };

const OPTIONAL = /^(privacy|terms|legal|cookie|cookies|imprint|disclaimer|tag|tags|author|authors|page|search|login|register|account|cart|checkout)$/i;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const humanize = (slug: string) => cap(decodeURIComponent(slug).replace(/\.(html?|php|aspx?)$/i, "").replace(/[-_]+/g, " ").trim()) || "Home";

// Builds a starter llms.txt from sitemap URLs: one section per first path segment, top-level pages under "Pages",
// legal and account pages under "Optional". Titles come from the slug; edit them before publishing.
export function generateLlms(input: GenerateInput, perSection = 25, max = 150): string {
  const groups = new Map<string, { loc: string; title: string }[]>();
  const push = (key: string, loc: string, title: string) => {
    const list = groups.get(key) ?? [];
    if (list.length < perSection) list.push({ loc, title });
    groups.set(key, list);
  };
  let count = 0;
  const seen = new Set<string>();
  for (const item of input.urls) {
    if (count >= max) break;
    const u = typeof item === "string" ? { loc: item, title: "" } : item;
    let url: URL;
    try { url = new URL(u.loc); } catch { continue; }
    const key = url.origin + url.pathname.replace(/\/+$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    const parts = url.pathname.split("/").filter(Boolean);
    const title = (u.title ?? "").trim() || (parts.length ? humanize(parts[parts.length - 1]) : input.name || "Home");
    const loc = url.toString();
    if (!parts.length) continue; // the home page is the file's own subject
    if (parts.length === 1) push(OPTIONAL.test(parts[0]) || /privacy|terms|cookie|legal|imprint|disclaimer/i.test(parts[0]) ? "Optional" : "Pages", loc, title);
    else push(OPTIONAL.test(parts[0]) ? "Optional" : humanize(parts[0]), loc, title);
    count++;
  }
  const order = [...groups.keys()].sort((a, b) => (a === "Pages" ? -1 : b === "Pages" ? 1 : a === "Optional" ? 1 : b === "Optional" ? -1 : (groups.get(b)!.length - groups.get(a)!.length)));
  const body = order.map((k) => `## ${k}\n\n${groups.get(k)!.map((l) => `- [${l.title.replace(/[[\]]/g, "")}](${l.loc})`).join("\n")}`).join("\n\n");
  return `# ${input.name || new URL(input.base).hostname}\n\n> ${(input.summary || `What ${new URL(input.base).hostname} offers, in one sentence.`).replace(/\s+/g, " ").trim()}\n\n${body}\n`;
}
