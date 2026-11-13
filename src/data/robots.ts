// robots.txt parser and matcher (RFC 9309), shared by the Worker (agent readiness scans) and the browser
// (AI crawler robots.txt tester). No DOM or Node APIs.

export type RobotsRule = { allow: boolean; path: string; line: number };
export type RobotsGroup = { agents: string[]; rules: RobotsRule[]; signals: { value: string; line: number }[]; line: number };
export type RobotsIssue = { line: number; level: "error" | "warning" | "info"; message: string };
export type Robots = { groups: RobotsGroup[]; sitemaps: string[]; invalid: number; issues: RobotsIssue[] };

const KNOWN = new Set(["user-agent", "allow", "disallow", "sitemap", "content-signal", "crawl-delay", "host", "clean-param", "request-rate", "visit-time", "noindex"]);

// Groups start at User-agent lines (consecutive User-agent lines share one group); Allow/Disallow/Content-Signal lines
// belong to the open group. Sitemap lines are global.
export function parseRobots(text: string): Robots {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  const issues: RobotsIssue[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  let invalid = 0;
  text.split(/\r\n|\r|\n/).forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) return;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) {
      invalid++;
      issues.push({ line: n, level: "error", message: `Not a "field: value" line: ${line.slice(0, 80)}` });
      return;
    }
    const key = m[1].toLowerCase(), value = m[2].trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) { current = { agents: [], rules: [], signals: [], line: n }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      if (!value) issues.push({ line: n, level: "error", message: "Empty User-agent value." });
      lastWasAgent = true;
      return;
    }
    lastWasAgent = false;
    if (key === "sitemap") {
      if (value) sitemaps.push(value);
      if (!/^https?:\/\//i.test(value)) issues.push({ line: n, level: "warning", message: "Sitemap should be an absolute URL." });
      return;
    }
    if (!KNOWN.has(key)) { invalid++; issues.push({ line: n, level: "warning", message: `Unknown directive "${m[1]}": crawlers ignore it.` }); return; }
    if (!current) { issues.push({ line: n, level: "warning", message: `"${m[1]}" before any User-agent line is ignored.` }); return; }
    if (key === "allow" || key === "disallow") {
      if (value && !value.startsWith("/") && !value.startsWith("*")) issues.push({ line: n, level: "warning", message: `Rule paths should start with "/": ${value}` });
      if (value || key === "allow") current.rules.push({ allow: key === "allow", path: value, line: n });
      return;
    }
    if (key === "content-signal") {
      current.signals.push({ value, line: n });
      if (!validSignal(value)) issues.push({ line: n, level: "warning", message: "Content-Signal should be comma-separated search / ai-input / ai-train = yes|no pairs." });
      return;
    }
    if (key === "crawl-delay" || key === "host" || key === "clean-param" || key === "request-rate" || key === "visit-time" || key === "noindex") {
      issues.push({ line: n, level: "info", message: `"${m[1]}" is not part of RFC 9309; some crawlers ignore it.` });
    }
  });
  return { groups, sitemaps, invalid, issues };
}

function ruleMatches(rule: string, path: string) {
  if (!rule) return false;
  const anchored = rule.endsWith("$");
  const body = anchored ? rule.slice(0, -1) : rule;
  const re = new RegExp("^" + body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + (anchored ? "$" : ""));
  return re.test(path);
}

export type Verdict = { allowed: boolean; rule?: string; line?: number; group: string };

// Which rule decides whether `agent` may fetch `path`: the agent's own groups (merged), else the * groups.
// Longest matching rule wins; Allow wins a tie. No matching rule means allowed.
export function robotsVerdict(robots: Robots, agent: string, path: string): Verdict {
  const token = agent.toLowerCase();
  let groups = robots.groups.filter((g) => g.agents.includes(token));
  let group = agent;
  if (!groups.length) { groups = robots.groups.filter((g) => g.agents.includes("*")); group = "*"; }
  let best: RobotsRule | undefined;
  for (const r of groups.flatMap((g) => g.rules)) {
    if (!ruleMatches(r.path, path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow && !best.allow)) best = r;
  }
  return { allowed: best ? best.allow : true, rule: best ? `${best.allow ? "Allow" : "Disallow"}: ${best.path}` : undefined, line: best?.line, group };
}

export function validSignal(value: string): boolean {
  const pairs = value.split(",").map((p) => p.trim()).filter(Boolean);
  return pairs.length > 0 && pairs.every((p) => /^(search|ai-input|ai-train)\s*=\s*(yes|no)$/i.test(p));
}

export type BotKind = "training" | "search" | "user";
export type Bot = { name: string; owner: string; kind: BotKind; note: string };

// AI crawlers by job. Training crawlers collect pages that may train models; search crawlers index pages so an assistant
// can cite them; user-triggered fetchers load a page when a person asks about it.
export const AI_BOTS: Bot[] = [
  { name: "GPTBot", owner: "OpenAI", kind: "training", note: "Collects pages that may train OpenAI models." },
  { name: "ClaudeBot", owner: "Anthropic", kind: "training", note: "Collects pages that may train Anthropic models." },
  { name: "Google-Extended", owner: "Google", kind: "training", note: "Control token, not a crawler: Googlebot's pages may be used for Gemini training unless blocked." },
  { name: "Applebot-Extended", owner: "Apple", kind: "training", note: "Control token, not a crawler: Applebot's pages may train Apple models unless blocked." },
  { name: "CCBot", owner: "Common Crawl", kind: "training", note: "Open web archive many models train on." },
  { name: "Meta-ExternalAgent", owner: "Meta", kind: "training", note: "Collects pages for Meta AI models." },
  { name: "Bytespider", owner: "ByteDance", kind: "training", note: "Collects pages for ByteDance models." },
  { name: "cohere-training-data-crawler", owner: "Cohere", kind: "training", note: "Collects pages for Cohere models." },
  { name: "OAI-SearchBot", owner: "OpenAI", kind: "search", note: "Indexes pages for ChatGPT search answers and citations." },
  { name: "Claude-SearchBot", owner: "Anthropic", kind: "search", note: "Indexes pages for Claude search answers." },
  { name: "PerplexityBot", owner: "Perplexity", kind: "search", note: "Indexes pages for Perplexity answers." },
  { name: "Googlebot", owner: "Google", kind: "search", note: "Google Search, AI Overviews and Gemini grounding." },
  { name: "Bingbot", owner: "Microsoft", kind: "search", note: "Bing and Copilot; also used for some ChatGPT grounding." },
  { name: "Applebot", owner: "Apple", kind: "search", note: "Siri and Spotlight suggestions." },
  { name: "DuckAssistBot", owner: "DuckDuckGo", kind: "search", note: "DuckDuckGo AI answers." },
  { name: "Amazonbot", owner: "Amazon", kind: "search", note: "Alexa answers and Amazon services." },
  { name: "ChatGPT-User", owner: "OpenAI", kind: "user", note: "Fetches a page when a ChatGPT user asks about it." },
  { name: "Claude-User", owner: "Anthropic", kind: "user", note: "Fetches a page when a Claude user asks about it." },
  { name: "Perplexity-User", owner: "Perplexity", kind: "user", note: "Fetches a page when a Perplexity user asks about it." },
  { name: "MistralAI-User", owner: "Mistral", kind: "user", note: "Fetches a page when a Le Chat user asks about it." },
  { name: "Meta-ExternalFetcher", owner: "Meta", kind: "user", note: "Fetches a link a Meta AI user shares." },
];

export const BOT_KINDS: { kind: BotKind; title: string; lead: string }[] = [
  { kind: "search", title: "AI search crawlers", lead: "Index pages so assistants can find and cite them. Blocking them removes you from those answers." },
  { kind: "user", title: "User-triggered fetchers", lead: "Load one page when a person asks an assistant about it." },
  { kind: "training", title: "Training crawlers", lead: "Collect pages that may train models. Blocking them is a policy choice and does not remove you from AI search." },
];
