// Pings IndexNow (Bing, Yandex, Seznam, Naver, ...) with recently changed URLs from the live sitemap.
// Used by .github/workflows/indexnow.yml and publish-scheduled.yml; runnable locally: `node scripts/indexnow.mjs`.
//   DAYS=2        submit URLs whose <lastmod> is within the last N days (default 2)
//   ALL=1         submit every URL in the sitemap (first run, or after big changes)
//   WAIT_FOR=a b  first wait (up to ~15 min) until these post slugs are live, e.g. right after a deploy
//   DRY_RUN=1     print the list, don't submit
import fs from 'node:fs'

const site = process.env.SITE_URL || 'https://laravel-vuejs.space'
const key = fs.readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8').match(/INDEXNOW_KEY = '([a-f0-9]+)'/)?.[1]
if (!key) throw new Error('INDEXNOW_KEY not found in src/config/site.ts')
const days = Number(process.env.DAYS || 2)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const get = async url => { const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } }); if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`); return r.text() }

async function sitemap() {
  const index = await get(`${site}/sitemap.xml`)
  const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const urls = []
  for (const child of children) for (const m of (await get(child)).matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?<\/url>/g)) urls.push({ loc: m[1], lastmod: m[2] })
  return urls
}

const waitFor = (process.env.WAIT_FOR || '').split(/\s+/).filter(Boolean)
let urls = await sitemap()
for (let i = 0; waitFor.length && i < 30; i++) {
  const missing = waitFor.filter(s => !urls.some(u => u.loc === `${site}/${s}`))
  if (!missing.length) break
  console.log(`Waiting for the deploy: ${missing.join(', ')} not live yet`)
  await sleep(30_000)
  urls = await sitemap()
}
const since = Date.now() - days * 86_400_000
const list = process.env.ALL === '1' ? urls.map(u => u.loc) : urls.filter(u => u.lastmod && Date.parse(u.lastmod) >= since).map(u => u.loc)
console.log(`${list.length} URL(s) to submit:\n${list.join('\n')}`)
if (!list.length || process.env.DRY_RUN === '1') process.exit(0)

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList: list.slice(0, 10_000) }),
})
console.log(`IndexNow responded ${res.status} ${res.statusText}`)
if (![200, 202].includes(res.status)) process.exit(1)
