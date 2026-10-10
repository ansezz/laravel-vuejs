// Runs after `astro build`: collects a SHA-256 hash of every inline <script> in dist/ (Astro inlines small scripts,
// plus the theme bootstrap in Base.astro) and writes dist/_csp.json. The Worker reads it once and allows exactly
// those hashes in its Content-Security-Policy, so no 'unsafe-inline' is needed for scripts.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const dist = new URL('../dist/', import.meta.url).pathname
const hashes = new Set()
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
  const p = path.join(dir, e.name)
  if (e.isDirectory()) return walk(p)
  if (!p.endsWith('.html')) return
  const html = fs.readFileSync(p, 'utf8')
  if (/\son[a-z]+="/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) console.warn(`[csp] inline event handler in ${p}: it will be blocked`)
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/(ld\+)?json/.test(m[1]) || !m[2].trim()) continue
    hashes.add(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)
  }
})
walk(dist)
fs.writeFileSync(path.join(dist, '_csp.json'), JSON.stringify({ scriptHashes: [...hashes].sort() }))
console.log(`[csp] ${hashes.size} inline script hash(es) written to dist/_csp.json`)
