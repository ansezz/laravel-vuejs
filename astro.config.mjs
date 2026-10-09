// @ts-check
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import { fileURLToPath } from 'node:url'

const app = fileURLToPath(new URL('./src/app', import.meta.url))

// Static output: every page is pre-rendered at build time and served from
// Cloudflare Workers static assets (see wrangler.jsonc). No SSR adapter is needed.
export default defineConfig({
  site: 'https://laravel-vuejs.space',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', assets: '_astro' },
  // Code blocks stay as <pre><code class="language-x"> so the site's Prism setup styles them, as before.
  markdown: { syntaxHighlight: false },
  integrations: [
    vue({ appEntrypoint: '/src/app/lib/entry.js' }),
  ],
  vite: {
    ssr: { noExternal: ['@vojtechlanka/vue-tags-input', 'swiper', 'dom7', 'ssr-window'] },
    resolve: {
      alias: [
        { find: /^@\//, replacement: app + '/' },
        { find: /^~\//, replacement: app + '/' },
        { find: /^vuex$/, replacement: app + '/lib/store.js' },
      ],
      noExternal: ['@vojtechlanka/vue-tags-input'],
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    css: {
      preprocessorOptions: {
        // Same as the Nuxt build: every stylus block gets the design tokens + rupture.
        stylus: {
          imports: [app + '/assets/stylus/variables.styl', fileURLToPath(new URL('./node_modules/rupture/rupture/index.styl', import.meta.url))],
        },
      },
    },
    plugins: [
      {
        // Vue 2 applied a component's scoped styles to the content passed into its <slot>.
        // Vue 3 only does that (via data-v-xxx-s attributes) when the SFC uses :slotted(), so
        // flag components that render a <slot>; postcss.config.cjs adds the :slotted() twins.
        name: 'vue2-slotted-scope',
        enforce: 'pre',
        transform(code, id) {
          if (!id.endsWith('.vue') || !id.includes('/src/app/')) return
          const tpl = (code.match(/<template[^>]*>([\s\S]*)<\/template>/) || [])[1] || ''
          if (!/<slot[\s/>]/.test(tpl) || !/<style[^>]*\bscoped\b/.test(code)) return
          return { code: code.replace(/(<style[^>]*\bscoped\b[^>]*>)/, '$1\n/* :slotted( */\n'), map: null }
        },
      },
      {
        // Astro turns server-side image imports into ImageMetadata objects; the Vue templates
        // (`<img src="@/assets/images/...">`) need plain URLs on the server and in the browser.
        name: 'vue-asset-urls',
        enforce: 'post',
        transform(code, id) {
          if (!/\.vue($|\?)/.test(id) || id.includes('type=style')) return
          const out = code.replace(/(from\s*["'])([^"'?]+\.(?:png|jpe?g|gif|svg|webp))(["'])/g, '$1$2?url$3')
          if (out !== code) return { code: out, map: null }
        },
      },
      {
        name: 'graphql-raw',
        transform(code, id) {
          if (id.endsWith('.graphql')) return { code: `export default ${JSON.stringify(code)};`, map: null }
        },
      },
    ],
  },
})
