// SEO checks on the built site (dist/): run after `npm run build`. Fails (exit 1) on errors, prints warnings.
// Errors (every indexable page): one <title> of at most 60 characters; one meta description of 50 to 160 characters,
// unique across the site; one absolute canonical that is the page's own URL; one <h1>; an og:image that exists;
// JSON-LD that parses, with headline, image and datePublished on articles. The sitemap lists exactly the indexable pages
// (paginated /posts/page/N excepted) and never a noindex page; robots.txt points at it.
// Warnings: a skipped heading level (h2 -> h4), an <img> without width and height.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const SITE = 'https://laravel-vuejs.space'
const errors = []
const warnings = []
const err = (page, msg) => errors.push(`${page}  ${msg}`)
const warn = (page, msg) => warnings.push(`${page}  ${msg}`)

// A start tag, with quoted attribute values that may contain ">" ("$comment->post", "<head> manager").
const TAG = (name) => new RegExp(`<${name}\\s(?:"[^"]*"|'[^']*'|[^'">])*>`, 'g')
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? '')
const metas = (html, key, by = 'name') => [...html.matchAll(TAG('meta'))].map((m) => m[0]).filter((t) => attr(t, by) === key).map((t) => attr(t, 'content'))
const fileFor = (path) => [path, `${path}/index.html`, `${path}.html`].map((p) => join(DIST, p.replace(/^\//, ''))).find((p) => existsSync(p) && statSync(p).isFile())

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : d.name.endsWith('.html') ? [join(dir, d.name)] : []))
}
const urlOf = (file) => {
  const p = '/' + relative(DIST, file).split(sep).join('/')
  const path = p.replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/'
  return SITE + (path === '/' ? '/' : path)
}

const indexable = new Set()
const noindexed = new Set()
const titles = new Map()
const descriptions = new Map()

for (const file of walk(DIST)) {
  const url = urlOf(file)
  if (url === `${SITE}/404`) continue
  const html = readFileSync(file, 'utf8')
  const body = html.replace(/<template[\s\S]*?<\/template>/g, '')
  const noindex = metas(html, 'robots').some((c) => c.includes('noindex'))
  ;(noindex ? noindexed : indexable).add(url)
  if (noindex) continue

  // Only the document title in <head>: inline SVG icons carry their own <title> elements.
  const head = html.slice(0, html.indexOf('</head>'))
  const t = [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]).trim())
  if (t.length !== 1) err(url, `${t.length} <title> elements`)
  else if (t[0].length > 60) err(url, `title is ${t[0].length} characters (max 60): ${t[0]}`)
  else titles.set(t[0], [...(titles.get(t[0]) ?? []), url])

  const d = metas(html, 'description')
  if (d.length !== 1) err(url, `${d.length} meta descriptions`)
  else if (d[0].length > 160 || d[0].length < 50) err(url, `meta description is ${d[0].length} characters (50 to 160)`)
  else descriptions.set(d[0], [...(descriptions.get(d[0]) ?? []), url])

  const canon = [...html.matchAll(TAG('link'))].map((m) => m[0]).filter((t) => attr(t, 'rel') === 'canonical').map((t) => attr(t, 'href'))
  if (canon.length !== 1) err(url, `${canon.length} canonical links`)
  else if (canon[0] !== url) err(url, `canonical is ${canon[0]}, not the page's own URL`)

  const h1 = (body.match(/<h1[\s>]/g) ?? []).length
  if (h1 !== 1) err(url, `${h1} <h1> elements`)

  const og = metas(html, 'og:image', 'property')
  if (og.length !== 1) err(url, `${og.length} og:image tags`)
  else if (og[0].startsWith(SITE) && !fileFor(new URL(og[0]).pathname)) err(url, `og:image file is missing: ${og[0]}`)

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data
    try { data = JSON.parse(m[1]) } catch (e) { err(url, `JSON-LD does not parse: ${e.message}`); continue }
    for (const node of data['@graph'] ?? [data]) {
      const types = [].concat(node['@type'])
      if (types.some((x) => ['Article', 'BlogPosting', 'TechArticle'].includes(x))) {
        for (const k of ['headline', 'image', 'datePublished']) if (!node[k]) err(url, `${types.join('/')} JSON-LD has no ${k}`)
        if ((node.headline ?? '').length > 110) err(url, `JSON-LD headline is ${node.headline.length} characters (max 110)`)
      }
    }
  }

  let prev = 0
  for (const m of body.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1])
    if (prev && level > prev + 1) { warn(url, `heading level skipped: h${prev} -> h${level}`); break }
    prev = level
  }
  for (const m of body.matchAll(TAG('img'))) {
    if (!/\swidth="/.test(m[0]) || !/\sheight="/.test(m[0])) warn(url, `<img> without width/height: ${attr(m[0], 'src').slice(0, 80)}`)
  }
}

for (const [t, urls] of titles) if (urls.length > 1) err(urls.join(' | '), `share the title "${t}"`)
for (const [d, urls] of descriptions) if (urls.length > 1) err(urls.join(' | '), `share the meta description "${d.slice(0, 60)}…"`)

// Sitemap index -> child sitemaps -> URLs.
const sitemapUrls = new Set()
const index = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
for (const [, loc] of index.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)) {
  const child = fileFor(new URL(loc).pathname)
  if (!child) { err(loc, 'sitemap index points at a missing file'); continue }
  for (const [, u] of readFileSync(child, 'utf8').matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(decode(u))
}
for (const u of sitemapUrls) {
  if (noindexed.has(u)) err(u, 'is in the sitemap but noindex')
  else if (!indexable.has(u)) err(u, 'is in the sitemap but has no page')
}
for (const u of indexable) if (!sitemapUrls.has(u) && !/\/posts\/page\/\d+$/.test(u)) err(u, 'is indexable but missing from the sitemap')
if (!readFileSync(join(DIST, 'robots.txt'), 'utf8').includes(`Sitemap: ${SITE}/sitemap.xml`)) err('robots.txt', 'has no Sitemap line')

for (const w of warnings) console.log(`warn  ${w}`)
for (const e of errors) console.error(`FAIL  ${e}`)
console.log(`\n${indexable.size} indexable pages, ${noindexed.size} noindex, ${sitemapUrls.size} sitemap URLs: ${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
