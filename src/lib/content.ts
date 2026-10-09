// Build-time data layer: turns the Markdown content collection into the same shapes the
// GraphQL API returned (posts / featuredPosts / postBySlug / postsByCategory / postsByTag),
// and prepares the per-page store state consumed by the ported Vue components.
import { getCollection } from 'astro:content'
import taxonomies from '../content/taxonomies.json'
import { setPageState, serializeState } from '../app/lib/store.js'
import { SITE_URL, CONTACT_EMAIL } from '../app/config/site.js'

export type Category = { id: string; name: string; slug: string; description?: string }
export type Tag = { id: string; name: string; slug: string }

export const categories: Category[] = taxonomies.categories
export const tags: Tag[] = taxonomies.tags
const category = (slug: string) => categories.find(c => c.slug === slug) ?? { id: slug, name: slug, slug, description: slug }
const tag = (slug: string) => tags.find(t => t.slug === slug) ?? { id: slug, name: slug, slug }

// Carbon::diffForHumans() equivalent, evaluated at build time.
export function timeAgo(date: Date, now = new Date()) {
  const s = Math.max(1, Math.round((now.getTime() - date.getTime()) / 1000))
  const units: [string, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]]
  for (const [u, n] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? 's' : ''} ago` }
  return 'just now'
}

let cache: any[] | undefined
export async function allPosts() {
  if (cache) return cache
  const entries = await getCollection('posts')
  cache = entries.map((e) => {
    // Markdown is rendered by the glob loader; the HTML goes into the v-html content block like before.
    const content = (e.rendered?.html ?? '').replaceAll('{{CONTACT_EMAIL}}', CONTACT_EMAIL)
    const d = e.data
    return {
      id: String(d.id),
      title: d.title,
      slug: e.id,
      excerpt: d.excerpt,
      content,
      image_url: d.image,
      url: `${SITE_URL}/${e.id}`,
      source: d.source ?? null,
      views: d.views,
      type: 1,
      status: 1,
      comment_status: 1,
      featured: d.featured,
      date: d.date.toISOString(),
      time_ago: timeAgo(d.date),
      user: { id: '1', name: d.author },
      media: [{ id: String(d.id), full_url: SITE_URL + d.image }],
      tags: d.tags.map(tag),
      categories: d.categories.map(category),
    }
  })
  cache.sort((a, b) => +b.id - +a.id) // latest('id')
  for (const p of cache) {
    // Post::getRelatedPostsAttribute(): other posts sharing tags/categories
    const keys = new Set([...p.tags.map((t: Tag) => 't' + t.slug), ...p.categories.map((c: Category) => 'c' + c.slug)])
    p.related_posts = cache.filter(o => o.id !== p.id)
      .map(o => ({ o, score: [...o.tags.map((t: Tag) => 't' + t.slug), ...o.categories.map((c: Category) => 'c' + c.slug)].filter(k => keys.has(k)).length }))
      .filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 10)
      .map(({ o }) => ({ id: o.id, title: o.title, slug: o.slug, image_url: o.image_url }))
  }
  return cache
}

export const listItem = (p: any) => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, image_url: p.image_url, time_ago: p.time_ago, categories: p.categories })

export function paginate(list: any[], count: number, page = 1) {
  const total = list.length, lastPage = Math.max(1, Math.ceil(total / count))
  const data = list.slice((page - 1) * count, page * count).map(listItem)
  return { data, paginatorInfo: { count: data.length, currentPage: page, firstItem: (page - 1) * count + 1, hasMorePages: page < lastPage, lastItem: (page - 1) * count + data.length, lastPage, perPage: count, total } }
}

// Mirrors the Nuxt middlewares: every page gets the shared widgets' data
// (featured posts, popular posts), page-specific data is merged on top.
export async function pageState(url: URL, route: { name: string; params?: Record<string, string> }, extra: any = {}) {
  const posts = await allPosts()
  const popular = [...posts].sort((a, b) => b.views - a.views || +b.id - +a.id)
  const state = {
    route: { name: route.name, path: url.pathname.replace(/\/$/, '') || '/', fullPath: url.pathname, params: route.params ?? {}, query: {} },
    post: {
      posts: paginate(posts, 13),            // home: LOAD_POSTS count 13, latest
      featured: paginate(posts.filter(p => p.featured), 8),
      popular: paginate(popular, 4),
    },
  }
  return deepMerge(state, extra)
}

function deepMerge(a: any, b: any) {
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object') deepMerge(a[k], v)
    else a[k] = v
  }
  return a
}

export function applyState(state: any) {
  setPageState(state)
  return serializeState()
}
