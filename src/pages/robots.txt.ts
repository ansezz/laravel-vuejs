import { SITE_URL } from '../app/config/site.js'
export const GET = () => new Response(`User-agent: *\nDisallow:\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } })
