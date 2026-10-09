import { allPosts } from '../../lib/content'
// Search index used by /search (title, excerpt, taxonomy, headings).
export const GET = async () => new Response(JSON.stringify((await allPosts()).map(p => ({
  slug: p.slug, url: p.url, title: p.title, excerpt: p.excerpt, date: p.date.toISOString(), minutes: p.readingMinutes,
  categories: p.categories.map(c => ({ slug: c.slug, name: c.name })), tags: p.tags.map(t => t.name),
  text: (p.entry.body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`>|\[\]()-]+/g, ' ').replace(/\s+/g, ' ').slice(0, 8000),
  headings: (p.entry.rendered?.metadata?.headings as { text: string }[] | undefined ?? []).map(h => h.text),
}))), { headers: { 'Content-Type': 'application/json' } })
