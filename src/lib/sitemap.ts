import { allPosts, categories, tags, type Post } from './content'
import { SITE_URL, AUTHOR } from '../config/site'

// Sitemap index (/sitemap.xml) with three child sitemaps. lastmod is only set where we know it:
// a post's updated/published date, the newest post in a listing, or the "last updated" date of a static page.
type Url = { loc: string; lastmod?: Date }
export const LEGAL_UPDATED = new Date('2026-10-10T00:00:00Z')
const PAGES: [string, Date?][] = [
  ['/page/about-us'], ['/page/contact-us'], ['/page/hire-us'], ['/page/newsletter'], ['/page/faq'], ['/page/courses'], ['/page/products'],
  ['/page/privacy-policy', LEGAL_UPDATED], ['/page/terms-and-conditions', LEGAL_UPDATED], ['/page/dmca-policy', LEGAL_UPDATED], ['/page/accessibility', LEGAL_UPDATED],
  ['/jobs/job-archive'], ['/jobs/create-job'], ['/jobs/pricing'], ['/jobs/companies'], ['/search'],
]
const newest = (posts: Post[]) => posts.reduce<Date | undefined>((m, p) => { const d = p.updated ?? p.date; return !m || d > m ? d : m }, undefined)
const day = (d?: Date) => d?.toISOString().slice(0, 10)

export async function sitemapUrls(): Promise<Record<'pages' | 'posts' | 'taxonomies', Url[]>> {
  const posts = await allPosts()
  const latest = newest(posts)
  return {
    pages: [{ loc: '/', lastmod: latest }, { loc: '/posts', lastmod: latest }, { loc: AUTHOR.url, lastmod: latest }, ...PAGES.map(([loc, lastmod]) => ({ loc, lastmod }))],
    posts: posts.map(p => ({ loc: p.url, lastmod: p.updated ?? p.date })),
    taxonomies: [
      ...categories.map(c => ({ loc: `/category/${c.slug}`, lastmod: newest(posts.filter(p => p.categories.some(x => x.slug === c.slug))) })),
      ...tags.map(t => ({ t, ps: posts.filter(p => p.tags.some(x => x.slug === t.slug)) })).filter(x => x.ps.length).map(({ t, ps }) => ({ loc: `/tag/${t.slug}`, lastmod: newest(ps) })),
    ],
  }
}
export const urlset = (urls: Url[]) => xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(u => `  <url><loc>${SITE_URL}${u.loc === '/' ? '/' : u.loc}</loc>${u.lastmod ? `<lastmod>${day(u.lastmod)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`)
export async function sitemapIndex() {
  const groups = await sitemapUrls()
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.entries(groups).map(([name, urls]) => {
    const last = urls.reduce<Date | undefined>((m, u) => !u.lastmod ? m : !m || u.lastmod > m ? u.lastmod : m, undefined)
    return `  <sitemap><loc>${SITE_URL}/sitemap-${name}.xml</loc>${last ? `<lastmod>${day(last)}</lastmod>` : ''}</sitemap>`
  }).join('\n')}\n</sitemapindex>`)
}
const xml = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
