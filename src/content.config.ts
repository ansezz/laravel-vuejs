import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Blog posts. In the Laravel app these lived in MySQL (posts, categories, tags, media)
// and were served through the Lighthouse GraphQL API. They are now Markdown files.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    excerpt: z.string(),
    image: z.string(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    views: z.number().default(0),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    author: z.string().default('Laravel & VueJs'),
  }),
})

export const collections = { posts }
