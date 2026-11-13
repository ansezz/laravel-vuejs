// Offline tests for the AI agent readiness scanner (worker/agent-readiness.ts): URL safety, robots.txt rules,
// llms.txt parsing, scoring, and a full scan against a fake site (no network).
import { CHECKS, scoreOf, gradeOf, fixPrompt } from "../src/data/agent-readiness.ts";
import { normalizeTarget, isPrivateIp, parseRobots, robotsVerdict, validSignal, parseLlms, visibleText, scan, MAX_FETCHES } from "../worker/agent-readiness.ts";

let failures = 0;
const ok = (cond, message) => { if (!cond) { failures++; console.error(`✗ ${message}`); } };

// URL validation and SSRF guards
for (const bad of ["ftp://example.com", "http://localhost/", "http://127.0.0.1/", "http://10.0.0.5/", "http://192.168.1.1/", "http://169.254.169.254/latest/meta-data",
  "http://[::1]/", "http://[fd00::1]/", "http://[::ffff:127.0.0.1]/", "https://example.com:8443/", "https://user:pass@example.com/", "http://intranet/", "https://printer.local/", "http://100.64.1.1/", ""]) {
  ok(typeof normalizeTarget(bad) === "string", `should refuse ${bad || "(empty)"}`);
}
for (const good of ["example.com", "https://laravel-vuejs.space/", "http://example.org:80/a?b=1#frag", "https://8.8.8.8/"]) {
  const u = normalizeTarget(good);
  ok(typeof u !== "string" && !u.hash, `should accept ${good}`);
}
for (const ip of ["10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.0.1", "127.0.0.1", "0.0.0.0", "169.254.1.1", "100.100.100.100", "224.0.0.1", "::1", "fe80::1", "fc00::1", "::ffff:10.0.0.1", "::ffff:a00:1", "2001:db8::1"]) ok(isPrivateIp(ip), `${ip} is private`);
for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "104.21.0.1", "2606:4700::6810:1"]) ok(!isPrivateIp(ip), `${ip} is public`);

// robots.txt
const robots = parseRobots(`# comment
User-agent: *
Disallow: /api/
Allow: /api/posts.json
Content-Signal: search=yes, ai-input=yes, ai-train=no

User-agent: GPTBot
User-agent: CCBot
Disallow: /

User-agent: PerplexityBot
Disallow: /private
Allow: /private/ok$
Sitemap: https://example.com/sitemap.xml
`);
ok(robots.groups.length === 3, "three robots groups");
ok(robots.sitemaps[0] === "https://example.com/sitemap.xml", "sitemap line parsed");
ok(robotsVerdict(robots, "OAI-SearchBot", "/").allowed, "OAI-SearchBot falls back to * and is allowed on /");
ok(!robotsVerdict(robots, "OAI-SearchBot", "/api/x").allowed, "* Disallow: /api/ applies");
ok(robotsVerdict(robots, "OAI-SearchBot", "/api/posts.json").allowed, "longer Allow wins");
ok(!robotsVerdict(robots, "GPTBot", "/").allowed && !robotsVerdict(robots, "CCBot", "/x").allowed, "grouped user-agents share rules");
ok(robotsVerdict(robots, "PerplexityBot", "/private/ok").allowed && !robotsVerdict(robots, "PerplexityBot", "/private/ok2").allowed, "$ anchors");
ok(validSignal("search=yes, ai-input=yes, ai-train=no") && !validSignal("search=maybe") && !validSignal(""), "Content-Signal validation");

// llms.txt
const l = parseLlms("# Site\n\n> Summary\n\n## Docs\n\n- [A](https://example.com/a): note\n- [B](/b)\n");
ok(l.h1First && l.summary && l.sections === 1 && l.links === 2 && l.relative === 1, "llms.txt parsed");
ok(visibleText("<head><title>x</title></head><body><script>var a=1</script><p>Hello &amp; bye</p></body>") === "Hello & bye", "visible text strips scripts and head");

// scoring
const row = (status, weight = 2) => ({ id: "x", category: "content", title: "x", status, weight, optional: false, summary: "", evidence: "" });
ok(scoreOf([row("pass"), row("fail")]) === 50, "pass + fail = 50");
ok(scoreOf([row("pass"), row("unverified"), row("info")]) === 100, "could-not-verify and info are not counted");
ok(scoreOf([row("warn")]) === 50, "warn is half");
ok(scoreOf([row("unverified")]) === null, "nothing scored = null");
ok(gradeOf(90) === "A" && gradeOf(89) === "B" && gradeOf(59) === "F", "grades");
ok(new Set(CHECKS.map((c) => c.id)).size === CHECKS.length, "check ids are unique");
ok(CHECKS.filter((c) => c.optional).every((c) => c.weight <= 1), "optional checks weigh at most 1");

// Full scan against a fake site: no network, DNS answers are public.
const site = "https://good.example.com";
const page = `<!doctype html><html lang="en"><head><title>Good site</title><meta name="description" content="A good site that agents can read without running JavaScript at all.">
<link rel="canonical" href="${site}/"><link rel="alternate" type="text/markdown" href="/index.md"><link rel="alternate" type="application/rss+xml" href="/feed.xml">
<meta property="og:title" content="Good"><meta property="og:description" content="Good"><meta property="og:image" content="${site}/og.png">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Good"},{"@type":"WebSite"}]}</script></head>
<body><header><nav><a href="/docs">Docs</a> <a href="/blog">Blog</a></nav></header><main><h1>Hello agents</h1><img src="/a.png" alt="A chart"><img src="/b.png" alt="">
<p>${"word ".repeat(200)}</p></main><footer>f</footer></body></html>`;
const H = (type, extra = {}) => ({ "content-type": type, ...extra });
const routes = {
  "/": { status: 200, headers: H("text/html; charset=utf-8", { "strict-transport-security": "max-age=31536000", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'self'", link: `<${site}/>; rel="canonical"`, "access-control-allow-origin": "*" }), body: page },
  "/robots.txt": { status: 200, headers: H("text/plain"), body: `User-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${site}/sitemap.xml\n` },
  "/sitemap.xml": { status: 200, headers: H("application/xml"), body: `<?xml version="1.0"?><urlset><url><loc>${site}/</loc></url></urlset>` },
  "/llms.txt": { status: 200, headers: H("text/plain"), body: `# Good\n\n> A good site.\n\n## Docs\n\n- [Docs](${site}/docs): the docs\n` },
  "/index.md": { status: 200, headers: H("text/markdown"), body: "# Hello agents\n" },
  "/.well-known/api-catalog": { status: 200, headers: H("application/linkset+json"), body: JSON.stringify({ linkset: [{ anchor: `${site}/.well-known/api-catalog`, item: [{ href: `${site}/feed.xml` }] }] }) },
};
let calls = 0;
const fakeFetch = async (url, init) => {
  calls++;
  const u = new URL(url);
  if (u.protocol === "http:") return new Response(null, { status: 301, headers: { location: `https://${u.host}${u.pathname}` } });
  if (u.pathname === "/" && /text\/markdown/.test(init.headers.Accept)) return new Response("# Hello agents\n", { status: 200, headers: { "content-type": "text/markdown; charset=utf-8", vary: "Accept", "access-control-allow-origin": "*" } });
  const r = routes[u.pathname];
  return r ? new Response(r.body, { status: r.status, headers: r.headers }) : new Response("Not found", { status: 404, headers: { "content-type": "text/html" } });
};
const report = await scan(site, { fetch: fakeFetch, resolve: async () => ["93.184.216.34"] });
ok(!report.error, `scan returned a report: ${report.error ?? ""}`);
if (!report.error) {
  const by = Object.fromEntries(report.checks.map((c) => [c.id, c.status]));
  for (const id of ["robots", "sitemap", "llms", "content-signal", "feed", "page", "title", "h1", "text", "jsonld", "jsonld-types", "opengraph", "lang", "single-h1", "landmarks", "alt", "description", "canonical", "ai-bots", "bot-wall", "indexable", "markdown-negotiation", "markdown-alternate", "link-header", "api-catalog", "https", "hsts", "nosniff", "csp", "cors"]) {
    ok(by[id] === "pass", `good site: ${id} should pass, got ${by[id]} (${report.checks.find((c) => c.id === id)?.summary})`);
  }
  for (const id of ["openapi", "mcp-card", "agent-card", "agents-json"]) ok(by[id] === "fail", `good site: optional ${id} should fail`);
  ok(report.checks.length === CHECKS.length, `every check reported (${report.checks.length}/${CHECKS.length})`);
  ok(report.score >= 90 && report.grade === "A", `good site scores A (got ${report.score})`);
  ok(report.fetches <= MAX_FETCHES && calls <= MAX_FETCHES, `stays within ${MAX_FETCHES} requests (${calls})`);
  ok(report.checks.find((c) => c.id === "ai-bots").summary.includes("GPTBot blocked"), "training crawler block is reported");
  ok(report.generated.llms.startsWith("# ") && report.generated.llms.includes(`${site}/docs`), "llms.txt starter has links");
  ok(report.generated.robots.includes("Content-Signal:") && report.generated.robots.includes("User-agent: OAI-SearchBot"), "robots.txt snippet");
  ok(fixPrompt(report).includes("OpenAPI document"), "fix prompt lists failing checks");
}

// A bot wall makes content checks "could not verify", never "fail".
const walled = await scan("https://walled.example.com", { resolve: async () => ["93.184.216.34"], fetch: async (url) => {
  const u = new URL(url);
  if (u.pathname === "/") return new Response("<html><head><title>Just a moment...</title></head><body></body></html>", { status: 403, headers: { "content-type": "text/html", "cf-mitigated": "challenge" } });
  return new Response("nope", { status: 404 });
} });
if (!walled.error) {
  const by = Object.fromEntries(walled.checks.map((c) => [c.id, c.status]));
  ok(by["bot-wall"] === "fail", "bot wall detected");
  for (const id of ["title", "h1", "text", "jsonld", "alt", "lang"]) ok(by[id] === "unverified", `walled: ${id} is could-not-verify (got ${by[id]})`);
} else ok(false, `walled scan errored: ${walled.error}`);

// DNS that points at a private address is refused, including after a redirect.
const priv = await scan("https://sneaky.example.com", { resolve: async () => ["10.0.0.7"], fetch: async () => { throw new Error("must not fetch"); } });
ok(priv.error && /private/.test(priv.error), "hostname resolving to a private IP is refused");
let redirected = false;
const hop = await scan("https://hop.example.com", {
  resolve: async (h) => (h === "internal.example.com" ? ["192.168.1.10"] : ["93.184.216.34"]),
  fetch: async (url) => { if (new URL(url).hostname === "internal.example.com") redirected = true; return new Response(null, { status: 302, headers: { location: "https://internal.example.com/" } }); },
});
ok(!redirected, "redirect to a private host is never fetched");
ok(hop.error && /private/.test(hop.error), "a redirect to a private host ends the scan with an error");

// Timeouts are could-not-verify.
const slow = await scan("https://slow.example.com", { resolve: async () => ["93.184.216.34"], timeoutMs: 50, fetch: (url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })))) });
ok(slow.error && /timed out/.test(slow.error), "a page that times out is reported, not scored");

// A page that doesn't answer (5xx, timeout) is not scored at all.
const cdn = await scan("https://down.example.com", { resolve: async () => ["93.184.216.34"], fetch: async () => new Response("error code: 522", { status: 522, headers: { "content-type": "text/plain" } }) });
ok(cdn.error && /522/.test(cdn.error), "522 on the page returns an error, not a score");

// A 5xx on a secondary file is could-not-verify, and its headers are not graded.
const partial = await scan(site, { resolve: async () => ["93.184.216.34"], fetch: async (url, init) => new URL(url).pathname === "/" && !/markdown/.test(init.headers.Accept) ? fakeFetch(url, init) : new Response("bad gateway", { status: 502 }) });
if (!partial.error) {
  const by = Object.fromEntries(partial.checks.map((c) => [c.id, c.status]));
  for (const id of ["robots", "sitemap", "llms", "content-signal", "ai-bots", "markdown-negotiation", "api-catalog", "mcp-card"]) ok(by[id] === "unverified", `502: ${id} is could-not-verify (got ${by[id]})`);
  ok(by.cors === "pass", "page headers still graded when only other files fail");
} else ok(false, `partial scan errored: ${partial.error}`);

if (failures) { console.error(`${failures} agent readiness check(s) failed`); process.exit(1); }
console.log("agent readiness scanner: all checks passed");
