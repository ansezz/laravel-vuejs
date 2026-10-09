import rss from '@astrojs/rss'
import { allPosts, categories, tags } from './content'
import { SITE_URL, SITE_NAME } from '../config/site'

// /feed.xml, /feed/posts.xml, /feed/categories.xml, /feed/tags.xml
export async function postsFeed(title = SITE_NAME) {
  const posts = await allPosts()
  return rss({
    title, description: 'Guides, tutorials and community news for Laravel and Vue developers.', site: SITE_URL,
    items: posts.map(p => ({ title: p.title, link: p.url, description: p.excerpt, pubDate: p.date, categories: p.tags.map(t => t.name) })),
    customData: '<language>en</language>',
  })
}
export const categoriesFeed = () => rss({ title: `${SITE_NAME}: categories`, description: 'Topics on ' + SITE_NAME, site: SITE_URL,
  items: categories.map(c => ({ title: c.name, link: `/category/${c.slug}`, description: c.description })) })
export const tagsFeed = () => rss({ title: `${SITE_NAME}: tags`, description: 'Tags on ' + SITE_NAME, site: SITE_URL,
  items: tags.map(t => ({ title: t.name, link: `/tag/${t.slug}` })) })
