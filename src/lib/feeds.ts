import rss from '@astrojs/rss'
import { allPosts, categories, tags } from './content'
import { SITE_URL } from '../app/config/site.js'

// Replaces spatie/laravel-feed (config/feed.php): /feed.xml, /feed/posts.xml, /feed/categories.xml, /feed/tags.xml
export async function postsFeed(title: string) {
  const posts = (await allPosts()).slice(0, 200)
  return rss({
    title, description: 'Laravel & VueJs articles, tutorials, packages and jobs', site: SITE_URL,
    items: posts.map(p => ({ title: p.title, link: `/${p.slug}`, description: p.excerpt, pubDate: new Date(p.date), categories: p.tags.map((t: any) => t.name) })),
  })
}
export function categoriesFeed() {
  return rss({ title: 'Laravel VueJs categories feed', description: 'Categories', site: SITE_URL,
    items: categories.map(c => ({ title: c.name, link: `/category/${c.slug}`, description: c.description })) })
}
export function tagsFeed() {
  return rss({ title: 'Laravel VueJs tags feed', description: 'Tags', site: SITE_URL,
    items: tags.map(t => ({ title: t.name, link: `/tag/${t.slug}` })) })
}
