// AI agent readiness checker: the check catalog, scoring and the Markdown copy of the tool page.
// Shared by the tool page (src/pages/tools/agent-readiness.astro), its Markdown twin and the scanner in the Worker
// (worker/agent-readiness.ts). Keep it free of DOM and Node APIs: it runs in the browser build, Node and the Worker.
import { SITE_URL } from "../config/site.ts";

export type Status = "pass" | "warn" | "fail" | "unverified" | "info";

export type CategoryId =
  | "discoverability"
  | "content"
  | "structured"
  | "semantics"
  | "access"
  | "capabilities"
  | "security"
  | "cors";

export const CATEGORIES: { id: CategoryId; title: string; lead: string }[] = [
  { id: "discoverability", title: "Discoverability", lead: "The files an agent reads first: robots.txt, the sitemap, llms.txt and your content-use policy." },
  { id: "content", title: "Content without JavaScript", lead: "Most agents read the HTML you send, not the page a browser builds after scripts run." },
  { id: "structured", title: "Structured data", lead: "JSON-LD and Open Graph tags an agent turns into facts without guessing." },
  { id: "semantics", title: "Semantics", lead: "Language, headings, landmarks, image alt text, the meta description and the canonical URL." },
  { id: "access", title: "Bot access", lead: "Whether AI search and user-triggered agents are allowed in, and nothing walls them off." },
  { id: "capabilities", title: "Agent capabilities", lead: "Markdown for agents, Link headers, and the optional machine-readable endpoints for sites that run an API or agent." },
  { id: "security", title: "Security", lead: "HTTPS and the baseline headers an agent sees before it trusts a response." },
  { id: "cors", title: "CORS", lead: "Whether browser-based agents may read your public pages cross-origin." },
];

export type CheckMeta = {
  id: string;
  category: CategoryId;
  title: string;
  weight: number; // relative weight in the score; optional checks weigh 1
  optional?: boolean; // only relevant for some sites (an API, an MCP server, an agent)
  what: string; // what the check looks at (shown on the page and in the Markdown copy)
  fix: string; // the concrete fix when it fails
};

export const CHECKS: CheckMeta[] = [
  // Discoverability
  { id: "robots", category: "discoverability", title: "robots.txt is valid", weight: 3, what: "/robots.txt answers 200 with plain text and at least one User-agent group.", fix: "Serve /robots.txt as text/plain with a `User-agent: *` group, your Disallow rules and a `Sitemap:` line. A catch-all route that returns your HTML page or a 404 does not count." },
  { id: "sitemap", category: "discoverability", title: "Sitemap is reachable", weight: 2, what: "The sitemap named in robots.txt (or /sitemap.xml) answers 200 with a <urlset> or <sitemapindex>.", fix: "Publish an XML sitemap (a <urlset>, or a <sitemapindex> of sitemaps) and name it in robots.txt with `Sitemap: https://your-site/sitemap.xml`." },
  { id: "llms", category: "discoverability", title: "llms.txt follows the format", weight: 2, what: "/llms.txt is plain text (not an HTML page), opens with an H1, has a > summary and lists absolute links.", fix: "Publish /llms.txt as text/plain: one `# Site name` H1 first, a `> one-line summary`, then `## Sections` of `- [Title](https://absolute-url): note` links to your most useful pages. Use the starter file below." },
  { id: "content-signal", category: "discoverability", title: "Content-Signal in robots.txt", weight: 1, what: "robots.txt states search / ai-input / ai-train preferences with a Content-Signal line inside a User-agent group.", fix: "Add `Content-Signal: search=yes, ai-input=yes, ai-train=no` (your own yes/no choices) under `User-agent: *` in robots.txt." },
  { id: "feed", category: "discoverability", title: "Feed autodiscovery", weight: 1, optional: true, what: "The page links an RSS, Atom or JSON feed in its <head>.", fix: "If you publish articles or updates, add `<link rel=\"alternate\" type=\"application/rss+xml\" href=\"/feed.xml\">` to the <head>." },
  // Content without JavaScript
  { id: "page", category: "content", title: "Page answers with HTML", weight: 3, what: "The URL answers 200 with text/html after at most 3 redirects.", fix: "Make the URL answer 200 with HTML for a plain GET with no cookies. Avoid long redirect chains and interstitials." },
  { id: "title", category: "content", title: "Title in the raw HTML", weight: 2, what: "A non-empty <title> is in the HTML the server sends.", fix: "Render a specific <title> on the server (under ~60 characters), not from client-side JavaScript." },
  { id: "h1", category: "content", title: "H1 in the raw HTML", weight: 2, what: "At least one <h1> with text is in the HTML the server sends.", fix: "Render the page's main heading as an <h1> on the server." },
  { id: "text", category: "content", title: "Meaningful text without JavaScript", weight: 4, what: "The HTML has at least 150 words of visible text once scripts, styles and templates are removed.", fix: "Server-render or pre-render the main content (SSR or static generation). An empty <div id=\"app\"> that JavaScript fills in later is invisible to most agents." },
  // Structured data
  { id: "jsonld", category: "structured", title: "JSON-LD present and parses", weight: 2, what: "At least one <script type=\"application/ld+json\"> block, and every block is valid JSON.", fix: "Add a JSON-LD block describing the page (WebSite, Organization, Article, Product...) and make sure it is valid JSON: no trailing commas, no unescaped quotes." },
  { id: "jsonld-types", category: "structured", title: "Schema.org types found", weight: 2, what: "The JSON-LD names at least one schema.org @type (Organization, WebSite, Article, Product, FAQPage...).", fix: "Give each JSON-LD node a schema.org `@type` with `@context: \"https://schema.org\"`, e.g. Organization plus WebSite site-wide and Article or Product on detail pages." },
  { id: "opengraph", category: "structured", title: "Open Graph tags", weight: 1, what: "og:title, og:description and og:image meta tags.", fix: "Add `og:title`, `og:description` and `og:image` meta tags to the <head>." },
  // Semantics
  { id: "lang", category: "semantics", title: "Language declared", weight: 1, what: "<html lang=\"...\"> is set.", fix: "Set the page language on the root element: `<html lang=\"en\">`." },
  { id: "single-h1", category: "semantics", title: "One H1", weight: 1, what: "Exactly one <h1> on the page.", fix: "Keep one <h1> for the page's main topic and use <h2>-<h6> for sections." },
  { id: "landmarks", category: "semantics", title: "Landmarks", weight: 1, what: "A <main> element (or role=\"main\"), ideally with <header>, <nav> and <footer>.", fix: "Wrap the main content in <main> and use <header>, <nav> and <footer> for the page chrome, so an agent can skip straight to the content." },
  { id: "alt", category: "semantics", title: "Image alt text", weight: 2, what: "At least 90% of <img> elements have an alt attribute (alt=\"\" is fine for decorative images).", fix: "Give every meaningful image a short descriptive alt text, and decorative images an empty alt=\"\"." },
  { id: "description", category: "semantics", title: "Meta description", weight: 1, what: "A <meta name=\"description\"> of 50 to 300 characters.", fix: "Add a specific `<meta name=\"description\">` of about 120-160 characters that says what the page answers." },
  { id: "canonical", category: "semantics", title: "Canonical URL", weight: 1, what: "A <link rel=\"canonical\"> with an absolute URL.", fix: "Add `<link rel=\"canonical\" href=\"https://your-site/this-page\">` with the page's one preferred, absolute URL." },
  // Bot access
  { id: "ai-bots", category: "access", title: "AI search and user agents allowed", weight: 3, what: "robots.txt lets AI search crawlers and user-triggered fetchers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) read this URL. Training crawlers are listed but not scored: blocking them is a policy choice.", fix: "Remove the Disallow rules that catch AI search and user-triggered agents, or add a group for them with `Allow: /`. To opt out of training only, block GPTBot, ClaudeBot, CCBot and Google-Extended and leave the search agents allowed (see the robots.txt snippet below)." },
  { id: "bot-wall", category: "access", title: "No bot wall", weight: 3, what: "The page is not answered with 401, 403, 429 or 503, a challenge page or a captcha for an identified, polite crawler.", fix: "Allow verified bots and identified crawlers through your WAF or bot protection for public pages, or serve them a cached copy instead of a challenge." },
  { id: "indexable", category: "access", title: "No noindex", weight: 2, what: "Neither an X-Robots-Tag header nor a robots meta tag says noindex or none.", fix: "Remove `noindex` from the robots meta tag and the X-Robots-Tag header on pages you want agents and search engines to use." },
  // Agent capabilities
  { id: "markdown-negotiation", category: "capabilities", title: "Markdown for agents (Accept: text/markdown)", weight: 2, what: "A request with `Accept: text/markdown` gets Markdown back with Content-Type text/markdown (ideally with Vary: Accept), on the same URL.", fix: "When a request sends `Accept: text/markdown`, return a Markdown rendering of the page with `Content-Type: text/markdown` and `Vary: Accept`; never redirect or error on that header. On Cloudflare you can turn on Markdown for Agents instead." },
  { id: "markdown-alternate", category: "capabilities", title: "Markdown alternate link", weight: 1, what: "The <head> links a Markdown copy with <link rel=\"alternate\" type=\"text/markdown\">, and it answers 200.", fix: "Publish a stable Markdown copy of each page (e.g. /page.md) and link it: `<link rel=\"alternate\" type=\"text/markdown\" href=\"/page.md\">`." },
  { id: "link-header", category: "capabilities", title: "HTTP Link header", weight: 1, what: "The page response carries an RFC 8288 Link header (canonical, alternate, sitemap, api-catalog...).", fix: "Send a Link header on HTML responses, e.g. `Link: <https://your-site/page>; rel=\"canonical\", <https://your-site/page.md>; rel=\"alternate\"; type=\"text/markdown\"`." },
  { id: "api-catalog", category: "capabilities", title: "API catalog", weight: 1, optional: true, what: "/.well-known/api-catalog answers with an RFC 9727 linkset.", fix: "If you have public APIs or machine-readable files, publish /.well-known/api-catalog as `application/linkset+json` listing them." },
  { id: "openapi", category: "capabilities", title: "OpenAPI document", weight: 1, optional: true, what: "An OpenAPI document at /openapi.json (or linked from the API catalog).", fix: "If you run an HTTP API, publish its OpenAPI document (e.g. /openapi.json) and link it from your API catalog." },
  { id: "mcp-card", category: "capabilities", title: "MCP server card", weight: 1, optional: true, what: "/.well-known/mcp/server-card.json or /.well-known/mcp.json describes an MCP server.", fix: "Only if you run an MCP server: publish its server card (name, description, transport URL, tools) at /.well-known/mcp/server-card.json." },
  { id: "agent-card", category: "capabilities", title: "A2A agent card", weight: 1, optional: true, what: "/.well-known/agent-card.json describes an A2A agent.", fix: "Only if you run an A2A agent: publish its agent card (name, url, skills, capabilities) at /.well-known/agent-card.json." },
  { id: "agents-json", category: "capabilities", title: "agents.json", weight: 1, optional: true, what: "/.well-known/agents.json lists the actions agents can take and how they authenticate.", fix: "Only if agents can take actions on your site: publish /.well-known/agents.json describing the actions and how agents authenticate." },
  // Security
  { id: "https", category: "security", title: "HTTPS", weight: 2, what: "The page is served over HTTPS, and plain HTTP redirects to it.", fix: "Serve every page over HTTPS and redirect http:// to https:// with a 301 or 308." },
  { id: "hsts", category: "security", title: "HSTS", weight: 1, what: "Strict-Transport-Security with a max-age of at least 180 days.", fix: "Send `Strict-Transport-Security: max-age=31536000; includeSubDomains` on HTTPS responses." },
  { id: "nosniff", category: "security", title: "nosniff", weight: 1, what: "X-Content-Type-Options: nosniff.", fix: "Send `X-Content-Type-Options: nosniff` on every response." },
  { id: "csp", category: "security", title: "Content Security Policy", weight: 1, what: "A Content-Security-Policy header (or meta tag).", fix: "Send a Content-Security-Policy header. Start with `default-src 'self'` and allow only the hosts your pages need." },
  // CORS
  { id: "cors", category: "cors", title: "CORS on public content", weight: 1, what: "An Access-Control-Allow-Origin header on the page or its Markdown copy.", fix: "Send `Access-Control-Allow-Origin: *` on public, read-only pages and files (never on endpoints that use cookies or credentials)." },
];

export const CHECK_BY_ID: Record<string, CheckMeta> = Object.fromEntries(CHECKS.map((c) => [c.id, c]));

export type CheckResult = {
  id: string;
  category: CategoryId;
  title: string;
  status: Status;
  weight: number;
  optional: boolean;
  summary: string; // one line: what we found
  evidence: string; // status, header or snippet (truncated)
  fix?: string; // only on warn / fail
};

export type CategoryScore = { id: CategoryId; title: string; score: number | null; passed: number; total: number };

export type Report = {
  url: string;
  finalUrl: string;
  scannedAt: string;
  score: number;
  grade: string;
  categories: CategoryScore[];
  checks: CheckResult[];
  fetches: number;
  generated: { robots: string; llms: string };
  notes: string[];
};

// pass counts fully, warn counts half, fail counts zero; could-not-verify and info are left out of the score entirely.
const earned = (r: CheckResult) => (r.status === "pass" ? r.weight : r.status === "warn" ? r.weight / 2 : 0);
const scored = (r: CheckResult) => r.status === "pass" || r.status === "warn" || r.status === "fail";

export function scoreOf(results: CheckResult[]): number | null {
  const counted = results.filter(scored);
  const total = counted.reduce((n, r) => n + r.weight, 0);
  if (!total) return null;
  return Math.round((counted.reduce((n, r) => n + earned(r), 0) / total) * 100);
}

export const gradeOf = (score: number) => (score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F");

export function categoryScores(results: CheckResult[]): CategoryScore[] {
  return CATEGORIES.map((c) => {
    const rows = results.filter((r) => r.category === c.id);
    return { id: c.id, title: c.title, score: scoreOf(rows), passed: rows.filter((r) => r.status === "pass").length, total: rows.filter(scored).length };
  });
}

// One prompt for a coding assistant that covers every failing or partial check.
export function fixPrompt(report: Pick<Report, "finalUrl" | "checks">, only?: string): string {
  const todo = report.checks.filter((c) => (c.status === "fail" || c.status === "warn") && (!only || c.id === only));
  if (!todo.length) return "";
  const lines = todo.map((c, i) => `${i + 1}. ${c.title}${c.optional ? " (optional: skip it if it does not apply)" : ""}\n   Found: ${c.summary}\n   Fix: ${c.fix ?? CHECK_BY_ID[c.id]?.fix ?? ""}`);
  return `Fix these AI agent readiness issues on ${report.finalUrl}, highest impact first. Skip any item that does not apply to this codebase, and summarize what you changed at the end.\n\n${lines.join("\n\n")}\n\nWhen you are done, re-scan the page with ${SITE_URL}/tools/agent-readiness to confirm.`;
}

export const FAQ: { q: string; a: string }[] = [
  { q: "What does the AI agent readiness checker test?", a: `It fetches the page you enter plus a few well-known files (robots.txt, the sitemap, llms.txt and the /.well-known/ agent files) and runs ${CHECKS.length} checks across ${CATEGORIES.length} categories: discoverability, content without JavaScript, structured data, semantics, bot access, agent capabilities, security and CORS.` },
  { q: "How is the score calculated?", a: "Each check has a weight. A pass earns its full weight, a partial pass earns half and a fail earns nothing. Checks we could not verify, and information-only rows, are left out of the score instead of counting as a fail. The grade is A from 90, B from 80, C from 70, D from 60, and F below that." },
  { q: "Does it crawl my whole site?", a: "No. One scan makes at most 15 requests: the page itself, plus fixed public paths on the same host. It never logs in, never follows links across your site, and cannot reach private networks. Results are cached for 10 minutes." },
  { q: "Why are the MCP card, A2A card, OpenAPI and agents.json marked optional?", a: "They describe services an agent can call. A blog or a brochure site has nothing to describe, so these checks weigh little, and publishing a card for a service you do not run would mislead agents." },
  { q: "Does blocking GPTBot or ClaudeBot lower my score?", a: "No. Training crawlers are listed for information only. The score looks at AI search crawlers and user-triggered fetchers, which decide whether assistants can read and cite your pages." },
  { q: "What is Markdown for agents?", a: "When a request sends Accept: text/markdown, the server returns a Markdown version of the same page instead of HTML. Agents read Markdown with far fewer tokens than HTML. A stable .md copy linked from the page head does the same job for agents that do not negotiate." },
];

export function agentReadinessMarkdown(): string {
  const byCat = CATEGORIES.map((c) => `### ${c.title}\n\n${c.lead}\n\n${CHECKS.filter((k) => k.category === c.id).map((k) => `- **${k.title}**${k.optional ? " (optional)" : ""}, weight ${k.weight}: ${k.what}`).join("\n")}`).join("\n\n");
  return `# AI agent readiness checker

Free tool on ${SITE_URL}/tools/agent-readiness. Enter a URL: the checker fetches that page and a few public files on the same host, then returns a 0-100 score, an A-F grade and a fix for every failing check.

## API

\`GET ${SITE_URL}/api/tools/agent-readiness?url=https://example.com\` returns the report as JSON (score, grade, categories, checks with status, evidence and fix, plus a generated robots.txt snippet and llms.txt starter). Rate-limited per IP; results are cached for 10 minutes.

## Status

- pass: full weight
- warn: half weight
- fail: no points
- could not verify: left out of the score (a blocked or timed-out request never counts as a fail)
- info: shown, not scored

## Checks

${byCat}

## FAQ

${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;
}
