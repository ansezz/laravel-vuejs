/// <reference types="@cloudflare/workers-types" />
// Cloudflare Worker for laravel-vuejs.space.
// - Serves the static Astro build (dist/) through the ASSETS binding.
// - Redirects www.laravel-vuejs.space to the apex domain.
// - Handles form posts at /api/forms/:form (contact, hire, newsletter, job):
//   validates, filters spam (honeypot, time trap, origin check, per-IP rate limit),
//   stores the submission in D1 and emails a notification through Resend.

export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  NOTIFY_TO: string
  MAIL_FROM: string
  RESEND_API_KEY?: string // secret: `wrangler secret put RESEND_API_KEY`
  IP_SALT?: string // optional secret used when hashing IPs
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
  newsletter: { label: 'Newsletter signup', fields: { email: { max: 200, required: true } } },
  job: {
    label: 'Job submission',
    fields: {
      name: { max: 100, required: true }, email: { max: 200, required: true }, company: { max: 120, required: true }, company_url: { max: 300 },
      role: { max: 140, required: true }, type: { max: 40 }, location: { max: 120 }, budget: { max: 80 }, stack: { max: 200 },
      description: { max: 8000, required: true, min: 30 }, apply: { max: 300, required: true }, featured: { max: 3 },
    },
  },
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX
      return Response.redirect(url.toString(), 301)
    }
    // OG images moved from PNG to JPEG; keep old share-card URLs working.
    const og = url.pathname.match(/^\/og\/([a-z0-9-]+)\.png$/)
    if (og) return Response.redirect(new URL(`/og/${og[1]}.jpg`, url).toString(), 301)
    const match = url.pathname.match(/^\/api\/forms\/([a-z]+)\/?$/)
    const res = match ? await handleForm(match[1], request, env, ctx) : await env.ASSETS.fetch(request)
    return withHeaders(res, url)
  },
} satisfies ExportedHandler<Env>

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
    return reply(request, 200, { ok: true, message: thanks(form) }, {}, form)
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
  return reply(request, 200, { ok: true, message: thanks(form) }, {}, form)
}

// Static asset headers (the _headers file is not applied when the Worker runs first, so they live here).
function withHeaders(res: Response, url: URL) {
  const out = new Response(res.body, res)
  const h = out.headers
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (res.ok && url.pathname.startsWith('/_astro/')) h.set('Cache-Control', 'public, max-age=31536000, immutable')
  else if (res.ok && /^\/(og|images)\//.test(url.pathname)) h.set('Cache-Control', 'public, max-age=604800')
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
    if (rule.required && !value) { errors.push(`Please fill in your ${label}.`); continue }
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
function reply(request: Request, status: number, body: { ok: boolean; message?: string; error?: string }, headers: Record<string, string> = {}, form?: Form) {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json')
  if (wantsJson) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })
  }
  const target = new URL(body.ok ? '/thanks' : '/form-error', request.url)
  if (form) target.searchParams.set('form', form)
  if (body.error) target.searchParams.set('reason', body.error.slice(0, 200))
  return new Response(null, { status: 303, headers: { Location: target.pathname + target.search, 'Cache-Control': 'no-store', ...headers } })
}

async function notify(env: Env, form: Form, id: number, data: Record<string, string>) {
  let status = 'skipped: no RESEND_API_KEY'
  if (env.RESEND_API_KEY) {
    const lines = Object.entries(data).map(([k, v]) => `${k}: ${v}`)
    const subject = `[laravel-vuejs.space] ${FORMS[form].label}${data.name ? ` from ${data.name}` : ''}${form === 'job' ? `: ${data.role}` : ''}`
    const html = `<h2 style="font-family:sans-serif">${esc(FORMS[form].label)} #${id}</h2><table style="font-family:sans-serif;border-collapse:collapse">${Object.entries(data)
      .map(([k, v]) => `<tr><th style="text-align:left;vertical-align:top;padding:6px 12px 6px 0;color:#384457">${esc(k)}</th><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>`
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `submission-${id}` },
        body: JSON.stringify({ from: env.MAIL_FROM, to: [env.NOTIFY_TO], reply_to: data.email, subject, text: `${FORMS[form].label} #${id}\n\n${lines.join('\n')}`, html }),
      })
      status = res.ok ? 'sent' : `failed: ${res.status} ${(await res.text()).slice(0, 200)}`
    } catch (e) {
      status = `failed: ${String(e).slice(0, 200)}`
    }
  }
  await env.DB.prepare('UPDATE submissions SET email_status = ?1 WHERE id = ?2').bind(status, id).run()
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}
