import { SITE_URL } from '../config/site'
export const GET = () => new Response(`User-agent: *\nAllow: /\nDisallow: /auth/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } })
