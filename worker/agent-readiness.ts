// AI agent readiness scanner behind /api/tools/agent-readiness.
// Fetches one public page plus a fixed list of well-known paths on the same host (at most MAX_FETCHES requests),
// then grades them with the catalog in src/data/agent-readiness.ts. Deterministic: no AI, no headless browser.
//
// Safety: http/https only, default ports only, no credentials in the URL, hostnames must resolve (DNS over HTTPS)
// to public addresses only (checked again on every redirect hop), redirects are followed by hand (max 3),
// every request has a timeout and a response size cap, and the whole scan has a request budget.
import {
  CHECK_BY_ID,
  categoryScores,
  gradeOf,
  scoreOf,
  type CheckResult,
  type Report,
  type Status,
} from '../src/data/agent-readiness.ts'

export const MAX_FETCHES = 15
export const TIMEOUT_MS = 8000
const MAX_HTML = 1_500_000
const MAX_TEXT = 256_000
const MAX_REDIRECTS = 3
const CONCURRENCY = 4
export const USER_AGENT = 'LaravelVueJsAgentReadiness/1.0 (+https://laravel-vuejs.space/tools/agent-readiness)'

// AI crawlers checked against robots.txt. Search and user-triggered agents are scored; training crawlers are only listed.
export const SEARCH_AGENTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']
export const TRAINING_AGENTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', 'Meta-ExternalAgent', 'Bytespider']

export type Deps = {
  fetch?: typeof fetch
  resolve?: (host: string) => Promise<string[]> // public DNS answers (A and AAAA) for a hostname
  maxFetches?: number
  timeoutMs?: number
  now?: () => Date
}

// ---------- target validation ----------

export function normalizeTarget(raw: string): URL | string {
  let s = (raw ?? '').trim()
  if (!s) return 'Enter a URL to scan.'
  if (s.length > 2048) return 'That URL is too long.'
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`
  let u: URL
  try { u = new URL(s) } catch { return 'That does not look like a URL.' }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Only http and https URLs can be scanned.'
  if (u.username || u.password) return 'URLs with a username or password cannot be scanned.'
  if (u.port && !(u.protocol === 'https:' && u.port === '443') && !(u.protocol === 'http:' && u.port === '80')) return 'Only the standard ports (80 and 443) can be scanned.'
  const host = u.hostname.toLowerCase().replace(/\.$/, '')
  if (!host.includes('.') && !host.startsWith('[')) return 'Enter a public domain name, like example.com.'
  if (/(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain|home\.arpa|test|invalid|example)$/.test(host)) return 'That host is not public, so it cannot be scanned.'
  const literal = host.replace(/^\[|\]$/g, '')
  if (isIpLiteral(literal) && isPrivateIp(literal)) return 'Private, loopback and link-local addresses cannot be scanned.'
  u.hash = ''
  return u
}

const isIpLiteral = (h: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':')

function v4(ip: string): number[] | null {
  const p = ip.split('.').map(Number)
  return p.length === 4 && p.every(n => Number.isInteger(n) && n >= 0 && n <= 255) ? p : null
}

// True for every address an outside scanner has no business fetching: private, loopback, link-local, CGNAT,
// documentation, benchmarking, multicast and reserved ranges, for IPv4 and IPv6 (including IPv4-mapped forms).
export function isPrivateIp(ip: string): boolean {
  const a = v4(ip)
  if (a) {
    const [x, y, z] = a
    return x === 0 || x === 10 || x === 127 || x >= 224 ||
      (x === 100 && y >= 64 && y <= 127) || (x === 169 && y === 254) || (x === 172 && y >= 16 && y <= 31) ||
      (x === 192 && y === 168) || (x === 192 && y === 0 && (z === 0 || z === 2)) || (x === 198 && (y === 18 || y === 19)) ||
      (x === 198 && y === 51 && z === 100) || (x === 203 && y === 0 && z === 113)
  }
  const h = ip.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0]
  if (!h.includes(':')) return true // not an address we understand: refuse
  const mapped = h.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (mapped && (h.startsWith('::ffff:') || h.startsWith('64:ff9b::') || h.startsWith('::'))) return isPrivateIp(mapped[1])
  const hexMapped = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16), lo = parseInt(hexMapped[2], 16)
    return isPrivateIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`)
  }
  if (h === '::' || h === '::1') return true
  const first = parseInt(h.split(':')[0] || '0', 16)
  return (first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00 ||
    h.startsWith('2001:db8:') || h.startsWith('2001:0db8:') || h.startsWith('64:ff9b:') || h.startsWith('100::') || first === 0
}

async function dohResolve(host: string): Promise<string[]> {
  const ask = async (type: 'A' | 'AAAA') => {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error(`DNS lookup failed (${res.status})`)
    const j = await res.json<{ Answer?: { type: number; data: string }[] }>()
    return (j.Answer ?? []).filter(a => a.type === 1 || a.type === 28).map(a => a.data)
  }
  const [a, aaaa] = await Promise.all([ask('A'), ask('AAAA')])
  return [...a, ...aaaa]
}

// ---------- fetching ----------

export type Got = {
  status: number // 0 when the request did not complete
  headers: Headers
  body: string
  url: string // final URL after redirects
  truncated: boolean
  hops: string[] // redirect chain, as "301 https://..."
  error?: string
}

type Ctx = {
  fetch: typeof fetch
  resolve: (host: string) => Promise<string[]>
  budget: number
  used: number
  timeoutMs: number
  dns: Map<string, Promise<string | null>> // host -> null when public, or the reason it is refused
  active: number
  queue: (() => void)[]
}

const noHeaders = () => new Headers()
const failed = (url: string, error: string, hops: string[] = []): Got => ({ status: 0, headers: noHeaders(), body: '', url, truncated: false, hops, error })

function checkHost(ctx: Ctx, host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '')
  let p = ctx.dns.get(h)
  if (!p) {
    p = (async () => {
      if (isIpLiteral(h)) return isPrivateIp(h) ? 'it points to a private address' : null
      let ips: string[]
      try { ips = await ctx.resolve(h) } catch { return 'its DNS lookup failed' }
      if (!ips.length) return 'it has no DNS address'
      return ips.some(isPrivateIp) ? 'it resolves to a private address' : null
    })()
    ctx.dns.set(h, p)
  }
  return p
}

async function slot<T>(ctx: Ctx, run: () => Promise<T>): Promise<T> {
  if (ctx.active >= CONCURRENCY) await new Promise<void>(r => ctx.queue.push(r))
  ctx.active++
  try { return await run() } finally { ctx.active--; ctx.queue.shift()?.() }
}

async function readCapped(res: Response, max: number) {
  if (!res.body) return { body: '', truncated: false }
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0, truncated = false
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (size + value.byteLength > max) {
      chunks.push(value.slice(0, max - size))
      truncated = true
      await reader.cancel().catch(() => {})
      break
    }
    chunks.push(value)
    size += value.byteLength
  }
  const all = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0))
  let o = 0
  for (const c of chunks) { all.set(c, o); o += c.byteLength }
  return { body: new TextDecoder().decode(all), truncated }
}

async function get(ctx: Ctx, url: string, opt: { accept?: string; origin?: string; max?: number; follow?: number } = {}): Promise<Got> {
  const hops: string[] = []
  let current = url
  for (let hop = 0; ; hop++) {
    const target = normalizeTarget(current)
    if (typeof target === 'string') return failed(current, `refused: ${target}`, hops)
    const refused = await checkHost(ctx, target.hostname)
    if (refused) return failed(current, `refused: ${target.hostname} is not scanned because ${refused}`, hops)
    if (ctx.used >= ctx.budget) return failed(current, `skipped: the scan's ${ctx.budget}-request limit was reached`, hops)
    ctx.used++
    const res = await slot(ctx, async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), ctx.timeoutMs)
      try {
        const r = await ctx.fetch(target.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': USER_AGENT,
            Accept: opt.accept ?? 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
            ...(opt.origin ? { Origin: opt.origin } : {}),
          },
        })
        const isRedirect = r.status >= 300 && r.status < 400 && r.headers.has('location')
        const read = isRedirect ? { body: '', truncated: false } : await readCapped(r, opt.max ?? MAX_TEXT)
        return { r, ...read }
      } catch (e) {
        const err = e as Error
        return { error: err.name === 'AbortError' ? `timed out after ${ctx.timeoutMs / 1000}s` : `request failed: ${err.message || String(e)}`.slice(0, 200) }
      } finally {
        clearTimeout(timer)
      }
    })
    if ('error' in res) return failed(target.toString(), res.error ?? 'request failed', hops)
    const { r } = res
    const location = r.headers.get('location')
    if (r.status >= 300 && r.status < 400 && location) {
      const next = new URL(location, target).toString()
      hops.push(`${r.status} ${next}`)
      if (hop >= Math.min(opt.follow ?? MAX_REDIRECTS, MAX_REDIRECTS)) {
        return { status: r.status, headers: r.headers, body: '', url: target.toString(), truncated: false, hops, error: 'too many redirects' }
      }
      current = next
      continue
    }
    return { status: r.status, headers: r.headers, body: res.body, url: target.toString(), truncated: res.truncated, hops }
  }
}

// ---------- parsing helpers ----------

export const clip = (s: string, n = 300) => {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1)}…` : t
}
const ctype = (g: Got) => (g.headers.get('content-type') ?? '').toLowerCase()
const looksHtml = (body: string) => /^\s*(<!doctype html|<html|<head|<body)/i.test(body)
const statusLine = (g: Got) => (g.status ? `HTTP ${g.status}${ctype(g) ? `, ${ctype(g).split(';')[0]}` : ''}` : g.error ?? 'no response') + (g.hops.length ? ` (after ${g.hops.join(' → ')})` : '')

export function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  const inner = tag.replace(/^<[a-z0-9-]+/i, '').replace(/\/?>$/, '')
  for (const m of inner.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return out
}
const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => m[0])
const decode = (s: string) => s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp|#39);/gi, (_, e: string) => {
  const k = e.toLowerCase()
  if (k[0] === '#') { const n = k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '' }
  return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' } as Record<string, string>)[k] ?? ''
})
const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

export function visibleText(html: string): string {
  return textOf(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head\b[\s\S]*?<\/head>/gi, ' ')
    .replace(/<(script|style|noscript|template|svg|iframe|object|canvas)\b[\s\S]*?<\/\1>/gi, ' '))
}

export type RobotsGroup = { agents: string[]; rules: { allow: boolean; path: string }[]; signals: string[]; line: number }
export type Robots = { groups: RobotsGroup[]; sitemaps: string[]; invalid: number }

// RFC 9309 parser: groups start at User-agent lines; Allow/Disallow (and Content-Signal) lines belong to the open group.
export function parseRobots(text: string): Robots {
  const groups: RobotsGroup[] = []
  const sitemaps: string[] = []
  let current: RobotsGroup | null = null
  let lastWasAgent = false
  let invalid = 0
  text.split(/\r\n|\r|\n/).forEach((raw, i) => {
    const line = raw.replace(/#.*$/, '').trim()
    if (!line) return
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/)
    if (!m) { invalid++; return }
    const key = m[1].toLowerCase(), value = m[2].trim()
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) { current = { agents: [], rules: [], signals: [], line: i + 1 }; groups.push(current) }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
      return
    }
    lastWasAgent = false
    if (key === 'sitemap') { if (value) sitemaps.push(value); return }
    if (!current) return
    if (key === 'allow' || key === 'disallow') { if (value || key === 'allow') current.rules.push({ allow: key === 'allow', path: value }); return }
    if (key === 'content-signal') current.signals.push(value)
  })
  return { groups, sitemaps, invalid }
}

function ruleMatches(rule: string, path: string) {
  if (!rule) return false
  const anchored = rule.endsWith('$')
  const body = anchored ? rule.slice(0, -1) : rule
  const re = new RegExp('^' + body.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (anchored ? '$' : ''))
  return re.test(path)
}

// Which rule decides whether `agent` may fetch `path`: the agent's own groups (merged), else the * groups.
// Longest matching rule wins; Allow wins a tie. No matching rule means allowed.
export function robotsVerdict(robots: Robots, agent: string, path: string): { allowed: boolean; rule?: string; group: string } {
  const token = agent.toLowerCase()
  let groups = robots.groups.filter(g => g.agents.includes(token))
  let group = agent
  if (!groups.length) { groups = robots.groups.filter(g => g.agents.includes('*')); group = '*' }
  let best: { allow: boolean; path: string } | undefined
  for (const r of groups.flatMap(g => g.rules)) {
    if (!ruleMatches(r.path, path)) continue
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow && !best.allow)) best = r
  }
  return { allowed: best ? best.allow : true, rule: best ? `${best.allow ? 'Allow' : 'Disallow'}: ${best.path}` : undefined, group }
}

export function validSignal(value: string): boolean {
  const pairs = value.split(',').map(p => p.trim()).filter(Boolean)
  return pairs.length > 0 && pairs.every(p => /^(search|ai-input|ai-train)\s*=\s*(yes|no)$/i.test(p))
}

export function parseLlms(text: string) {
  const lines = text.split(/\r?\n/)
  const firstContent = lines.find(l => l.trim())?.trim() ?? ''
  const h1s = lines.filter(l => /^#\s+\S/.test(l))
  const links = [...text.matchAll(/^\s*[-*]\s*\[([^\]]+)\]\(([^)\s]+)\)/gm)].map(m => m[2])
  return {
    h1First: /^#\s+\S/.test(firstContent),
    h1Count: h1s.length,
    summary: /^>\s*\S/m.test(text),
    sections: lines.filter(l => /^##\s+\S/.test(l)).length,
    links: links.length,
    relative: links.filter(l => !/^https?:\/\//i.test(l)).length,
  }
}

function jsonTypes(node: unknown, out: Set<string>, depth = 0) {
  if (depth > 12 || node === null || typeof node !== 'object') return
  if (Array.isArray(node)) { node.forEach(n => jsonTypes(n, out, depth + 1)); return }
  const o = node as Record<string, unknown>
  const t = o['@type']
  if (typeof t === 'string') out.add(t)
  else if (Array.isArray(t)) t.filter(x => typeof x === 'string').forEach(x => out.add(x as string))
  for (const v of Object.values(o)) if (v && typeof v === 'object') jsonTypes(v, out, depth + 1)
}

// ---------- the scan ----------

const result = (id: string, status: Status, summary: string, evidence: string): CheckResult => {
  const meta = CHECK_BY_ID[id]
  return {
    id, category: meta.category, title: meta.title, status, weight: meta.weight, optional: !!meta.optional,
    summary: clip(summary, 240), evidence: clip(evidence, 600),
    ...(status === 'fail' || status === 'warn' ? { fix: meta.fix } : {}),
  }
}

const json = (g: Got): unknown => { try { return JSON.parse(g.body) } catch { return undefined } }
const missing = (g: Got) => g.status === 404 || g.status === 410
const unreachable = (g: Got) => g.status === 0 || g.status >= 500 || g.status === 401 || g.status === 403 || g.status === 429

export async function scan(raw: string, deps: Deps = {}): Promise<Report | { error: string }> {
  const target = normalizeTarget(raw)
  if (typeof target === 'string') return { error: target }
  const ctx: Ctx = {
    fetch: deps.fetch ?? ((...a: Parameters<typeof fetch>) => fetch(...a)),
    resolve: deps.resolve ?? dohResolve,
    budget: deps.maxFetches ?? MAX_FETCHES,
    used: 0,
    timeoutMs: deps.timeoutMs ?? TIMEOUT_MS,
    dns: new Map(),
    active: 0,
    queue: [],
  }
  const refused = await checkHost(ctx, target.hostname)
  if (refused) return { error: `${target.hostname} cannot be scanned because ${refused}.` }

  const checks: CheckResult[] = []
  const notes: string[] = []
  const add = (r: CheckResult) => checks.push(r)

  // 1. The page itself.
  const page = await get(ctx, target.toString(), { max: MAX_HTML })
  const final = new URL(page.url)
  const origin = final.origin
  const html = page.status === 200 && /html|xml/.test(ctype(page)) ? page.body : page.status === 200 && looksHtml(page.body) ? page.body : ''
  if (page.truncated) notes.push(`Only the first ${Math.round(MAX_HTML / 1000)} KB of the page were read.`)

  const wallStatus = [401, 403, 429, 503].includes(page.status)
  const challenge = (page.headers.get('cf-mitigated') ?? '').toLowerCase() === 'challenge' ||
    /<title>\s*(just a moment|attention required|access denied|verifying you are human|please wait|security check)/i.test(page.body) ||
    (/(challenge-platform|captcha|px-captcha|_incapsula_|datadome|perimeterx)/i.test(page.body) && visibleText(page.body).split(' ').length < 80)
  const walled = wallStatus || challenge
  const pageOk = !!html && !walled

  // 2. Everything else on the same host, in priority order (the budget runs out at the bottom of the list first).
  const robotsP = get(ctx, `${origin}/robots.txt`, { accept: 'text/plain,*/*;q=0.5' })
  const llmsP = get(ctx, `${origin}/llms.txt`, { accept: 'text/plain,text/markdown,*/*;q=0.5' })
  const mdP = get(ctx, final.toString(), { accept: 'text/markdown, text/html;q=0.1', origin: 'https://laravel-vuejs.space', max: MAX_HTML })
  const httpP = final.protocol === 'https:' ? get(ctx, `http://${final.host}${final.pathname}`, { follow: 0 }) : Promise.resolve(undefined)
  const robots = await robotsP
  const robotsText = robots.status === 200 && !looksHtml(robots.body) ? robots.body : ''
  const parsedRobots = parseRobots(robotsText)
  const sitemapUrl = parsedRobots.sitemaps.find(s => /^https?:\/\//i.test(s)) ?? `${origin}/sitemap.xml`
  const sitemapP = get(ctx, sitemapUrl, { accept: 'application/xml,text/xml,*/*;q=0.5', max: 64_000 })
  const linkTags = tags(html, 'link').map(attrs)
  const mdHref = linkTags.find(l => (l.rel ?? '').toLowerCase().split(/\s+/).includes('alternate') && /text\/(x-)?markdown/i.test(l.type ?? ''))?.href
  const mdAltUrl = mdHref ? new URL(mdHref, final).toString() : undefined
  const mdAltP = mdAltUrl ? get(ctx, mdAltUrl, { accept: 'text/markdown,text/plain,*/*;q=0.5', max: 64_000 }) : Promise.resolve(undefined)
  const catalogP = get(ctx, `${origin}/.well-known/api-catalog`, { accept: 'application/linkset+json,application/json;q=0.9' })
  const mcpP = get(ctx, `${origin}/.well-known/mcp/server-card.json`, { accept: 'application/json' })
  const agentCardP = get(ctx, `${origin}/.well-known/agent-card.json`, { accept: 'application/json' })
  const agentsJsonP = get(ctx, `${origin}/.well-known/agents.json`, { accept: 'application/json' })
  const catalog = await catalogP
  const catalogJson = catalog.status === 200 ? json(catalog) as { linkset?: { item?: { href?: string; type?: string }[]; 'service-desc'?: { href?: string }[] }[] } | undefined : undefined
  const openapiHref = catalogJson?.linkset?.flatMap(l => [...(l['service-desc'] ?? []), ...(l.item ?? []).filter(i => /openapi|swagger/i.test(`${i.type} ${i.href}`))]).find(i => i.href)?.href
  const openapiP = get(ctx, openapiHref ? new URL(openapiHref, origin).toString() : `${origin}/openapi.json`, { accept: 'application/json,application/yaml;q=0.9' })
  let mcp = await mcpP
  if (missing(mcp)) mcp = await get(ctx, `${origin}/.well-known/mcp.json`, { accept: 'application/json' })
  const [llms, md, http, sitemap, mdAlt, agentCard, agentsJson, openapi] = await Promise.all([llmsP, mdP, httpP, sitemapP, mdAltP, agentCardP, agentsJsonP, openapiP])

  // ----- Content without JavaScript -----
  if (page.status === 200 && html && !walled) add(result('page', 'pass', `Answers 200 with HTML${page.hops.length ? ` after ${page.hops.length} redirect(s)` : ''}.`, statusLine(page)))
  else if (walled) add(result('page', 'unverified', 'The page answered with a bot wall, so its content could not be read.', statusLine(page)))
  else if (page.status === 0) add(result('page', 'unverified', `The page could not be fetched: ${page.error}.`, statusLine(page)))
  else add(result('page', 'fail', page.status === 200 ? 'Answers 200, but not with HTML.' : `Answers ${page.status}${page.error ? ` (${page.error})` : ''}.`, statusLine(page)))

  const unv = (id: string) => add(result(id, 'unverified', walled ? 'Not verified: the page is behind a bot wall.' : 'Not verified: the page HTML could not be read.', statusLine(page)))
  const titleText = textOf(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => textOf(m[1])).filter(Boolean)
  const words = visibleText(html).split(' ').filter(w => /[\p{L}\p{N}]/u.test(w))
  if (pageOk) {
    add(result('title', titleText ? 'pass' : 'fail', titleText ? `Title: "${clip(titleText, 90)}"` : 'No <title> in the raw HTML.', titleText ? `<title>${clip(titleText, 160)}</title>` : 'No <title> element found.'))
    add(result('h1', h1s.length ? 'pass' : 'fail', h1s.length ? `H1: "${clip(h1s[0], 90)}"` : 'No <h1> with text in the raw HTML.', h1s.length ? `<h1>${clip(h1s[0], 160)}</h1>` : 'No <h1> element with text found.'))
    const shell = /<div[^>]+id=["'](app|root|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(html)
    const status: Status = words.length >= 150 ? 'pass' : words.length >= 50 ? 'warn' : 'fail'
    add(result('text', status, `${words.length} words of visible text in the raw HTML${shell && status !== 'pass' ? '; the page looks like an empty JavaScript app shell' : ''}.`, `"${clip(words.slice(0, 40).join(' '), 260)}"`))
  } else ['title', 'h1', 'text'].forEach(unv)

  // ----- Structured data -----
  const ldBlocks = [...html.matchAll(/<script\b[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim())
  const types = new Set<string>()
  let badBlocks = 0
  for (const b of ldBlocks) { try { jsonTypes(JSON.parse(b), types) } catch { badBlocks++ } }
  const metas = tags(html, 'meta').map(attrs)
  const meta = (key: string) => metas.find(m => (m.name ?? m.property ?? '').toLowerCase() === key)?.content?.trim() ?? ''
  if (pageOk) {
    add(result('jsonld', !ldBlocks.length ? 'fail' : badBlocks ? (badBlocks === ldBlocks.length ? 'fail' : 'warn') : 'pass',
      !ldBlocks.length ? 'No JSON-LD block found.' : `${ldBlocks.length} JSON-LD block(s), ${badBlocks} invalid.`,
      ldBlocks.length ? clip(ldBlocks[0], 300) : 'No <script type="application/ld+json"> in the raw HTML.'))
    const known = [...types].filter(t => /^(https?:\/\/schema\.org\/)?[A-Z][A-Za-z]+$/.test(t))
    add(result('jsonld-types', known.length ? 'pass' : 'fail', known.length ? `Types: ${known.slice(0, 12).join(', ')}` : 'No schema.org @type found.', known.length ? `@type: ${[...types].join(', ')}` : 'No @type values in the JSON-LD.'))
    const og = ['og:title', 'og:description', 'og:image'].filter(k => meta(k))
    add(result('opengraph', og.length === 3 ? 'pass' : og.length ? 'warn' : 'fail', og.length === 3 ? 'og:title, og:description and og:image are set.' : `Found: ${og.join(', ') || 'none'}.`, og.map(k => `${k}="${clip(meta(k), 80)}"`).join(' ') || 'No Open Graph tags.'))
  } else ['jsonld', 'jsonld-types', 'opengraph'].forEach(unv)

  // ----- Semantics -----
  if (pageOk) {
    const htmlTag = attrs(tags(html, 'html')[0] ?? '<html>')
    add(result('lang', htmlTag.lang ? 'pass' : 'fail', htmlTag.lang ? `lang="${htmlTag.lang}"` : 'No lang attribute on <html>.', clip(tags(html, 'html')[0] ?? 'No <html> tag.', 200)))
    add(result('single-h1', h1s.length === 1 ? 'pass' : h1s.length > 1 ? 'warn' : 'fail', `${h1s.length} <h1> element(s).`, h1s.map(h => `<h1>${clip(h, 60)}</h1>`).slice(0, 4).join(' ') || 'No <h1>.'))
    const hasMain = /<main\b/i.test(html) || /role=["']main["']/i.test(html)
    const extra = ['header', 'nav', 'footer'].filter(t => new RegExp(`<${t}\\b`, 'i').test(html))
    add(result('landmarks', hasMain ? (extra.length ? 'pass' : 'warn') : 'fail', hasMain ? `<main> found${extra.length ? `, plus ${extra.map(t => `<${t}>`).join(', ')}` : ', but no header, nav or footer'}.` : 'No <main> landmark.', `main: ${hasMain ? 'yes' : 'no'}; ${['header', 'nav', 'footer'].map(t => `${t}: ${extra.includes(t) ? 'yes' : 'no'}`).join('; ')}`))
    const imgs = tags(html, 'img').map(attrs)
    if (!imgs.length) add(result('alt', 'info', 'No <img> elements in the raw HTML.', 'Nothing to check.'))
    else {
      const withAlt = imgs.filter(i => 'alt' in i).length
      const filled = imgs.filter(i => (i.alt ?? '').trim()).length
      const ratio = withAlt / imgs.length
      const missingSrc = imgs.filter(i => !('alt' in i)).slice(0, 3).map(i => clip(i.src ?? i['data-src'] ?? '?', 80))
      add(result('alt', ratio >= 0.9 ? 'pass' : ratio >= 0.5 ? 'warn' : 'fail', `${withAlt}/${imgs.length} images have an alt attribute (${Math.round(ratio * 100)}%); ${filled} have descriptive text.`, missingSrc.length ? `Missing alt: ${missingSrc.join(', ')}` : `All ${imgs.length} images have alt.`))
    }
    const desc = meta('description')
    add(result('description', desc.length >= 50 && desc.length <= 300 ? 'pass' : desc ? 'warn' : 'fail', desc ? `${desc.length} characters.` : 'No meta description.', desc ? `"${clip(desc, 200)}"` : 'No <meta name="description">.'))
    const canonical = linkTags.find(l => (l.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'))?.href ?? ''
    add(result('canonical', /^https?:\/\//i.test(canonical) ? 'pass' : canonical ? 'warn' : 'fail', canonical ? `Canonical: ${clip(canonical, 120)}` : 'No canonical link.', canonical ? `<link rel="canonical" href="${clip(canonical, 160)}">` : 'No <link rel="canonical">.'))
  } else ['lang', 'single-h1', 'landmarks', 'alt', 'description', 'canonical'].forEach(unv)

  // ----- Discoverability -----
  if (robotsText) {
    const ok = parsedRobots.groups.length > 0
    add(result('robots', ok ? (parsedRobots.invalid ? 'warn' : 'pass') : 'fail', ok ? `${parsedRobots.groups.length} group(s), ${parsedRobots.sitemaps.length} Sitemap line(s)${parsedRobots.invalid ? `, ${parsedRobots.invalid} line(s) not understood` : ''}.` : 'robots.txt has no User-agent group.', `${statusLine(robots)}: ${clip(robotsText, 260)}`))
  } else if (unreachable(robots)) add(result('robots', 'unverified', `robots.txt could not be read (${robots.error ?? `HTTP ${robots.status}`}).`, statusLine(robots)))
  else add(result('robots', 'fail', robots.status === 200 ? 'robots.txt answers with an HTML page, not plain text.' : `robots.txt answers ${robots.status}.`, `${statusLine(robots)}${robots.body ? `: ${clip(robots.body, 160)}` : ''}`))

  const sitemapOk = sitemap.status === 200 && /<(urlset|sitemapindex)\b/i.test(sitemap.body)
  if (sitemapOk) add(result('sitemap', 'pass', `${parsedRobots.sitemaps.length ? 'Named in robots.txt' : 'Found at /sitemap.xml (not named in robots.txt)'}: ${clip(sitemap.url, 120)}`, `${statusLine(sitemap)}: ${clip(sitemap.body.slice(0, 300), 200)}`))
  else if (unreachable(sitemap)) add(result('sitemap', 'unverified', `The sitemap could not be read (${sitemap.error ?? `HTTP ${sitemap.status}`}).`, `${sitemap.url}: ${statusLine(sitemap)}`))
  else add(result('sitemap', 'fail', sitemap.status === 200 ? 'The sitemap URL does not return a <urlset> or <sitemapindex>.' : `No sitemap: ${sitemap.url} answers ${sitemap.status}.`, `${sitemap.url}: ${statusLine(sitemap)}`))

  if (llms.status === 200 && !looksHtml(llms.body) && llms.body.trim()) {
    const l = parseLlms(llms.body)
    const problems = [!l.h1First && 'the first line is not a # H1', l.h1Count > 1 && `${l.h1Count} H1 lines`, !l.summary && 'no > summary', !l.links && 'no - [title](url) links', l.relative && `${l.relative} relative link(s)`, /text\/html/.test(ctype(llms)) && 'served as text/html'].filter(Boolean)
    add(result('llms', !l.h1First || !l.links ? 'warn' : problems.length ? 'warn' : 'pass', problems.length ? `llms.txt found, but: ${problems.join('; ')}.` : `H1, summary, ${l.sections} section(s) and ${l.links} link(s).`, `${statusLine(llms)}: ${clip(llms.body, 260)}`))
  } else if (unreachable(llms)) add(result('llms', 'unverified', `llms.txt could not be read (${llms.error ?? `HTTP ${llms.status}`}).`, statusLine(llms)))
  else add(result('llms', 'fail', llms.status === 200 ? '/llms.txt answers with an HTML page (often a catch-all route), not plain text.' : `/llms.txt answers ${llms.status}.`, statusLine(llms)))

  const signals = [...new Set(parsedRobots.groups.flatMap(g => g.signals))]
  if (robotsText) add(result('content-signal', signals.some(validSignal) ? 'pass' : signals.length ? 'warn' : 'fail', signals.length ? `Content-Signal: ${signals.join(' | ')}${signals.some(validSignal) ? '' : ' (not in key=yes|no form)'}` : 'No Content-Signal line in robots.txt.', signals.length ? signals.map(s => `Content-Signal: ${s}`).join('\n') : 'robots.txt has no Content-Signal directive.'))
  else add(result('content-signal', robots.status === 404 || robots.status === 410 ? 'fail' : 'unverified', robots.status === 404 || robots.status === 410 ? 'There is no robots.txt to hold a Content-Signal line.' : 'robots.txt could not be read.', statusLine(robots)))

  if (pageOk) {
    const feed = linkTags.find(l => (l.rel ?? '').toLowerCase().includes('alternate') && /application\/(rss|atom|feed)\+(xml|json)/i.test(l.type ?? ''))
    add(result('feed', feed ? 'pass' : 'fail', feed ? `Feed: ${clip(feed.href ?? '', 120)}` : 'No feed linked in the <head>.', feed ? `<link rel="alternate" type="${feed.type}" href="${clip(feed.href ?? '', 120)}">` : 'No <link rel="alternate" type="application/rss+xml|atom+xml|feed+json">.'))
  } else unv('feed')

  // ----- Bot access -----
  const path = final.pathname + final.search
  if (robotsText || robots.status === 404 || robots.status === 410) {
    const search = SEARCH_AGENTS.map(a => ({ a, ...robotsVerdict(parsedRobots, a, path) }))
    const training = TRAINING_AGENTS.map(a => ({ a, ...robotsVerdict(parsedRobots, a, path) }))
    const blocked = search.filter(s => !s.allowed)
    const fmt = (s: { a: string; allowed: boolean; rule?: string; group: string }) => `${s.a}: ${s.allowed ? 'allowed' : 'blocked'}${s.rule ? ` (${s.rule} in ${s.group === '*' ? 'User-agent: *' : `User-agent: ${s.group}`})` : ''}`
    const trainingBlocked = training.filter(t => !t.allowed).map(t => t.a)
    add(result('ai-bots', blocked.length === 0 ? 'pass' : blocked.length < search.length ? 'warn' : 'fail',
      `${search.length - blocked.length}/${search.length} AI search and user agents may read this URL. Training crawlers (not scored): ${trainingBlocked.length ? `${trainingBlocked.join(', ')} blocked` : 'all allowed'}.`,
      robotsText ? [...search, ...training].map(fmt).join('; ') : 'No robots.txt (HTTP 404): crawlers treat that as allow all.'))
  } else add(result('ai-bots', 'unverified', 'robots.txt could not be read, so AI crawler rules are unknown.', statusLine(robots)))

  if (page.status === 0) add(result('bot-wall', 'unverified', `The page could not be fetched: ${page.error}.`, statusLine(page)))
  else add(result('bot-wall', walled ? 'fail' : 'pass', walled ? `An identified crawler was refused (${wallStatus ? `HTTP ${page.status}` : 'challenge page'}).` : 'The page answered an identified crawler normally.', `${statusLine(page)}${page.headers.get('cf-mitigated') ? `; cf-mitigated: ${page.headers.get('cf-mitigated')}` : ''}; User-Agent: ${USER_AGENT}`))

  const xrt = page.headers.get('x-robots-tag') ?? ''
  const metaRobots = [meta('robots'), meta('googlebot')].filter(Boolean).join(', ')
  if (page.status === 0 || walled) unv('indexable')
  else {
    const noindex = /\b(noindex|none)\b/i.test(`${xrt} ${metaRobots}`)
    add(result('indexable', noindex ? 'fail' : 'pass', noindex ? 'The page asks not to be indexed.' : 'No noindex directive.', `X-Robots-Tag: ${xrt || '(none)'}; meta robots: ${metaRobots || '(none)'}`))
  }

  // ----- Agent capabilities -----
  const mdType = ctype(md)
  if (md.status === 200 && /text\/(x-)?markdown/.test(mdType) && !looksHtml(md.body)) {
    const vary = (md.headers.get('vary') ?? '').toLowerCase().includes('accept')
    add(result('markdown-negotiation', vary ? 'pass' : 'warn', `Markdown returned${vary ? ' with Vary: Accept' : ', but without Vary: Accept (caches may serve it to browsers)'}.`, `${statusLine(md)}; Vary: ${md.headers.get('vary') ?? '(none)'}: ${clip(md.body, 200)}`))
  } else if (md.status === 0 || md.status >= 500 || md.status === 429) add(result('markdown-negotiation', 'unverified', `The Markdown request did not complete (${md.error ?? `HTTP ${md.status}`}).`, statusLine(md)))
  else add(result('markdown-negotiation', 'fail', md.status === 200 ? `Accept: text/markdown still gets ${mdType.split(';')[0] || 'an unknown type'}.` : `Accept: text/markdown gets HTTP ${md.status}.`, statusLine(md)))

  if (!pageOk) unv('markdown-alternate')
  else if (!mdAltUrl) add(result('markdown-alternate', 'fail', 'No <link rel="alternate" type="text/markdown"> in the <head>.', 'No Markdown alternate link.'))
  else if (mdAlt && mdAlt.status === 200 && !looksHtml(mdAlt.body)) add(result('markdown-alternate', 'pass', `Linked and reachable: ${clip(mdAltUrl, 120)}`, `${statusLine(mdAlt)}: ${clip(mdAlt.body, 160)}`))
  else if (mdAlt && (mdAlt.status === 0 || mdAlt.status >= 500)) add(result('markdown-alternate', 'unverified', `Linked, but it could not be fetched (${mdAlt.error ?? `HTTP ${mdAlt.status}`}).`, `${mdAltUrl}: ${statusLine(mdAlt)}`))
  else add(result('markdown-alternate', 'warn', `Linked, but ${mdAltUrl} does not answer 200 with Markdown.`, `${mdAltUrl}: ${mdAlt ? statusLine(mdAlt) : 'not fetched'}`))

  const link = page.headers.get('link') ?? ''
  if (page.status === 0) unv('link-header')
  else {
    const rels = [...link.matchAll(/rel="?([^";,]+)"?/gi)].map(m => m[1])
    add(result('link-header', link ? 'pass' : 'fail', link ? `Link header with rel: ${[...new Set(rels)].join(', ') || '(none)'}.` : 'No Link header on the page response.', link ? `Link: ${clip(link, 400)}` : 'Link: (none)'))
  }

  const wellKnown = (id: string, g: Got, valid: (j: unknown) => boolean, label: string) => {
    const j = g.status === 200 ? json(g) : undefined
    if (g.status === 200 && j !== undefined && valid(j)) add(result(id, 'pass', `${label} found.`, `${g.url}: ${statusLine(g)}: ${clip(g.body, 220)}`))
    else if (g.status === 200) add(result(id, 'warn', `${g.url} answers 200, but not with a valid ${label}.`, `${statusLine(g)}: ${clip(g.body, 160)}`))
    else if (g.status === 0 || g.status >= 500 || g.status === 429) add(result(id, 'unverified', `${label} could not be checked (${g.error ?? `HTTP ${g.status}`}).`, `${g.url}: ${statusLine(g)}`))
    else add(result(id, 'fail', `No ${label} (HTTP ${g.status}).`, `${g.url}: ${statusLine(g)}`))
  }
  const obj = (j: unknown): j is Record<string, unknown> => !!j && typeof j === 'object' && !Array.isArray(j)
  wellKnown('api-catalog', catalog, j => obj(j) && Array.isArray(j.linkset), 'API catalog')
  wellKnown('openapi', openapi, j => obj(j) && (typeof j.openapi === 'string' || typeof j.swagger === 'string'), 'OpenAPI document')
  wellKnown('mcp-card', mcp, j => obj(j) && (typeof j.name === 'string' || obj(j.serverInfo) || Array.isArray(j.tools)), 'MCP server card')
  wellKnown('agent-card', agentCard, j => obj(j) && typeof j.name === 'string', 'A2A agent card')
  wellKnown('agents-json', agentsJson, j => obj(j), 'agents.json file')

  // ----- Security -----
  if (final.protocol !== 'https:') add(result('https', 'fail', 'The page is served over plain HTTP.', `Final URL: ${final}`))
  else if (!http) add(result('https', 'pass', 'Served over HTTPS.', `Final URL: ${final}`))
  else {
    const loc = http.hops[0]?.split(' ').slice(1).join(' ') ?? ''
    if (http.status === 0 || http.status >= 500) add(result('https', 'pass', `Served over HTTPS (the plain HTTP check did not complete: ${http.error ?? `HTTP ${http.status}`}).`, `Final URL: ${final}; http://: ${statusLine(http)}`))
    else if (http.status >= 300 && http.status < 400 && loc.startsWith('https://')) add(result('https', 'pass', `Served over HTTPS; http:// redirects (${http.status}) to HTTPS.`, `http://${final.host}${final.pathname} → ${http.status} ${clip(loc, 160)}`))
    else add(result('https', 'warn', `Served over HTTPS, but http:// does not redirect to HTTPS (HTTP ${http.status}).`, `http://${final.host}${final.pathname}: ${statusLine(http)}`))
  }
  if (page.status === 0) ['hsts', 'nosniff', 'csp'].forEach(unv)
  else {
    const hsts = page.headers.get('strict-transport-security') ?? ''
    const age = Number(hsts.match(/max-age=(\d+)/i)?.[1] ?? 0)
    add(result('hsts', age >= 15_552_000 ? 'pass' : hsts ? 'warn' : 'fail', hsts ? `max-age=${age} (${Math.round(age / 86400)} days).` : 'No Strict-Transport-Security header.', `Strict-Transport-Security: ${hsts || '(none)'}`))
    const nosniff = (page.headers.get('x-content-type-options') ?? '').toLowerCase()
    add(result('nosniff', nosniff.includes('nosniff') ? 'pass' : 'fail', nosniff.includes('nosniff') ? 'nosniff is set.' : 'No X-Content-Type-Options: nosniff.', `X-Content-Type-Options: ${nosniff || '(none)'}`))
    const cspHeader = page.headers.get('content-security-policy') ?? ''
    const cspMeta = metas.find(m => (m['http-equiv'] ?? '').toLowerCase() === 'content-security-policy')?.content ?? ''
    const reportOnly = page.headers.get('content-security-policy-report-only') ?? ''
    add(result('csp', cspHeader ? 'pass' : cspMeta || reportOnly ? 'warn' : 'fail', cspHeader ? 'Content-Security-Policy header is set.' : cspMeta ? 'CSP only in a <meta> tag.' : reportOnly ? 'CSP is report-only.' : 'No Content-Security-Policy.', `Content-Security-Policy: ${clip(cspHeader || cspMeta || reportOnly || '(none)', 300)}`))
  }

  // ----- CORS -----
  const acao = page.headers.get('access-control-allow-origin') ?? md.headers.get('access-control-allow-origin') ?? ''
  if (page.status === 0 && md.status === 0) unv('cors')
  else add(result('cors', acao ? 'pass' : 'fail', acao ? `Access-Control-Allow-Origin: ${clip(acao, 80)}` : 'No Access-Control-Allow-Origin header.', `Access-Control-Allow-Origin: ${acao || '(none)'} (request sent with an Origin header)`))

  if (ctx.used >= ctx.budget) notes.push(`The scan used its full budget of ${ctx.budget} requests; any check marked "could not verify" because of it is left out of the score.`)

  const score = scoreOf(checks) ?? 0
  return {
    url: target.toString(),
    finalUrl: final.toString(),
    scannedAt: (deps.now?.() ?? new Date()).toISOString(),
    score,
    grade: gradeOf(score),
    categories: categoryScores(checks),
    checks: order(checks),
    fetches: ctx.used,
    generated: { robots: robotsSnippet(parsedRobots, robotsText, sitemapOk ? sitemap.url : `${origin}/sitemap.xml`), llms: llmsStarter(html, final, meta, titleText, h1s[0], sitemapOk ? sitemap.url : undefined) },
    notes,
  }
}

const CHECK_ORDER = Object.keys(CHECK_BY_ID)
const order = (rows: CheckResult[]) => [...rows].sort((a, b) => CHECK_ORDER.indexOf(a.id) - CHECK_ORDER.indexOf(b.id))

// A robots.txt to merge with the site's own: keeps its User-agent: * rules, states a content-use policy,
// lets AI search and user agents in, and shows (commented out) how to opt out of model training only.
export function robotsSnippet(robots: Robots, text: string, sitemap: string): string {
  const star = robots.groups.filter(g => g.agents.includes('*'))
  const rules = star.flatMap(g => g.rules).map(r => `${r.allow ? 'Allow' : 'Disallow'}: ${r.path}`)
  const signal = star.flatMap(g => g.signals).find(validSignal) ?? 'search=yes, ai-input=yes, ai-train=no'
  return [
    'User-agent: *',
    `Content-Signal: ${signal}`,
    ...(rules.length ? rules : ['Allow: /']),
    '',
    '# AI search and user-triggered agents: let them read and cite your pages',
    ...SEARCH_AGENTS.map(a => `User-agent: ${a}`),
    ...(rules.length ? rules : ['Allow: /']),
    '',
    '# Model training crawlers: uncomment to opt out of training only (search above stays allowed)',
    ...['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Applebot-Extended', 'Meta-ExternalAgent'].map(a => `# User-agent: ${a}`),
    '# Disallow: /',
    '',
    ...(robots.sitemaps.length ? robots.sitemaps : [sitemap]).map(s => `Sitemap: ${s}`),
    ...(text ? [] : ['', '# No robots.txt was found: save this as /robots.txt (plain text).']),
  ].join('\n')
}

// A starter llms.txt built from the page's own title, description and same-site links. Edit before publishing.
export function llmsStarter(html: string, final: URL, meta: (k: string) => string, title: string, h1: string | undefined, sitemap?: string): string {
  const name = meta('og:site_name') || title.split(/\s[|·–—-]\s/).pop()?.trim() || final.hostname
  const summary = meta('description') || meta('og:description') || `What ${final.hostname} offers, in one sentence.`
  const seen = new Set<string>([final.origin + final.pathname])
  const links: string[] = []
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (links.length >= 12) break
    const href = attrs(`<a${m[1]}>`).href
    const label = clip(textOf(m[2]), 60)
    if (!href || !label || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue
    let u: URL
    try { u = new URL(href, final) } catch { continue }
    if (u.origin !== final.origin || /\.(png|jpe?g|gif|webp|svg|pdf|zip|css|js)$/i.test(u.pathname)) continue
    const key = u.origin + u.pathname
    if (seen.has(key)) continue
    seen.add(key)
    links.push(`- [${label.replace(/[[\]]/g, '')}](${key})`)
  }
  return [
    `# ${name}`,
    '',
    `> ${clip(summary, 220)}`,
    '',
    '## Pages',
    '',
    `- [${clip(h1 || title || name, 60).replace(/[[\]]/g, '')}](${final.origin + final.pathname}): ${clip(summary, 120)}`,
    ...links,
    ...(sitemap ? ['', '## Optional', '', `- [Sitemap](${sitemap}): every public URL`] : []),
  ].join('\n')
}
