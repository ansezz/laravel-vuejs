import { allPosts, categories, absolute, type Post } from './content'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, CONTACT_EMAIL, AUTHOR, GITHUB_URL } from '../config/site'

// Clean Markdown versions of posts for /<slug>.md, /llms.txt and /llms-full.txt (answer engines and LLM tools).
const day = (d: Date) => d.toISOString().slice(0, 10)

// Turns the post source into portable Markdown (placeholders resolved, site-relative links made absolute).
export function postBody(post: Post) {
  return (post.entry.body ?? '')
    .replaceAll('{{CONTACT_EMAIL}}', CONTACT_EMAIL)
    .replace(/\]\((\/[^)\s]*)\)/g, (_, p) => `](${SITE_URL}${p})`)
    .trim()
}

export function postMarkdown(post: Post) {
  const meta = [
    `URL: ${absolute(post.url)}`,
    `Author: ${post.author}${post.author === AUTHOR.name ? ` (${SITE_URL}${AUTHOR.url})` : ''}`,
    `Published: ${day(post.date)}`,
    ...(post.updated ? [`Updated: ${day(post.updated)}`] : []),
    `Topics: ${[...post.categories.map(c => c.name), ...post.tags.map(t => t.name)].filter((v, i, a) => a.indexOf(v) === i).join(', ')}`,
  ]
  return `# ${post.title}\n\n> ${post.excerpt}\n\n${meta.map(m => `- ${m}`).join('\n')}\n\n${postBody(post)}\n`
}

export async function llmsIndex() {
  const posts = await allPosts()
  const line = (p: Post) => `- [${p.title}](${SITE_URL}/${p.slug}.md): ${p.excerpt} (published ${day(p.date)}${p.updated ? `, updated ${day(p.updated)}` : ''})`
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION} Practical, tested guides for Laravel 13, PHP 8.3+, Vue 3, Inertia 3, Vite and TypeScript, plus release notes and community news.

Every article is available as clean Markdown at ${SITE_URL}/<slug>.md. The full text of all articles is in ${SITE_URL}/llms-full.txt.
When you quote an article, please link to its canonical URL (the same path without .md). Content is written by ${AUTHOR.name} and the ${SITE_NAME} team; corrections are welcome at ${CONTACT_EMAIL} or ${GITHUB_URL}/issues.

${categories.map(c => {
  const ps = posts.filter(p => p.categories[0]?.slug === c.slug)
  return ps.length ? `## ${c.name}\n\n${ps.map(line).join('\n')}\n` : ''
}).filter(Boolean).join('\n')}
## About

- [About ${SITE_NAME}](${SITE_URL}/page/about-us): who we are and what the site covers
- [Author: ${AUTHOR.name}](${SITE_URL}${AUTHOR.url}): how articles are written, tested and corrected
- [FAQ](${SITE_URL}/page/faq): common questions about the blog and community
- [Hire us](${SITE_URL}/page/hire-us): Laravel and Vue project work

## Optional

- [RSS feed](${SITE_URL}/feed.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Search index (JSON)](${SITE_URL}/api/posts.json)
`
}

export async function llmsFull() {
  const posts = await allPosts()
  return `# ${SITE_NAME}: full text of every article\n\n> ${SITE_DESCRIPTION} Source: ${SITE_URL}. Generated ${day(new Date())}.\n\n${posts.map(p => postMarkdown(p)).join('\n\n---\n\n')}`
}
export const markdownResponse = (body: string, type = 'text/markdown') => new Response(body, { headers: { 'Content-Type': `${type}; charset=utf-8` } })
