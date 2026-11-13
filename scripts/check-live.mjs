// Post-deploy check: verifies the live site after Cloudflare deploys master (used by .github/workflows/post-deploy.yml,
// runnable locally: `npm run check:live`, or `SITE_URL=http://localhost:8787 npm run check:live` against `wrangler dev`).
//   SITE_URL=https://...   site to check (default: the production domain)
//   EXPECT_SHA=<commit>    first wait (up to WAIT_MINUTES, default 15) until /version.json reports this commit
// Every check prints ok/FAIL; the script exits 1 if any check failed. It never writes anything (the forms check sends a
// cross-site POST that the Worker rejects before touching the database).
import fs from 'node:fs'

const site = (process.env.SITE_URL || 'https://laravel-vuejs.space').replace(/\/$/, '')
const expectSha = process.env.EXPECT_SHA || ''
const waitMinutes = Number(process.env.WAIT_MINUTES || 15)
const isLocal = /localhost|127\.0\.0\.1/.test(site)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let failures = 0
const report = (ok, label, detail = '') => {
  console.log(`${ok ? '  ok ' : 'FAIL '} ${label}${detail ? `  (${detail})` : ''}`)
  if (!ok) failures++
}
const get = (path, init = {}) =>
  fetch(path.startsWith('http') ? path : site + path, { redirect: 'manual', headers: { 'cache-control': 'no-cache', 'user-agent': 'laravel-vuejs check-live' }, ...init })

// 1. Wait for the deploy that carries EXPECT_SHA (Workers Builds takes a few minutes after the push).
if (expectSha) {
  const deadline = Date.now() + waitMinutes * 60_000
  let seen = ''
  while (Date.now() < deadline) {
    try {
      const v = await (await get('/version.json')).json()
      seen = v.sha
      if (v.sha === expectSha) break
      if (v.sha === 'unknown') { console.log('version.json has no commit sha; waiting 4 minutes for the deploy instead'); await sleep(240_000); break }
    } catch { /* not deployed yet, or the old build has no version.json */ }
    await sleep(20_000)
  }
  report(seen === expectSha || seen === 'unknown', `deploy of ${expectSha.slice(0, 7)} is live`, `version.json says ${seen || 'nothing'}`)
}

// 2. Key pages and their content types.
const pages = [
  ['/', 'text/html', '<title>'],
  ['/posts', 'text/html', '<title>'],
  ['/search', 'text/html', '<title>'],
  ['/robots.txt', 'text/plain', 'Content-Signal: search=yes, ai-input=yes, ai-train=no'],
  ['/index.md', 'markdown', '# '],
  ['/.well-known/api-catalog', 'application/linkset+json', '"linkset"'],
  ['/sitemap.xml', 'xml', '<sitemapindex'],
  ['/sitemap-posts.xml', 'xml', '<urlset'],
  ['/feed.xml', 'xml', '<rss'],
  ['/llms.txt', 'text/plain', '# '],
  ['/llms-full.txt', 'text/plain', '# '],
  ['/manifest.webmanifest', 'manifest', '"name"'],
  ['/api/posts.json', 'json', '"slug"'],
  ['/tools/compatibility.md', 'markdown', '# '],
]
for (const [path, type, needle] of pages) {
  try {
    const res = await get(path)
    const body = await res.text()
    report(res.status === 200 && (res.headers.get('content-type') ?? '').includes(type) && body.includes(needle), `GET ${path}`, `${res.status} ${res.headers.get('content-type')} ${body.length}B`)
  } catch (e) { report(false, `GET ${path}`, e.message) }
}

// 3. Posts: every post whose date has passed is live; the newest one renders, has its Markdown twin and its OG image.
try {
  const live = await (await get('/api/posts.json')).json()
  const slugs = new Set(live.map((p) => p.slug))
  report(live.length >= 100, 'search index has the posts', `${live.length} posts`)
  const dir = new URL('../src/content/posts/', import.meta.url)
  const due = fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).flatMap((f) => {
    const fm = fs.readFileSync(new URL(f, dir), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
    const date = Date.parse(fm.match(/^date:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1] ?? '')
    return !Number.isNaN(date) && date <= Date.now() ? [f.replace(/\.mdx?$/, '')] : []
  })
  const missing = due.filter((s) => !slugs.has(s))
  report(missing.length === 0, 'every due post is live', missing.length ? `missing: ${missing.join(' ')}` : `${due.length} due`)
  const newest = live[0]?.slug
  if (newest) {
    const html = await get(`/${newest}`)
    const text = await html.text()
    report(html.status === 200 && text.includes(`/og/${newest}.jpg`) && text.includes('"@type":"BreadcrumbList"'), `newest post /${newest}`, `${html.status}`)
    const md = await get(`/${newest}.md`)
    report(md.status === 200 && (md.headers.get('content-type') ?? '').includes('markdown') && (md.headers.get('link') ?? '').includes('rel="canonical"'), `Markdown twin /${newest}.md with canonical Link`, `${md.status} ${md.headers.get('content-type')} link=${md.headers.get('link') ?? 'none'}`)
    const og = await get(`/og/${newest}.jpg`, { method: 'HEAD' })
    report(og.status === 200, `OG image /og/${newest}.jpg`, `${og.status}`)
  }
} catch (e) { report(false, 'posts', e.message) }

// 4. Headers set by the Worker on HTML.
try {
  const res = await get('/')
  const h = (n) => res.headers.get(n) ?? ''
  report(h('content-security-policy').includes("script-src 'self'"), 'Content-Security-Policy on HTML', h('content-security-policy').slice(0, 60))
  report(h('strict-transport-security').includes('max-age='), 'Strict-Transport-Security')
  report(h('x-content-type-options') === 'nosniff', 'X-Content-Type-Options nosniff')
  report(h('x-frame-options') === 'DENY', 'X-Frame-Options DENY')
  report(!h('x-robots-tag'), 'no X-Robots-Tag on the canonical host', h('x-robots-tag'))
  const asset = await get('/robots.txt')
  report(asset.status === 200, 'robots.txt served')
  report(h('link').includes('rel="canonical"') && h('link').includes('type="text/markdown"'), 'Link header (canonical, Markdown twin) on HTML', h('link').slice(0, 80))
  report(h('vary').toLowerCase().includes('accept') && h('access-control-allow-origin') === '*', 'Vary: Accept and CORS on HTML', `vary=${h('vary')} acao=${h('access-control-allow-origin')}`)
  const md = await get('/', { headers: { 'cache-control': 'no-cache', 'user-agent': 'laravel-vuejs check-live', accept: 'text/markdown' } })
  report(md.status === 200 && (md.headers.get('content-type') ?? '').includes('text/markdown') && (await md.text()).startsWith('# '), 'Accept: text/markdown on / returns Markdown', `${md.status} ${md.headers.get('content-type')}`)
} catch (e) { report(false, 'headers', e.message) }

// 5. Routing: 404 page, trailing slash redirect, www redirect.
try {
  const nf = await get('/this-page-does-not-exist-' + Date.now())
  report(nf.status === 404 && (await nf.text()).includes('<title>'), '404 page returns 404 with the custom page', `${nf.status}`)
  const slash = await get('/posts/')
  report([301, 302, 307, 308].includes(slash.status) && /\/posts$/.test(slash.headers.get('location') ?? ''), '/posts/ redirects to /posts', `${slash.status} -> ${slash.headers.get('location')}`)
  if (!isLocal) {
    const www = await get(site.replace('://', '://www.') + '/posts')
    report(www.status === 301 && www.headers.get('location') === `${site}/posts`, 'www redirects to the apex', `${www.status} -> ${www.headers.get('location')}`)
  }
} catch (e) { report(false, 'routing', e.message) }

// 6. Forms API is up and refuses cross-site posts (nothing is stored).
try {
  const opt = await get('/api/forms/contact', { method: 'OPTIONS' })
  report(opt.status === 204, 'OPTIONS /api/forms/contact', `${opt.status}`)
  const cross = await get('/api/forms/contact', { method: 'POST', headers: { origin: 'https://evil.example', accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body: 'name=x&email=x%40example.com&message=hello' })
  report(cross.status === 403, 'cross-site POST to the forms API is refused', `${cross.status}`)
  const unknown = await get('/api/forms/nope', { method: 'POST', headers: { accept: 'application/json' } })
  report(unknown.status === 404, 'unknown form is a 404', `${unknown.status}`)
} catch (e) { report(false, 'forms API', e.message) }

console.log(failures ? `\n${failures} check(s) failed on ${site}` : `\nAll checks passed on ${site}`)
process.exit(failures ? 1 : 0)
