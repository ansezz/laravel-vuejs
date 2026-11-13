// Offline tests for the AI agent readiness scanner (worker/agent-readiness.ts): URL safety, robots.txt rules,
// llms.txt parsing, scoring, and a full scan against a fake site (no network).
import { CHECKS, scoreOf, gradeOf, fixPrompt } from "../src/data/agent-readiness.ts";
import { validateLlms, generateLlms } from "../src/data/llms-txt.ts";
import { AI_BOTS } from "../src/data/robots.ts";
import { fetchLlms, readSitemap, fetchRobots, probeMarkdown, guessVariant } from "../worker/agent-tools.ts";
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


// ---------- llms.txt validator and generator ----------
const goodLlms = "# Good\n\n> A good site.\n\n## Docs\n\n- [Start](https://good.example.com/start): first steps\n- [API](https://good.example.com/api): reference\n\n## Optional\n\n- [Privacy](https://good.example.com/privacy): policy\n";
const v1 = validateLlms(goodLlms, { status: 200, contentType: "text/plain; charset=utf-8" });
ok(v1.valid && v1.warnings === 0 && v1.title === "Good" && v1.summary === "A good site." && v1.links === 3 && v1.sections.length === 2, `good llms.txt is valid (${JSON.stringify(v1.findings)})`);
ok(!validateLlms("<!doctype html><html></html>").valid, "HTML page is an error");
ok(validateLlms("Intro\n# Title\n\n## A\n\n- [x](https://a.example.com/x): y").findings.some((f) => f.level === "error" && f.line === 1), "H1 not first is an error on line 1");
const rel = validateLlms("# T\n\n> s\n\n## A\n\n- [x](/x): y\n- [x](/x): y\n");
ok(rel.findings.some((f) => f.level === "error" && f.line === 7 && /Relative/.test(f.message)), "relative link error on its line");
ok(rel.findings.some((f) => f.level === "warning" && f.line === 8 && /Duplicate/.test(f.message)), "duplicate link warning");
ok(validateLlms("# T\n\n## A\n\n- [x](https://a.example.com/): y").findings.some((f) => f.level === "warning" && /summary/.test(f.message)), "missing summary warning");
ok(!validateLlms(goodLlms, { status: 200, contentType: "text/html" }).valid, "served as text/html is an error");
ok(!validateLlms("# T\n\n> s\n").valid, "no links is an error");
ok(validateLlms("- [A](https://a.example.com/) ([Markdown](https://a.example.com/a.md)): note", undefined).findings.every((f) => !/Broken/.test(f.message)), "extra links after the first are fine");
const gen = generateLlms({ name: "Good", summary: "A good site.", base: "https://good.example.com", urls: ["https://good.example.com/", "https://good.example.com/about", "https://good.example.com/privacy-policy", "https://good.example.com/docs/getting-started", "https://good.example.com/docs/api", { loc: "https://good.example.com/blog/hello", title: "Hello world" }] });
ok(validateLlms(gen).valid, `generated llms.txt validates:\n${gen}`);
ok(gen.includes("## Pages") && gen.includes("## Docs") && gen.includes("[Getting started](https://good.example.com/docs/getting-started)") && gen.includes("[Hello world]"), "generator groups by first path segment");
ok(gen.indexOf("## Optional") > gen.indexOf("## Docs") && /## Optional\n\n- \[Privacy policy\]/.test(gen), "legal pages go to a last Optional section");

// ---------- robots.txt tester data ----------
for (const name of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "CCBot", "Applebot-Extended", "Bytespider"]) ok(AI_BOTS.some((b) => b.name === name), `${name} is in the crawler list`);
const rb = parseRobots("User-agent: *\nDisallow: /private\nCrawl-delay: 5\nFoo: bar\nnot a line\nContent-Signal: search=yes, ai-train=maybe\n");
ok(robotsVerdict(rb, "GPTBot", "/private/x").line === 2, "verdict reports the deciding line");
ok(rb.issues.some((i) => i.line === 4 && i.level === "warning") && rb.issues.some((i) => i.line === 5 && i.level === "error") && rb.issues.some((i) => i.line === 3 && i.level === "info") && rb.issues.some((i) => i.line === 6), "robots.txt issues have line numbers");
ok(rb.groups[0].signals[0].line === 6, "Content-Signal keeps its line");

const pub = async () => ["93.184.216.34"];
const rf404 = await fetchRobots("https://none.example.com/blog/post?a=1", { resolve: pub, fetch: async () => new Response("nope", { status: 404 }) });
ok(!rf404.error && rf404.status === 404 && /allow everything/.test(rf404.note) && rf404.path === "/blog/post?a=1", "404 robots.txt explained, path kept");
const rfPriv = await fetchRobots("https://x.example.com", { resolve: async () => ["127.0.0.1"], fetch: async () => { throw new Error("must not fetch"); } });
ok(rfPriv.error && /private/.test(rfPriv.error), "robots fetch refuses private hosts");
const rfLive = await fetchRobots(site, { resolve: pub, fetch: fakeFetch });
ok(!rfLive.error && rfLive.body.includes("Content-Signal"), "robots fetch returns the body");

// ---------- llms.txt fetch and sitemap read ----------
const lf = await fetchLlms(site, { resolve: pub, fetch: fakeFetch });
ok(!lf.error && lf.status === 200 && lf.body.startsWith("# Good") && lf.full.status === 404, "llms.txt fetch with llms-full status");
const sm = await readSitemap("https://good.example.com", { resolve: pub, fetch: async (url) => {
  const p = new URL(url).pathname;
  if (p === "/robots.txt") return new Response("User-agent: *\nSitemap: https://good.example.com/sitemap_index.xml\n", { headers: { "content-type": "text/plain" } });
  if (p === "/sitemap_index.xml") return new Response("<sitemapindex><sitemap><loc>https://good.example.com/s1.xml</loc></sitemap><sitemap><loc>https://good.example.com/image-sitemap.xml</loc></sitemap><sitemap><loc>https://good.example.com/s2.xml</loc></sitemap></sitemapindex>", { headers: { "content-type": "application/xml" } });
  if (p === "/s1.xml") return new Response("<urlset><url><loc>https://good.example.com/a</loc></url><url><loc>https://other.example.org/x</loc></url></urlset>");
  if (p === "/s2.xml") return new Response("<urlset><url><loc><![CDATA[https://www.good.example.com/docs/b]]></loc></url></urlset>");
  if (p === "/image-sitemap.xml") throw new Error("image sitemaps are skipped");
  return fakeFetch(url, { headers: { Accept: "text/html" } });
} });
ok(!sm.error && sm.urls.length === 2 && sm.urls.includes("https://good.example.com/a") && sm.urls.includes("https://www.good.example.com/docs/b") && sm.name === "Good site", `sitemap index followed, other hosts dropped (${JSON.stringify(sm)})`);

// ---------- Markdown for agents probe ----------
ok(guessVariant(new URL("https://a.example.com/")) === "https://a.example.com/index.md" && guessVariant(new URL("https://a.example.com/docs/x/")) === "https://a.example.com/docs/x.md", "guessed .md URLs");
const mp = await probeMarkdown(site, { resolve: pub, fetch: fakeFetch });
ok(!mp.error && mp.negotiated.markdown && mp.variant.markdown && !mp.variant.guessed && mp.saving > 0, "probe finds both Markdown versions");
ok(!mp.error && mp.notes.some((n) => n.status === "pass" && /same URL/.test(n.text)) && mp.notes.some((n) => n.status === "warn" && /HTML response has no Vary/.test(n.text)), `probe notes (${JSON.stringify(mp.notes)})`);
const plain = await probeMarkdown("https://plain.example.com/page", { resolve: pub, fetch: async (url) => new URL(url).pathname === "/page" ? new Response("<!doctype html><html><head><link rel=canonical href=https://plain.example.com/page></head><body>hi</body></html>", { headers: { "content-type": "text/html" } }) : new Response("nope", { status: 404, headers: { "content-type": "text/html" } }) });
ok(!plain.error && plain.notes.filter((n) => n.status === "fail").length === 2 && plain.saving === null && plain.variant.url === "https://plain.example.com/page.md", "HTML-only page fails negotiation and the alternate link");
const plainMd = await probeMarkdown("https://typed.example.com/", { resolve: pub, fetch: async (url, init) => /markdown/.test(init.headers.Accept) && new URL(url).pathname === "/" ? new Response("# Hi\n", { headers: { "content-type": "text/plain" } }) : new URL(url).pathname === "/" ? new Response("<!doctype html><html><body>hi</body></html>", { headers: { "content-type": "text/html" } }) : new Response("no", { status: 404 }) });
ok(!plainMd.error && plainMd.notes[0].status === "warn" && /labelled text\/plain/.test(plainMd.notes[0].text), "Markdown served as text/plain is partial, not fail");
const mdDown = await probeMarkdown("https://down.example.com", { resolve: pub, fetch: async () => new Response("", { status: 503 }) });
ok(mdDown.error && /503/.test(mdDown.error), "probe reports a page that is down");

if (failures) { console.error(`${failures} agent readiness check(s) failed`); process.exit(1); }
console.log("agent tools (readiness scanner, llms.txt, robots.txt, Markdown probe): all checks passed");
