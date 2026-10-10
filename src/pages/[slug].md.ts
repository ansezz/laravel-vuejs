import type { APIRoute, GetStaticPaths } from 'astro'
import { allPosts, type Post } from '../lib/content'
import { postMarkdown, markdownResponse } from '../lib/markdown'
// /<slug>.md: the article as clean Markdown (for readers, AI assistants and answer engines).
export const getStaticPaths: GetStaticPaths = async () => (await allPosts()).map(post => ({ params: { slug: post.slug }, props: { post } }))
export const GET: APIRoute = ({ props }) => markdownResponse(postMarkdown((props as { post: Post }).post))
