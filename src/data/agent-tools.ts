// The four agent tools: shared links (cross-links on every tool page), JSON-LD, FAQs and their Markdown copies.
import { SITE_URL } from "../config/site.ts";

// Approximate token count for English text, HTML and code: about 4 characters per token.
export const approxTokens = (text: string) => Math.ceil(text.length / 4);

export const AGENT_TOOLS = [
  { href: "/tools/agent-readiness", title: "AI agent readiness checker", lead: "A 0-100 score for any URL, with a fix for each check." },
  { href: "/tools/llms-txt", title: "llms.txt generator and validator", lead: "Check an llms.txt line by line, or build one from a sitemap." },
  { href: "/tools/ai-robots-tester", title: "AI crawler robots.txt tester", lead: "Which AI crawlers your robots.txt lets in, and the rule that decides." },
  { href: "/tools/markdown-for-agents", title: "Markdown for agents tester", lead: "HTML next to the Markdown agents get, with token counts and headers." },
] as const;

export type Faq = { q: string; a: string };

export function toolJsonld(name: string, path: string, description: string, faq: Faq[], features: string[]) {
  return [
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication", name, url: `${SITE_URL}${path}`,
      applicationCategory: "DeveloperApplication", operatingSystem: "Web", isAccessibleForFree: true, description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@id": `${SITE_URL}/#organization` }, featureList: features,
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
}

const related = (self: string) => AGENT_TOOLS.filter((t) => t.href !== self).map((t) => `- [${t.title}](${SITE_URL}${t.href}) ([Markdown](${SITE_URL}${t.href}.md)): ${t.lead}`).join("\n");
const faqMd = (faq: Faq[]) => faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

export const LLMS_FAQ: Faq[] = [
  { q: "What is llms.txt?", a: "A Markdown file at the root of a site (/llms.txt) that gives language models a short, curated index: an H1 with the site name, a one-line summary, then sections of links to the pages worth reading, each with a short note. It is a community proposal, not a standard any crawler is required to read." },
  { q: "What does the validator check?", a: "That the file is plain text and not an HTML page, the first line is the only H1, a > summary follows it, links sit under ## sections, every link is absolute and well formed, there are no duplicates, an Optional section comes last, and the file stays under 50 KB. When it fetches a live file it also checks the HTTP status and Content-Type, and whether /llms-full.txt exists." },
  { q: "How does the generator work?", a: "It reads the site's home page for the name and summary, then the sitemap named in robots.txt (or /sitemap.xml), following a sitemap index into up to 3 child sitemaps. URLs are grouped by their first path segment, legal and account pages go under Optional, and titles come from the URL slug. Edit the titles, add a note to each link and cut what does not help a reader before you publish." },
  { q: "Is anything I paste stored?", a: "No. Pasted files are validated in your browser. Fetching a live file or a sitemap goes through our server, which only reads public URLs and keeps the result for 10 minutes." },
];

export const ROBOTS_FAQ: Faq[] = [
  { q: "Which rule decides for a crawler?", a: "A crawler follows the groups that name it (all of them, merged); if no group names it, it follows the User-agent: * group. Inside those groups the longest matching Allow or Disallow path wins, and Allow wins a tie. If no rule matches, the path is allowed. This tester applies the RFC 9309 rules, including * wildcards and $ end anchors." },
  { q: "Does blocking GPTBot keep me out of ChatGPT?", a: "No. GPTBot collects training data. ChatGPT search uses OAI-SearchBot and fetches pages for users with ChatGPT-User, and each has its own robots.txt name. The same split exists at Anthropic (ClaudeBot, Claude-SearchBot, Claude-User) and Perplexity (PerplexityBot, Perplexity-User)." },
  { q: "What are Google-Extended and Applebot-Extended?", a: "Control tokens, not crawlers. Googlebot and Applebot do the fetching; blocking the -Extended token tells Google or Apple not to use those pages to train their AI models, without leaving search." },
  { q: "What is Content-Signal?", a: "A robots.txt line such as Content-Signal: search=yes, ai-input=yes, ai-train=no that states how you allow your content to be used: search indexing, use as input for AI answers, and model training. It declares a preference; it does not block anyone by itself." },
];

export const MARKDOWN_FAQ: Faq[] = [
  { q: "What is Markdown for agents?", a: "When a request sends Accept: text/markdown, the server answers on the same URL with a Markdown version of the page and Content-Type: text/markdown, plus Vary: Accept so caches keep the two apart. A stable .md copy linked with <link rel=\"alternate\" type=\"text/markdown\"> serves agents that do not negotiate." },
  { q: "How are tokens counted?", a: "Approximately: about 4 characters per token, applied to the raw HTML and to the Markdown exactly as the server sends them. Real tokenizers differ by model, so use the numbers to compare the two, not as a bill." },
  { q: "Why does the Markdown copy need a canonical header?", a: "So search engines treat it as a variant of the HTML page instead of a duplicate. Send Link: <https://site/page>; rel=\"canonical\" on the .md response." },
  { q: "What does the tester fetch?", a: "Three requests at most, plus redirects: the page as a browser would ask for it, the same URL with Accept: text/markdown, and the Markdown copy linked from the page (or the guessed /page.md). It only reads public URLs and caches results for 10 minutes." },
];

export function llmsToolMarkdown() {
  return `# llms.txt generator and validator

Free tool on ${SITE_URL}/tools/llms-txt. Paste an llms.txt, or enter a site to fetch its live /llms.txt, and get line-by-line findings (errors, warnings, info). Or enter a site to generate a starter llms.txt from its sitemap.

## API

- \`GET ${SITE_URL}/api/tools/llms-txt?url=https://example.com\`: the live file, its HTTP status and Content-Type, and whether /llms-full.txt exists.
- \`GET ${SITE_URL}/api/tools/llms-txt?mode=sitemap&url=https://example.com\`: the site name, summary and up to 500 sitemap URLs.

Validation and generation run in the browser.

## FAQ

${faqMd(LLMS_FAQ)}

## Related agent tools

${related("/tools/llms-txt")}
`;
}

export function robotsToolMarkdown(bots: { name: string; owner: string; kind: string; note: string }[]) {
  return `# AI crawler robots.txt tester

Free tool on ${SITE_URL}/tools/ai-robots-tester. Paste a draft robots.txt or fetch a live one, enter a path, and see for each AI crawler whether it may fetch that path and which rule decides, grouped into AI search crawlers, user-triggered fetchers and training crawlers. Content-Signal lines and syntax problems are listed too.

## API

\`GET ${SITE_URL}/api/tools/ai-robots?url=https://example.com/path\`: the live robots.txt (status, Content-Type, body). Matching runs in the browser.

## Crawlers checked

${bots.map((b) => `- **${b.name}** (${b.owner}, ${b.kind === "user" ? "user-triggered" : b.kind}): ${b.note}`).join("\n")}

## FAQ

${faqMd(ROBOTS_FAQ)}

## Related agent tools

${related("/tools/ai-robots-tester")}
`;
}

export function markdownToolMarkdown() {
  return `# Markdown for agents tester

Free tool on ${SITE_URL}/tools/markdown-for-agents. Enter a URL: the tester fetches the HTML, the same URL with Accept: text/markdown, and the page's .md copy, then shows HTML and Markdown side by side with approximate token counts, the Content-Type, Vary, Link and canonical headers, and pass/fail notes.

## API

\`GET ${SITE_URL}/api/tools/markdown-for-agents?url=https://example.com/page\` returns the three responses (status, headers, size, tokens, first 40 KB of body) and the notes as JSON.

## FAQ

${faqMd(MARKDOWN_FAQ)}

## Related agent tools

${related("/tools/markdown-for-agents")}
`;
}
