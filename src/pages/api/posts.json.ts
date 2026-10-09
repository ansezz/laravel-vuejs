import type { APIRoute } from 'astro'
import { allPosts } from '../../lib/content'

// Static index used in the browser for search, filters (count / sort_by / s) and "Show more"
// — replaces the GraphQL `posts`, `postsByCategory` and `postsByTag` queries.
export const GET: APIRoute = async () => {
  const posts = await allPosts()
  const index = posts.map(p => ({
    id: +p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, image_url: p.image_url, time_ago: p.time_ago,
    views: p.views, categories: p.categories, tags: p.tags,
  }))
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } })
}
