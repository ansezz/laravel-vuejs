// Runs after `astro build`: turns each built post page into clean Markdown at dist/<slug>.md and concatenates them into
// dist/llms-full.txt. Every other indexable page (home, archives, categories, tools, about...) gets a Markdown twin too,
// at the URL its <link rel="alternate" type="text/markdown"> names (/index.md for the home page, /<path>.md otherwise),
// and dist/_links.json maps each page to its canonical URL and Markdown twin for the Worker (Link header, Accept: text/markdown). Working from the rendered HTML means MDX components (TL;DR, callouts, code compare, FAQ, steps,
// diagrams) come out as portable Markdown, and scheduled posts that are not in the build are never exported.
import fs from 'node:fs'
import path from 'node:path'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const SITE = 'https://laravel-vuejs.space'
const AUTHOR = { name: 'Anass Ez-zouaine', url: '/author/anass-ez-zouaine' }
const dist = new URL('../dist/', import.meta.url)
const posts = JSON.parse(fs.readFileSync(new URL('api/posts.json', dist), 'utf8'))
const day = s => s.slice(0, 10)

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '_' })
td.use(gfm)
td.remove(['script', 'style', 'button', 'svg'])
td.addRule('anchors', { filter: n => n.nodeName === 'A' && n.classList?.contains('anchor'), replacement: () => '' })
td.addRule('darkDiagram', { filter: n => n.nodeName === 'IMG' && n.classList?.contains('only-dark'), replacement: () => '' })
td.addRule('srOnly', { filter: n => n.classList?.contains('sr-only'), replacement: () => '' })
td.addRule('picture', { filter: 'picture', replacement: (_, n) => { const img = n.querySelector('img'); return img?.getAttribute('alt') ? `![${img.getAttribute('alt')}](${SITE}${img.getAttribute('src')})` : '' } })
td.addRule('diagram', { filter: n => n.nodeName === 'FIGURE' && n.classList?.contains('diagram'), replacement: (_, n) => {
  const img = n.querySelector('img.only-light'); const cap = n.querySelector('figcaption')?.textContent?.trim()
  return `\n\n![${img?.getAttribute('alt') ?? 'Diagram'}](${SITE}${img?.getAttribute('src')})${cap ? `\n_${cap}_` : ''}\n\n`
} })
td.addRule('codeFrame', { filter: n => n.nodeName === 'DIV' && n.classList?.contains('code'), replacement: (_, n) => {
  const pre = n.querySelector('pre'); const lang = pre?.getAttribute('data-language') ?? ''
  const file = n.querySelector('.code-file')?.textContent?.trim()
  const lines = pre ? Array.from(pre.querySelectorAll('.line')) : []
  const hasDiff = lines.some(l => l.classList.contains('diff'))
  const body = lines.length ? lines.map(l => (hasDiff ? (l.classList.contains('add') ? '+ ' : l.classList.contains('remove') ? '- ' : '  ') : '') + l.textContent).join('\n') : pre?.textContent ?? ''
  return `\n\n${file ? `\`${file}\`\n` : ''}\`\`\`${hasDiff ? 'diff' : lang === 'plaintext' ? '' : lang}\n${body.replace(/\n+$/, '')}\n\`\`\`\n\n`
} })
td.addRule('codeCompare', { filter: n => n.nodeName === 'DIV' && n.classList?.contains('code-compare'), replacement: (content, n) => {
  const [a, b] = (n.getAttribute('style') ?? '').match(/'[^']*'/g) ?? ["'Before'", "'After'"]
  const parts = content.split(/(?=\n\n(?:`[^`\n]+`\n)?```)/).filter(s => s.trim())
  return parts.length === 2 ? `\n\n**${a.slice(1, -1)}:**${parts[0]}\n\n**${b.slice(1, -1)}:**${parts[1]}\n\n` : content
} })
const quote = s => s.trim().split('\n').map(l => `> ${l}`.trimEnd()).join('\n')
td.addRule('callout', { filter: n => (n.nodeName === 'ASIDE' || n.nodeName === 'DIV') && n.classList?.contains('callout'), replacement: content => `\n\n${quote(content)}\n\n` })
td.addRule('tldr', { filter: n => n.nodeName === 'SECTION' && (n.classList?.contains('tldr') || n.classList?.contains('try-it')), replacement: content => `\n\n${quote(content)}\n\n` })
td.addRule('faq', { filter: 'details', replacement: (_, n) => `\n\n**Q: ${n.querySelector('summary')?.textContent?.trim()}**\n\n${td.turndown(n.querySelector('.answer')?.innerHTML ?? '')}\n\n` })
td.addRule('absLinks', { filter: n => n.nodeName === 'A' && n.getAttribute('href')?.startsWith('/'), replacement: (c, n) => `[${c}](${SITE}${n.getAttribute('href')})` })

const docs = []
for (const p of posts) {
  const html = fs.readFileSync(new URL(`${p.slug}/index.html`, dist), 'utf8')
  const start = html.indexOf('<div class="prose post-body"')
  const end = html.indexOf('<section class="community-cta"', start)
  if (start < 0 || end < 0) throw new Error(`[markdown] could not find the article body in ${p.slug}`)
  // Tidy turndown output outside code fences: "## 1\\. Title" -> "## 1. Title", "-   item" -> "- item".
  const body = td.turndown(html.slice(start, end)).replace(/\n{3,}/g, '\n\n').split(/(^```[\s\S]*?^```$)/m)
    .map((part, i) => i % 2 ? part : part.replace(/^(#+ \d+)\\\./gm, '$1.').replace(/^(\s*)(-|\d+\.) {2,3}/gm, '$1$2 ')).join('').trim()
  const meta = [`URL: ${SITE}${p.url}`, `Author: ${p.author}${p.author === AUTHOR.name ? ` (${SITE}${AUTHOR.url})` : ''}`, `Published: ${day(p.date)}`,
    ...(p.updated ? [`Updated: ${day(p.updated)}`] : []), `Topics: ${[...new Set([...p.categories.map(c => c.name), ...p.tags])].join(', ')}`]
  const md = `# ${p.title}\n\n> ${p.excerpt}\n\n${meta.map(m => `- ${m}`).join('\n')}\n\n${body}\n`
  fs.writeFileSync(new URL(`${p.slug}.md`, dist), md)
  docs.push(md)
}
fs.writeFileSync(new URL('llms-full.txt', dist), `# Laravel & VueJs: full text of every article\n\n> Tutorials, guides and a friendly community for developers building with Laravel and Vue. Source: ${SITE}. Generated ${new Date().toISOString().slice(0, 10)}.\n\n${docs.join('\n\n---\n\n')}`)
console.log(`[markdown] wrote ${docs.length} Markdown post(s) and llms-full.txt`)

// Markdown twins for the other pages: the <main> content, with cards turned into link lists and the interactive bits
// (forms, buttons, sponsor slots, decorative covers) dropped, plus the key site links at the end.
const page = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '_' })
page.use(gfm)
page.remove(['script', 'style', 'button', 'svg', 'form', 'noscript', 'template', 'dialog', 'input', 'select', 'textarea', 'label'])
const has = (n, c) => n.classList?.contains(c)
// Turndown tries the most recently added rule first, so the general rules come first and the most specific last.
page.addRule('crumbs', { filter: n => n.nodeName === 'NAV' && /breadcrumb/i.test(n.getAttribute('aria-label') ?? ''), replacement: () => '' })
const abs = href => href?.startsWith('/') ? SITE + href : href
const text = n => (n?.textContent ?? '').replace(/\s+/g, ' ').trim()
page.addRule('absLinks', { filter: n => n.nodeName === 'A' && n.getAttribute('href')?.startsWith('/'), replacement: (c, n) => c.trim() ? `[${c.trim()}](${SITE}${n.getAttribute('href')})` : '' })
page.addRule('blockLink', { filter: n => n.nodeName === 'A' && n.querySelector?.('h2, h3, h4, p, div'), replacement: (_, n) => {
  const h = n.querySelector('h2, h3, h4'); const label = text(h) || text(n)
  return label ? `\n- [${label}](${abs(n.getAttribute('href'))})\n` : ''
} })
// A post card is one link wrapping the cover, title and excerpt: list it as "- [Title](url): excerpt".
page.addRule('card', { filter: n => n.nodeName === 'A' && n.querySelector?.('h2, h3, h4') && n.querySelector('p'), replacement: (_, n) =>
  `\n- [${text(n.querySelector('h2, h3, h4'))}](${abs(n.getAttribute('href'))}): ${text(n.querySelector('p'))}\n` })
page.addRule('hidden', { filter: n => n.getAttribute?.('aria-hidden') === 'true' || n.hasAttribute?.('hidden') || has(n, 'sr-only') || has(n, 'partner') || has(n, 'cover') || n.nodeName === 'PICTURE' || n.nodeName === 'IMG', replacement: () => '' })
const KEY_LINKS = [['Home', '/'], ['All articles', '/posts'], ['Developer tools', '/tools'], ['Cheat sheets', '/cheatsheets'], ['About', '/page/about-us'],
  ['Articles for language models (llms.txt)', '/llms.txt'], ['RSS feed', '/feed.xml'], ['Sitemap', '/sitemap.xml']]
const attr = (html, re) => html.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
const tidy = md => md.replace(/\n{3,}/g, '\n\n').split(/(^```[\s\S]*?^```$)/m)
  .map((part, i) => i % 2 ? part : part.replace(/^(#+ \d+)\\\./gm, '$1.').replace(/^(\s*)(-|\d+\.) {2,3}/gm, '$1$2 ').replace(/^- (.*)\n\n(?=- )/gm, '- $1\n')).join('').trim()

const root = dist.pathname
const links = {}
let twins = 0
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
  const file = path.join(dir, e.name)
  if (e.isDirectory()) return walk(file)
  if (!file.endsWith('.html') || file.endsWith('/404.html')) return
  const html = fs.readFileSync(file, 'utf8')
  const rel = path.relative(root, file).replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '')
  const urlPath = '/' + rel
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/)
  const mdHref = attr(html, /<link rel="alternate" type="text\/markdown"[^>]*href="([^"]+)"/)
  if (!canonical) return
  links[urlPath] = { canonical, ...(mdHref ? { md: mdHref.replace(SITE, '') } : {}) }
  if (!mdHref) return
  const target = path.join(root, mdHref.replace(SITE, ''))
  if (fs.existsSync(target)) return
  const start = html.indexOf('<main id="main">'), end = html.lastIndexOf('</main>')
  if (start < 0 || end < 0) throw new Error(`[markdown] no <main> in ${file}`)
  const title = attr(html, /<title>([^<]*)<\/title>/) ?? ''
  const description = attr(html, /<meta name="description" content="([^"]*)"/) ?? ''
  const body = tidy(page.turndown(html.slice(start + 16, end)))
  const keys = KEY_LINKS.filter(([, href]) => href !== urlPath).map(([label, href]) => `- [${label}](${SITE}${href})`).join('\n')
  const md = `# ${title}\n\n> ${description}\n\n- URL: ${canonical}\n\n${body}\n\n## Key links\n\n${keys}\n`
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, md)
  twins++
})
walk(root)
fs.writeFileSync(new URL('_links.json', dist), JSON.stringify(links))
console.log(`[markdown] wrote ${twins} Markdown page twin(s) and _links.json (${Object.keys(links).length} page(s))`)
