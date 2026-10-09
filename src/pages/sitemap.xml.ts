import { allPosts, categories, tags } from '../lib/content'
import { SITE_URL } from '../config/site'

const pages = ['/', '/posts', '/search', '/page/about-us', '/page/contact-us', '/page/hire-us', '/page/newsletter', '/page/faq',
  '/page/courses', '/page/products', '/page/privacy-policy', '/page/terms-and-conditions', '/page/dmca-policy',
  '/jobs/job-archive', '/jobs/create-job', '/jobs/pricing', '/jobs/companies']

export const GET = async () => {
  const posts = await allPosts()
  const urls = [
    ...pages.map(p => ({ loc: SITE_URL + p })),
    ...posts.map(p => ({ loc: SITE_URL + p.url, lastmod: (p.updated ?? p.date).toISOString().slice(0, 10) })),
    ...categories.map(c => ({ loc: `${SITE_URL}/category/${c.slug}` })),
    ...tags.filter(t => posts.some(p => p.tags.some(pt => pt.slug === t.slug))).map(t => ({ loc: `${SITE_URL}/tag/${t.slug}` })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
