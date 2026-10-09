// Fails if any internal link, image, script or stylesheet in dist/ points to a file that does not exist.
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const SITE = 'https://laravel-vuejs.space'
const files = []
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) await walk(p)
    else if (e.name.endsWith('.html')) files.push(p)
  }
}
const exists = async p => { try { return (await stat(p)).isFile() } catch { return false } }
async function resolves(path) {
  const clean = decodeURI(path.split('#')[0].split('?')[0])
  if (clean === '' || clean === '/') return exists(join(DIST, 'index.html'))
  const base = join(DIST, clean)
  return (await exists(base)) || (await exists(join(base, 'index.html'))) || (await exists(base + '.html'))
}

await walk(DIST)
const broken = []
const seen = new Map()
const attr = /\s(?:href|src|srcset|poster)="([^"]+)"/g
for (const f of files) {
  const html = (await readFile(f, 'utf8')).replace(/<script[\s\S]*?<\/script>/g, '')
  for (const [, raw] of html.matchAll(attr)) {
    for (const part of raw.split(',').map(s => s.trim().split(/\s+/)[0])) {
      let url = part.replaceAll('&amp;', '&')
      if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/'
      if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/cdn-cgi/') || url.startsWith('/api/forms')) continue
      if (!seen.has(url)) seen.set(url, await resolves(url))
      if (!seen.get(url)) broken.push(`${f.slice(DIST.length)} -> ${url}`)
    }
  }
}
console.log(`Checked ${files.length} pages, ${seen.size} unique internal URLs.`)
if (broken.length) { console.error(`Broken internal links (${broken.length}):\n` + broken.join('\n')); process.exit(1) }
console.log('No broken internal links.')
