// Used by .github/workflows/publish-scheduled.yml (and runnable locally: `node scripts/scheduled-due.mjs`).
// Lists posts whose `date` has passed but that the live site does not serve yet (they were future-dated at the
// last production build). Prints them and writes `missing=<slugs>` to $GITHUB_OUTPUT when run in Actions.
import fs from 'node:fs'
import path from 'node:path'

const site = process.env.SITE_URL || 'https://laravel-vuejs.space'
const dir = new URL('../src/content/posts/', import.meta.url)
const now = Date.now()

const due = fs.readdirSync(dir).filter(f => f.endsWith('.md')).flatMap(f => {
  const fm = fs.readFileSync(new URL(f, dir), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const date = Date.parse(fm.match(/^date:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1] ?? '')
  return !Number.isNaN(date) && date <= now ? [{ slug: path.basename(f, '.md'), date: new Date(date).toISOString() }] : []
})

const res = await fetch(`${site}/api/posts.json`, { headers: { 'cache-control': 'no-cache' } })
if (!res.ok) throw new Error(`GET ${site}/api/posts.json -> ${res.status}`)
const live = new Set((await res.json()).map(p => p.slug))
const missing = due.filter(p => !live.has(p.slug))

console.log(`${due.length} post(s) due, ${live.size} live, ${missing.length} waiting for a rebuild${missing.length ? ': ' + missing.map(p => `${p.slug} (${p.date})`).join(', ') : ''}`)
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `missing=${missing.map(p => p.slug).join(' ')}\n`)
