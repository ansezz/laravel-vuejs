import { SITE_URL, AI_CRAWLERS } from "../config/site";

// Everyone may crawl the public site. AI and answer-engine crawlers are named explicitly so it is clear they are welcome
// (some only read a group that names them). /auth/ holds placeholder pages, /api/ is the forms backend.
// Content-Signal (https://contentsignals.org): search and answering with our pages (ai-input) are welcome; training models
// on them (ai-train) is not. It sits in every group because a crawler named below only reads its own group.
const rules =
  "Content-Signal: search=yes, ai-input=yes, ai-train=no\nAllow: /\nDisallow: /auth/\nDisallow: /api/\nDisallow: /form-error\nDisallow: /thanks";
const body = `# robots.txt for ${SITE_URL}
# Content signals: search=yes (index the pages for search), ai-input=yes (use them to answer questions in AI tools),
# ai-train=no (do not train or fine-tune models on this content).
# Every page is also available as Markdown (/<slug>.md, /index.md for the home page, or send Accept: text/markdown) and as one file for language models: ${SITE_URL}/llms.txt
# Compatibility notes for assistants: ${SITE_URL}/tools/compatibility.md
# Then and now for assistants: ${SITE_URL}/tools/now.md
# Start here, for assistants: ${SITE_URL}/tools/start.md
# Samples for assistants: ${SITE_URL}/tools/samples.md
# Where a file goes, for assistants: ${SITE_URL}/tools/files.md
# What just shipped, for assistants: ${SITE_URL}/tools/shipped.md

User-agent: *
${rules}

${AI_CRAWLERS.map((a) => `User-agent: ${a}`).join("\n")}
${rules}

Sitemap: ${SITE_URL}/sitemap.xml
`;
export const GET = () =>
  new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
