// Generated brand artwork (src/assets/art/*.webp). Astro turns each into responsive AVIF/WebP at build time.
import type { ImageMetadata } from 'astro'
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/art/*.webp', { eager: true })
const art: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace('.webp', ''), mod.default]),
)
export const getArt = (name: string): ImageMetadata | undefined => art[name]
export const postArt = (slug: string) => art[slug]
export const categoryArt = (slug: string) => art[`cat-${slug}`]
