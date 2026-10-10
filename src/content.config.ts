import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

// Blog posts (Markdown). Higher `id` = newer; lists are sorted by id, then date.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    excerpt: z.string(),
    description: z.string().max(160).optional(), // meta description; defaults to the excerpt trimmed to ~155 chars
    seoTitle: z.string().max(60).optional(), // <title> when the headline is too long for search results
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    snippet: z.string().optional(), // one-line command shown on the generated cover
    featured: z.boolean().default(false),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Anass Ez-zouaine'),
  }),
})

export const collections = { posts }
