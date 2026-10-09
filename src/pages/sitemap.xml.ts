import type { APIRoute } from 'astro'
import { allPosts, categories, tags } from '../lib/content'
import { SITE_URL } from '../app/config/site.js'

// Replaces `php artisan sitemap:generate` (posts, categories, tags) + the static pages.
const pages = ['/', '/posts', '/page/about-us', '/page/contact-us', '/page/hire-us', '/page/dmca-policy', '/page/privacy-policy',
  '/page/terms-and-conditions', '/page/newsletter', '/auth/login', '/auth/signup']

export const GET: APIRoute = async () => {
  const posts = await allPosts()
  const urls = [
    ...pages.map(p => ({ loc: SITE_URL + p })),
    ...posts.map(p => ({ loc: `${SITE_URL}/${p.slug}`, lastmod: p.date.slice(0, 10) })),
    ...categories.map(c => ({ loc: `${SITE_URL}/category/${c.slug}` })),
    ...tags.map(t => ({ loc: `${SITE_URL}/tag/${t.slug}` })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
