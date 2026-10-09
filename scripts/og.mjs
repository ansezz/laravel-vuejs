// Usage: npm run build && npx astro preview --port 4400 & then: npx -p playwright-core node scripts/og.mjs http://localhost:4400 public/og
// (needs a Chromium install: npx playwright-core install chromium). Re-run after adding or renaming a post.
// Renders 1200x630 Open Graph cards (default + one per post) into public/og/.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [base, outDir] = process.argv.slice(2)
const posts = await (await fetch(base + '/api/posts.json')).json()
const fonts = fs.readdirSync(new URL('../dist/_astro', import.meta.url))
const sans = fonts.find(f => /^geist-latin-wght/.test(f)), mono = fonts.find(f => /^geist-mono-latin-wght/.test(f))
const logo = fs.readFileSync(new URL('../src/components/Logo.astro', import.meta.url), 'utf8').match(/<svg[\s\S]*<\/svg>/)[0]
  .replace(/class=\{[^}]*\}/, 'class="logo"').replace(/aria-label=\{title\}/, '').replace(/<title>\{title\}<\/title>/, '')
const html = (title, kicker, sub) => `<!doctype html><html><head><style>
@font-face{font-family:G;src:url(${base}/_astro/${sans}) format('woff2');font-weight:100 900}
@font-face{font-family:M;src:url(${base}/_astro/${mono}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;font-family:G;color:#fff;overflow:hidden;
background:radial-gradient(70% 90% at 0% 0%,rgb(105 54 211/.85),transparent 60%),radial-gradient(60% 80% at 100% 100%,rgb(99 249 230/.5),transparent 60%),#0B0A18;position:relative}
body:before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgb(255 255 255/.06) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.06) 1px,transparent 1px);background-size:48px 48px}
.w{position:absolute;inset:64px 72px;display:flex;flex-direction:column}
.logo{height:56px;width:auto;align-self:flex-start}.logo-shape{fill:#63F9E6}.logo-text{fill:#C4B0FF}
.k{margin-top:auto;font:600 22px M;letter-spacing:.14em;text-transform:uppercase;color:#63F9E6}
h1{margin-top:18px;font-size:${title.length > 60 ? 58 : 68}px;line-height:1.05;letter-spacing:-.035em;font-weight:700;max-width:1000px}
p{margin-top:26px;font:500 24px M;color:rgb(255 255 255/.7)}</style></head><body><div class="w">${logo}<div class="k">${kicker}</div><h1>${title}</h1><p>${sub}</p></div></body></html>`
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const jobs = [['default', 'Laravel &amp; Vue', 'Build modern apps with Laravel &amp; Vue.', 'laravel-vuejs.space'],
  ...posts.map(p => [p.slug, esc(p.categories.map(c => c.name).join(' · ')), esc(p.title), `laravel-vuejs.space/${p.slug} · ${p.minutes} min read`])]
for (const [name, k, t, s] of jobs) {
  await page.goto(base + '/robots.txt'); await page.setContent(html(t, k, s), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${outDir}/${name}.png` }); console.log('og', name)
}
await browser.close()
