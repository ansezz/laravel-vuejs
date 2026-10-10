import { sitemapUrls, urlset } from '../lib/sitemap'
export const GET = async () => urlset((await sitemapUrls()).posts)
