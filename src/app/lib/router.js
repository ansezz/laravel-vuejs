// Tiny stand-in for vue-router / nuxt-link: resolves Nuxt route objects to static URLs.
import { store } from './store.js'

const routes = {
  index: () => '/',
  slug: (p) => `/${p.slug}`,
  posts: () => '/posts',
  'category-slug': (p) => `/category/${p.slug}`,
  'tag-slug': (p) => `/tag/${p.slug}`,
  search: () => '/search',
}

export function resolve(to) {
  if (!to) return '/'
  if (typeof to === 'string') return to
  let path = to.path || (routes[to.name] ? routes[to.name](to.params || {}) : '/' + String(to.name || '').replace(/-/g, '/'))
  const q = Object.entries(to.query || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (q.length) path += '?' + new URLSearchParams(q).toString()
  return path
}

export const router = {
  push(to) { if (typeof window !== 'undefined') window.location.href = resolve(to) },
  replace(to) { if (typeof window !== 'undefined') window.location.replace(resolve(to)) },
  resolve,
}

export const route = () => store.state.route
