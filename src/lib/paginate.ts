import type { Post } from './content'
// /posts lists PAGE_SIZE articles; later pages live at /posts/page/2, /posts/page/3, ...
export const PAGE_SIZE = 12
export const pageUrl = (n: number) => (n <= 1 ? '/posts' : `/posts/page/${n}`)
export function pageOf(posts: Post[], n: number) {
  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  return { items: posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE), current: n, pages,
    prev: n > 1 ? pageUrl(n - 1) : undefined, next: n < pages ? pageUrl(n + 1) : undefined }
}
