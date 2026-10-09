import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://laravel-vuejs.space',
  output: 'static',
  // Pages are served without a trailing slash (wrangler.jsonc: drop-trailing-slash)
  trailingSlash: 'ignore',
  build: { format: 'directory', assets: '_astro', inlineStylesheets: 'always' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: false,
    },
  },
})
