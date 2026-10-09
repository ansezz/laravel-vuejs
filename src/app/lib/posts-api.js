// Client-side replacement for the GraphQL list queries (posts, postsByCategory, postsByTag, search).
// Reads the static index generated at build time (/api/posts.json) and filters/sorts/paginates it
// with the same arguments the Lighthouse API accepted: count, page, sort_by, s.
let cache
async function all() {
  if (!cache) cache = fetch('/api/posts.json').then(r => r.json())
  return cache
}

export async function queryPosts({ count = 12, page = 1, sort_by = 'latest', s, category, tag } = {}) {
  count = +count || 12; page = +page || 1
  let list = (await all()).slice()
  if (category) list = list.filter(p => p.categories.some(c => c.slug === category))
  if (tag) list = list.filter(p => p.tags.some(t => t.slug === tag))
  if (s) { const q = String(s).toLowerCase(); list = list.filter(p => (p.title + ' ' + p.excerpt).toLowerCase().includes(q)) }
  if (sort_by === 'oldest') list.sort((a, b) => a.id - b.id)
  else if (sort_by === 'popular') list.sort((a, b) => b.views - a.views)
  else list.sort((a, b) => b.id - a.id)
  const total = list.length, lastPage = Math.max(1, Math.ceil(total / count))
  const data = list.slice((page - 1) * count, page * count)
  return {
    data,
    paginatorInfo: { count: data.length, currentPage: page, firstItem: (page - 1) * count + 1, hasMorePages: page < lastPage, lastItem: (page - 1) * count + data.length, lastPage, perPage: count, total },
  }
}
