import { SITE_URL, AI_CRAWLERS } from '../config/site'

// Everyone may crawl the public site. AI and answer-engine crawlers are named explicitly so it is clear they are welcome
// (some only read a group that names them). /auth/ holds placeholder pages, /api/ is the forms backend.
const rules = 'Allow: /\nDisallow: /auth/\nDisallow: /api/\nDisallow: /form-error\nDisallow: /thanks'
const body = `# robots.txt for ${SITE_URL}
# Articles are also available as Markdown (/<slug>.md) and as one file for language models: ${SITE_URL}/llms.txt

User-agent: *
${rules}

${AI_CRAWLERS.map(a => `User-agent: ${a}`).join('\n')}
${rules}

Sitemap: ${SITE_URL}/sitemap.xml
`
export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
