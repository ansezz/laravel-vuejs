/// <reference types="@cloudflare/workers-types" />
// Cloudflare Worker for laravel-vuejs.space.
// - Serves the static Astro build (dist/) through the ASSETS binding.
// - Redirects www.laravel-vuejs.space to the apex domain.
// - Handles form posts at /api/forms/:form (contact, hire, newsletter, job):
//   validates, filters spam (honeypot, time trap, origin check, per-IP rate limit),
//   stores the submission in D1 and emails a notification through the Cloudflare Email Service
//   send_email binding (EMAIL), recording the send status on the row.

import { REDIRECTS } from './redirects'
import { normalizeTarget, scan } from './agent-readiness'

export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  EMAIL: SendEmail // send_email binding (Cloudflare Email Service)
  NOTIFY_TO: string
  MAIL_FROM: string
  MAIL_FROM_NAME: string
  IP_SALT?: string // optional secret used when hashing IPs
  SCAN_LIMIT?: RateLimit // rate limit binding for the agent readiness checker (per IP)
}

type Form = 'contact' | 'hire' | 'newsletter' | 'job'
type Field = { max: number; required?: boolean; min?: number }
const APEX = 'laravel-vuejs.space'
const RATE_LIMIT = { windowMinutes: 10, max: 5 }

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i
const FORMS: Record<Form, { label: string; fields: Record<string, Field> }> = {
  contact: {
    label: 'Contact message',
    fields: { name: { max: 100, required: true }, email: { max: 200, required: true }, topic: { max: 60 }, message: { max: 5000, required: true, min: 10 } },
  },
  hire: {
    label: 'Project inquiry',
    fields: {
      name: { max: 100, required: true }, email: { max: 200, required: true }, company: { max: 120 }, service: { max: 80 },
      budget: { max: 60 }, timeline: { max: 60 }, message: { max: 5000, required: true, min: 20 },
    },
  },
  // cheatsheet: optional slug of the cheat sheet the visitor signed up for (the plain-HTML post then lands on its download page).
  newsletter: { label: 'Newsletter signup', fields: { email: { max: 200, required: true }, consent: { max: 3, required: true }, cheatsheet: { max: 60 } } },
  job: {
    label: 'Job submission',
    fields: {
      name: { max: 100, required: true }, email: { max: 200, required: true }, company: { max: 120, required: true }, company_url: { max: 300 },
      role: { max: 140, required: true }, type: { max: 40 }, location: { max: 120 }, budget: { max: 80 }, stack: { max: 200 },
      description: { max: 8000, required: true, min: 30 }, apply: { max: 300, required: true }, featured: { max: 3 },
    },
  },
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX
      return Response.redirect(url.toString(), 301)
    }
    // Merged posts: one strong page per topic, the old URLs 301 to the section that replaced them.
    const moved = REDIRECTS[url.pathname.replace(/\/+$/, '')]
    if (moved) return Response.redirect(new URL(moved, url).toString(), 301)
    // Legacy duplicate of the terms page: one URL per page, so search engines don't split it across two.
    if (url.pathname === '/page/term-conditions') return Response.redirect(new URL('/page/terms-and-conditions', url).toString(), 301)
    // OG images moved from PNG to JPEG; keep old share-card URLs working.
    const og = url.pathname.match(/^\/og\/([a-z0-9-]+)\.png$/)
    if (og) return Response.redirect(new URL(`/og/${og[1]}.jpg`, url).toString(), 301)
    const match = url.pathname.match(/^\/api\/forms\/([a-z]+)\/?$/)
    if (url.pathname === '/_csp.json' || url.pathname === '/_links.json') return new Response('Not found', { status: 404 })
    if (match) {
      const [res] = await Promise.all([handleForm(match[1], request, env, ctx), loadHashes(env, url)])
      return withHeaders(res, url, false)
    }
    if (url.pathname === '/.well-known/api-catalog') return withHeaders(apiCatalog(request), url)
    if (url.pathname === '/api/tools/agent-readiness') return withHeaders(await handleReadiness(request, env, ctx, url), url, false)
    await Promise.all([loadHashes(env, url), loadLinks(env, url)])
    // Markdown for agents: `Accept: text/markdown` gets the page's Markdown twin (same URL, no redirect). Pages without a
    // twin, and every browser (they never ask for text/markdown), get the HTML as usual.
    const twin = (request.method === 'GET' || request.method === 'HEAD') && wantsMarkdown(request) ? pageLinks[pagePath(url.pathname)]?.md : undefined
    if (twin) {
      const md = await env.ASSETS.fetch(new Request(new URL(twin, url), { method: request.method, headers: request.headers }))
      if (md.ok) return withHeaders(md, url, true, twin)
    }
    return withHeaders(await env.ASSETS.fetch(request), url)
  },

  // Daily data retention (privacy policy): drop IP hashes and user agents after 30 days, delete submissions after
  // 12 months, and forget unsubscribed newsletter addresses 30 days after they unsubscribe.
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    const r = await env.DB.batch([
      env.DB.prepare(`UPDATE submissions SET ip_hash = '', user_agent = NULL WHERE ip_hash != '' AND created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`),
      env.DB.prepare(`DELETE FROM submissions WHERE created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-12 months')`),
      env.DB.prepare(`DELETE FROM subscribers WHERE unsubscribed_at IS NOT NULL AND unsubscribed_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`),
    ])
    console.log(`[retention] anonymised ${r[0].meta.changes}, deleted ${r[1].meta.changes} submission(s) and ${r[2].meta.changes} unsubscribed address(es)`)
  },
} satisfies ExportedHandler<Env>
export default worker

async function handleForm(name: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!(name in FORMS)) return reply(request, 404, { ok: false, error: 'Unknown form.' })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: 'POST' } })
  if (request.method !== 'POST') return reply(request, 405, { ok: false, error: 'Use POST.' }, { Allow: 'POST' })
  const form = name as Form

  const origin = request.headers.get('Origin')
  if (origin && !allowedOrigin(origin, request.url)) return reply(request, 403, { ok: false, error: 'Cross-site form posts are not allowed.' })
  if (Number(request.headers.get('Content-Length') ?? 0) > 64_000) return reply(request, 413, { ok: false, error: 'That message is too long.' })

  let input: FormData
  try { input = await request.formData() } catch { return reply(request, 400, { ok: false, error: 'Could not read the form.' }) }

  // Spam traps: a hidden field humans never fill, and forms sent faster than a human can type.
  // Bots get a normal-looking success so they don't adapt; nothing is stored or sent.
  const ts = Number(input.get('ts') ?? 0)
  if (String(input.get('website') ?? '').trim() !== '' || (ts > 0 && Date.now() - ts < 2500)) {
    return reply(request, 200, { ok: true, message: thanks(form) }, {}, form, cheatsheetNext(form, input))
  }

  const { data, errors } = validate(form, input)
  if (errors.length) return reply(request, 422, { ok: false, error: errors.join(' ') })
  const links = (Object.values(data).join(' ').match(/https?:\/\//g) ?? []).length
  if (links > 6) return reply(request, 422, { ok: false, error: 'Please include fewer links.' })

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const ipHash = await sha256(`${env.IP_SALT ?? 'laravel-vuejs'}:${ip}`)
  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM submissions WHERE ip_hash = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?2)`,
  ).bind(ipHash, `-${RATE_LIMIT.windowMinutes} minutes`).first<{ n: number }>()
  if ((recent?.n ?? 0) >= RATE_LIMIT.max) {
    return reply(request, 429, { ok: false, error: 'Too many messages from your network. Please try again in a few minutes.' }, { 'Retry-After': String(RATE_LIMIT.windowMinutes * 60) })
  }

  const { name: person = null, email, ...rest } = data
  const row = await env.DB.prepare(
    `INSERT INTO submissions (form, name, email, data, ip_hash, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id`,
  ).bind(form, person, email, JSON.stringify(rest), ipHash, (request.headers.get('User-Agent') ?? '').slice(0, 300)).first<{ id: number }>()
  if (form === 'newsletter') {
    await env.DB.prepare(`INSERT INTO subscribers (email) VALUES (?1) ON CONFLICT(email) DO UPDATE SET unsubscribed_at = NULL`).bind(email.toLowerCase()).run()
  }
  if (row) ctx.waitUntil(notify(env, form, row.id, data))
  return reply(request, 200, { ok: true, message: thanks(form) }, {}, form, cheatsheetNext(form, input))
}

// AI agent readiness checker (/tools/agent-readiness): scans one public URL and returns the report as JSON.
// Results are cached for 10 minutes per URL (cache hits don't count against the limit); fresh scans are rate-limited
// per IP with the SCAN_LIMIT binding, or an in-memory counter when the binding is missing (local dev).
const SCAN_TTL = 600
const scanHits = new Map<string, number[]>()
function memoryLimit(ip: string, max = 5, windowMs = 60_000) {
  const now = Date.now()
  const hits = (scanHits.get(ip) ?? []).filter(t => now - t < windowMs)
  if (scanHits.size > 5000) scanHits.clear()
  if (hits.length >= max) return false
  hits.push(now)
  scanHits.set(ip, hits)
  return true
}
const scanJson = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })

async function handleReadiness(request: Request, env: Env, ctx: ExecutionContext, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: 'GET, POST' } })
  if (request.method !== 'GET' && request.method !== 'POST') return scanJson(405, { error: 'Use GET or POST.' }, { Allow: 'GET, POST' })
  let raw = url.searchParams.get('url') ?? ''
  if (request.method === 'POST' && !raw) {
    if (Number(request.headers.get('Content-Length') ?? 0) > 4096) return scanJson(413, { error: 'Request too large.' })
    try {
      const type = request.headers.get('Content-Type') ?? ''
      raw = type.includes('json') ? String((await request.json<{ url?: string }>()).url ?? '') : String((await request.formData()).get('url') ?? '')
    } catch { return scanJson(400, { error: 'Could not read the request.' }) }
  }
  const target = normalizeTarget(raw)
  if (typeof target === 'string') return scanJson(400, { error: target })

  const cacheKey = new Request(`https://${APEX}/api/tools/agent-readiness?v=2&url=${encodeURIComponent(target.toString())}`)
  const cache = (caches as unknown as { default: Cache }).default
  const hit = await cache.match(cacheKey).catch(() => undefined)
  if (hit) {
    const out = new Response(hit.body, hit)
    out.headers.set('X-Scan-Cache', 'HIT')
    out.headers.set('Cache-Control', 'no-store')
    return out
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const allowed = env.SCAN_LIMIT ? (await env.SCAN_LIMIT.limit({ key: ip }).catch(() => ({ success: memoryLimit(ip) }))).success : memoryLimit(ip)
  if (!allowed) return scanJson(429, { error: 'Too many scans from your network. Please wait a minute and try again.' }, { 'Retry-After': '60' })

  let report: Awaited<ReturnType<typeof scan>>
  try { report = await scan(target.toString(), { fetch: selfAware(env, ctx) }) } catch (e) {
    console.error('agent readiness scan failed', target.toString(), e)
    return scanJson(502, { error: 'The scan failed unexpectedly. Please try again.' })
  }
  if ('error' in report) return scanJson(422, report)
  // Browsers always re-ask (no-store); the Worker keeps a 10-minute copy, but only of scans that could read the page.
  if (report.checks.find(c => c.id === 'page')?.status === 'pass') {
    ctx.waitUntil(cache.put(cacheKey, scanJson(200, report, { 'Cache-Control': `public, max-age=${SCAN_TTL}` })).catch(() => {}))
  }
  return scanJson(200, report, { 'X-Scan-Cache': 'MISS' })
}

// A Worker can't fetch its own custom domain over the network (Cloudflare answers 522), so scans of this site are
// answered by this same handler in-process: the same files and headers a visitor gets. Plain-HTTP requests to it
// are left unverified (the HTTP to HTTPS redirect happens at Cloudflare's edge, before the Worker).
function selfAware(env: Env, ctx: ExecutionContext): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = new URL(input instanceof Request ? input.url : input.toString())
    if (u.hostname !== APEX && u.hostname !== `www.${APEX}`) return fetch(input, init)
    if (u.protocol === 'http:') throw new Error('plain HTTP to this site is redirected at the edge and not checked in-process')
    return worker.fetch(new Request(u.toString(), init), env, ctx)
  }
}

// After a newsletter signup from a cheat sheet page, plain HTML posts (no JS) go to that sheet's download page.
function cheatsheetNext(form: Form, input: FormData) {
  const slug = String(input.get('cheatsheet') ?? '')
  return form === 'newsletter' && /^[a-z0-9-]{1,60}$/.test(slug) ? `/cheatsheets/${slug}/download` : undefined
}

// Static asset headers (the _headers file is not applied when the Worker runs first, so they live here).
// Security headers. The CSP allows our own files, the exact inline scripts of this build (hashes from dist/_csp.json,
// written by scripts/csp.mjs), Cloudflare Web Analytics, Disqus (loaded only after a click) and the sponsor network (PARTNER_HOSTS). Inline style
// attributes are used throughout the markup, so styles keep 'unsafe-inline'.
const PERMISSIONS_POLICY = 'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), browsing-topics=()'
// A fresh nonce per HTML response: we don't use it ourselves (our inline scripts are covered by hashes), but Cloudflare's
// JavaScript Detections (Bot Fight Mode) injects an inline script that changes on every request. Cloudflare reads the
// nonce from this header and adds it to the script it injects, so it runs without 'unsafe-inline' and without a CSP error.
// https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-you-have-a-content-security-policy-csp
const nonce = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
// Google's sponsor network (src/components/Partner.astro): its script, its consent message (Funding Choices) and the
// frames it serves. Only pages with a configured slot load any of it.
const PARTNER_HOSTS = 'https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google https://*.gstatic.com'
const csp = (hashes: string[]) => [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce()}' ${hashes.join(' ')} https://static.cloudflareinsights.com https://*.disqus.com https://*.disquscdn.com ${PARTNER_HOSTS}`,
  "style-src 'self' 'unsafe-inline' https://*.disquscdn.com",
  "img-src 'self' data: https:",
  "font-src 'self'",
  `connect-src 'self' https://cloudflareinsights.com https://*.disqus.com ${PARTNER_HOSTS}`,
  `frame-src https://disqus.com https://*.disqus.com ${PARTNER_HOSTS}`,
  "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'", "manifest-src 'self'", 'upgrade-insecure-requests',
].join('; ')
let scriptHashes: string[] = []
let hashesLoaded: Promise<void> | undefined
function loadHashes(env: Env, url: URL) {
  hashesLoaded ??= env.ASSETS.fetch(new URL('/_csp.json', url)).then(r => r.ok ? r.json<{ scriptHashes: string[] }>() : { scriptHashes: [] })
    .then(j => { scriptHashes = j.scriptHashes }).catch(() => { hashesLoaded = undefined })
  return hashesLoaded
}

// Per-page canonical URL and Markdown twin, written by scripts/markdown.mjs (dist/_links.json): used for the Link header
// and for `Accept: text/markdown`.
type PageLinks = Record<string, { canonical: string; md?: string }>
let pageLinks: PageLinks = {}
let markdownPages: Record<string, string> = {} // Markdown twin path -> canonical URL of its page
let linksLoaded: Promise<void> | undefined
function loadLinks(env: Env, url: URL) {
  linksLoaded ??= env.ASSETS.fetch(new URL('/_links.json', url)).then(r => r.ok ? r.json<PageLinks>() : {})
    .then((j: PageLinks) => {
      pageLinks = j
      markdownPages = Object.fromEntries(Object.values(j).filter(l => l.md).map(l => [l.md!, l.canonical]))
    }).catch(() => { linksLoaded = undefined })
  return linksLoaded
}
const pagePath = (p: string) => p.replace(/\/+$/, '') || '/'

// True when the client asks for Markdown at least as strongly as for HTML (e.g. `Accept: text/markdown`).
function wantsMarkdown(request: Request) {
  let md = 0, html = 0
  for (const part of (request.headers.get('Accept') ?? '').toLowerCase().split(',')) {
    const [type, ...params] = part.trim().split(';').map(s => s.trim())
    const q = Number(params.find(p => p.startsWith('q='))?.slice(2) ?? 1)
    if (type === 'text/markdown' || type === 'text/x-markdown') md = Math.max(md, q)
    else if (type === 'text/html') html = Math.max(html, q)
  }
  return md > 0 && md >= html
}

// RFC 9727 API catalog: the public, read-only machine-readable files this static site already publishes. There is no
// authenticated API; everything listed is a plain GET with no key.
const API_CATALOG = JSON.stringify({
  linkset: [{
    anchor: `https://${APEX}/.well-known/api-catalog`,
    item: [
      { href: `https://${APEX}/api/posts.json`, type: 'application/json', title: 'Search index: every published article (slug, URL, title, excerpt, date, topics, text)' },
      { href: `https://${APEX}/feed.xml`, type: 'application/rss+xml', title: 'RSS feed of the latest articles' },
      { href: `https://${APEX}/sitemap.xml`, type: 'application/xml', title: 'Sitemap index' },
      { href: `https://${APEX}/llms.txt`, type: 'text/plain', title: 'llms.txt: index of the site for language models, with links to the Markdown copy of every article' },
      { href: `https://${APEX}/llms-full.txt`, type: 'text/plain', title: 'Full text of every article as Markdown' },
    ],
  }],
}, null, 2)
function apiCatalog(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  return new Response(request.method === 'HEAD' ? null : API_CATALOG, {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      Link: `<https://${APEX}/.well-known/api-catalog>; rel="api-catalog"`,
    },
  })
}

// publicRead: every static file is public and read-only (no cookies, no credentials), so browser-based agents may fetch
// it cross-origin. The forms API is not. twin: the Markdown file served for `Accept: text/markdown` on a page URL.
function withHeaders(res: Response, url: URL, publicRead = true, twin?: string) {
  const out = new Response(res.body, res)
  const h = out.headers
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', PERMISSIONS_POLICY)
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  h.set('Cross-Origin-Opener-Policy', 'same-origin')
  h.set('X-Frame-Options', 'DENY')
  if ((h.get('Content-Type') ?? '').includes('text/html')) h.set('Content-Security-Policy', csp(scriptHashes))
  if (res.ok && url.pathname.startsWith('/_astro/')) h.set('Cache-Control', 'public, max-age=31536000, immutable')
  else if (res.ok && /^\/(og|images)\//.test(url.pathname)) h.set('Cache-Control', 'public, max-age=604800')
  if (publicRead) h.set('Access-Control-Allow-Origin', '*')
  // Markdown copies of pages: right MIME type, and a canonical Link header so search engines credit the HTML page.
  // Page URLs answer HTML or Markdown depending on Accept, so they (and their caches) vary on it.
  const mdPath = twin ?? (url.pathname.endsWith('.md') ? url.pathname : undefined)
  const page = pageLinks[pagePath(url.pathname)]
  if (res.ok && mdPath) {
    h.set('Content-Type', 'text/markdown; charset=utf-8')
    const canonical = markdownPages[mdPath] ?? (/^\/[a-z0-9-]+\.md$/.test(mdPath) ? `https://${APEX}${mdPath.slice(0, -3)}` : undefined)
    if (canonical) h.set('Link', `<${canonical}>; rel="canonical"`)
    if (twin) h.append('Vary', 'Accept')
  } else if ((h.get('Content-Type') ?? '').includes('text/html')) {
    h.append('Vary', 'Accept')
    if (res.ok && page) {
      h.set('Link', [`<${page.canonical}>; rel="canonical"`, ...(page.md ? [`<https://${APEX}${page.md}>; rel="alternate"; type="text/markdown"`] : []),
        `<https://${APEX}/sitemap.xml>; rel="sitemap"`, `<https://${APEX}/.well-known/api-catalog>; rel="api-catalog"`].join(', '))
    }
  }
  if (res.ok && /^\/llms(-full)?\.txt$/.test(url.pathname)) h.set('Content-Type', 'text/plain; charset=utf-8')
  // Cheat sheet PDFs sit behind the newsletter form (soft gate): keep them out of search results.
  if (res.ok && url.pathname.startsWith('/cheatsheets/pdf/')) h.set('X-Robots-Tag', 'noindex')
  // Keep workers.dev production and preview URLs out of search results (laravel-vuejs.space is canonical).
  if (url.hostname.endsWith('.workers.dev')) h.set('X-Robots-Tag', 'noindex')
  return out
}

function validate(form: Form, input: FormData) {
  const data: Record<string, string> = {}
  const errors: string[] = []
  for (const [key, rule] of Object.entries(FORMS[form].fields)) {
    const value = String(input.get(key) ?? '').replace(/\r\n/g, '\n').trim()
    const label = key.replace('_', ' ')
    if (rule.required && !value) { errors.push(key === 'consent' ? 'Please tick the box to agree to receive the newsletter.' : `Please fill in your ${label}.`); continue }
    if (value.length > rule.max) errors.push(`The ${label} is too long (max ${rule.max} characters).`)
    else if (rule.min && value && value.length < rule.min) errors.push(`The ${label} is a bit short; add a few more details.`)
    if (value) data[key] = value
  }
  if (data.email && !EMAIL.test(data.email)) errors.push('Please enter a valid email address.')
  return { data: data as Record<string, string> & { email: string; name?: string }, errors }
}

function allowedOrigin(origin: string, requestUrl: string) {
  try {
    const host = new URL(origin).hostname
    return host === new URL(requestUrl).hostname || host === APEX || host.endsWith('.workers.dev') || host === 'localhost' || host === '127.0.0.1'
  } catch { return false }
}

function thanks(form: Form) {
  return {
    contact: "Thanks! Your message is on its way. We usually reply within two working days.",
    hire: "Thanks! We got your project details and will reply within two working days.",
    newsletter: "You're on the list. Watch your inbox for the next issue.",
    job: "Thanks! We'll review your listing and email you before it goes live.",
  }[form]
}

// JSON for fetch() callers, a redirect to a thank-you or error page for plain HTML form posts (no JS).
function reply(request: Request, status: number, body: { ok: boolean; message?: string; error?: string }, headers: Record<string, string> = {}, form?: Form, next?: string) {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json')
  if (wantsJson) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })
  }
  if (body.ok && next) return new Response(null, { status: 303, headers: { Location: next, 'Cache-Control': 'no-store', ...headers } })
  const target = new URL(body.ok ? '/thanks' : '/form-error', request.url)
  if (form) target.searchParams.set('form', form)
  if (body.error) target.searchParams.set('reason', body.error.slice(0, 200))
  return new Response(null, { status: 303, headers: { Location: target.pathname + target.search, 'Cache-Control': 'no-store', ...headers } })
}

async function notify(env: Env, form: Form, id: number, data: Record<string, string>) {
  const label = FORMS[form].label
  const subject = `[laravel-vuejs.space] ${label}${data.name ? ` from ${data.name}` : ''}${form === 'job' ? `: ${data.role}` : ''}`
  const text = `${label} #${id}\n\n${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReply to this email to answer ${data.email}.`
  const html = `<h2 style="font-family:sans-serif">${esc(label)} #${id}</h2><table style="font-family:sans-serif;border-collapse:collapse">${Object.entries(data)
    .map(([k, v]) => `<tr><th style="text-align:left;vertical-align:top;padding:6px 12px 6px 0;color:#384457">${esc(k)}</th><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>
<p style="font-family:sans-serif;color:#384457">Reply to this email to answer ${esc(data.email)}.</p>`
  let status: string
  try {
    const res = await env.EMAIL.send({
      from: { email: env.MAIL_FROM, name: env.MAIL_FROM_NAME },
      to: env.NOTIFY_TO,
      replyTo: data.name ? { email: data.email, name: data.name } : data.email,
      subject, text, html,
    })
    status = `sent: ${res.messageId}`.slice(0, 300)
  } catch (e) {
    const err = e as { code?: string; message?: string }
    status = `failed: ${err.code ?? 'error'} ${err.message ?? String(e)}`.slice(0, 300)
    console.error('Email notification failed', id, status)
  }
  await env.DB.prepare('UPDATE submissions SET email_status = ?1 WHERE id = ?2').bind(status, id).run()
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}
