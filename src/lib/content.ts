import { getCollection, type CollectionEntry } from 'astro:content'
import taxonomies from '../content/taxonomies.json'
import { CONTACT_EMAIL, SITE_URL } from '../config/site'

export type Category = { id: string; slug: string; name: string; description: string }
export type Tag = { id: string; slug: string; name: string }
export const categories: Category[] = taxonomies.categories
export const tags: Tag[] = taxonomies.tags
export const categoryBySlug = (slug: string) => categories.find(c => c.slug === slug) ?? { id: slug, slug, name: slug, description: '' }
export const tagBySlug = (slug: string) => tags.find(t => t.slug === slug) ?? { id: slug, slug, name: slug }

export type Post = {
  entry: CollectionEntry<'posts'>
  id: number; slug: string; url: string; title: string; excerpt: string; description: string; seoTitle?: string
  date: Date; updated?: Date; featured: boolean; author: string
  categories: Category[]; tags: Tag[]; readingMinutes: number; hue: number; snippet: string
}

// ~230 words per minute for prose, code counted at roughly half speed
const words = (s: string) => s.split(/\s+/).filter(Boolean).length + (s.match(/```[\s\S]*?```/g) ?? []).join(' ').split(/\s+/).length * 0.5

// Scheduled publishing: a post whose `date` is in the future is left out of the build (lists, feeds, sitemap,
// search index and its own page) until a rebuild after that moment. The daily `publish-scheduled` workflow triggers it.
// Future posts are included in Workers Builds previews (any branch other than master) and when SHOW_FUTURE_POSTS=1,
// so they can be reviewed before they go live.
export const BUILD_TIME = new Date()
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
export const showFuturePosts = env.SHOW_FUTURE_POSTS === '1'
  || (!!env.WORKERS_CI_BRANCH && env.WORKERS_CI_BRANCH !== 'master')
export const isPublished = (date: Date) => showFuturePosts || date.getTime() <= BUILD_TIME.getTime()

let cache: Post[] | undefined
export async function allPosts(): Promise<Post[]> {
  if (cache) return cache
  const all = await getCollection('posts')
  const entries = all.filter(e => isPublished(e.data.date))
  const hidden = all.length - entries.length
  if (hidden) console.info(`[scheduled publishing] ${hidden} future-dated post(s) left out of this build: ${all.filter(e => !entries.includes(e)).map(e => `${e.id} (${e.data.date.toISOString()})`).join(', ')}`)
  else if (showFuturePosts) console.info('[scheduled publishing] preview build: future-dated posts are included')
  cache = entries.map((entry) => {
    const d = entry.data
    return {
      entry, id: d.id, slug: entry.id, url: `/${entry.id}`, title: d.title, excerpt: d.excerpt, seoTitle: d.seoTitle, description: d.description ?? clip(d.excerpt, 155),
      date: d.date, updated: d.updated, featured: d.featured, author: d.author,
      categories: d.categories.map(categoryBySlug), tags: d.tags.map(tagBySlug),
      readingMinutes: Math.max(1, Math.round(words(entry.body ?? '') / 230)), snippet: d.snippet ?? `cat ${entry.id}.md`,
      hue: (d.id * 47) % 360,
    }
  }).sort((a, b) => b.id - a.id || +b.date - +a.date)
  return cache
}

export function related(post: Post, posts: Post[], n = 3) {
  const keys = new Set([...post.tags.map(t => 't:' + t.slug), ...post.categories.map(c => 'c:' + c.slug)])
  return posts.filter(p => p.slug !== post.slug)
    .map(p => ({ p, s: [...p.tags.map(t => 't:' + t.slug), ...p.categories.map(c => 'c:' + c.slug)].filter(k => keys.has(k)).length }))
    .sort((a, b) => b.s - a.s || b.p.id - a.p.id).slice(0, n).map(x => x.p)
}

const COPY_SVG = '<svg class="i-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="i-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
const LANG: Record<string, string> = { md: 'markdown', sh: 'bash', js: 'javascript', ts: 'typescript', plaintext: 'text' }

// Post-processes rendered Markdown: contact email, code-block frames (language + copy button), heading anchors.
export function enhanceHtml(html: string) {
  return html
    .replaceAll('{{CONTACT_EMAIL}}', `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`)
    .replace(/<pre class="astro-code[^"]*"[^>]*data-language="([^"]*)"[^>]*>[\s\S]*?<\/pre>/g, (pre, lang) =>
      `<div class="code"><div class="code-head"><span class="code-lang">${LANG[lang] ?? lang}</span><button type="button" class="copy-btn" aria-label="Copy code">${COPY_SVG}<span class="copy-label">Copy</span></button></div>${pre}</div>`)
    .replace(/<(h[23]) id="([^"]+)">([\s\S]*?)<\/\1>/g, (_, tag, id, inner) =>
      `<${tag} id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></${tag}>`)
}
// Trim text to at most n characters on a word boundary, for meta descriptions.
export function clip(text: string, n: number) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= n) return t
  const cut = t.slice(0, n - 1)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.\-–—]+$/, '') + '…'
}
export const absolute = (path: string) => SITE_URL + (path === '/' ? '/' : path.replace(/\/$/, ''))
export const fmtDate = (d: Date) => d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
