// Server side of the smaller agent tools: llms.txt fetch and sitemap read (/tools/llms-txt), live robots.txt fetch
// (/tools/ai-robots-tester) and the Markdown-for-agents probe (/tools/markdown-for-agents).
// Every request goes through the agent readiness safety layer (worker/agent-readiness.ts): public hosts only,
// DNS checked on every hop, timeouts, size caps and a small request budget per call.
import { attrs, ctype, get, looksHtml, makeCtx, normalizeTarget, tags, textOf, MAX_HTML, type Deps, type Got } from './agent-readiness.ts'
import { approxTokens } from '../src/data/agent-tools.ts'

type Fail = { error: string }
const down = (g: Got) => g.status === 0 || g.status >= 500
const why = (g: Got) => g.error ?? `the server answered HTTP ${g.status}`

async function start(raw: string, deps: Deps, budget: number) {
  const target = normalizeTarget(raw)
  if (typeof target === 'string') return { error: target } as Fail
  return { target, ctx: makeCtx(deps, budget) }
}

// ----- llms.txt -----

export type LlmsFetch = { url: string; finalUrl: string; status: number; contentType: string; body: string; truncated: boolean; full: { url: string; status: number; contentType: string } }

export async function fetchLlms(raw: string, deps: Deps = {}): Promise<LlmsFetch | Fail> {
  const s = await start(raw, deps, 6)
  if ('error' in s) return s
  const { target, ctx } = s
  const file = /\.(txt|md)$/i.test(target.pathname) ? target.toString() : `${target.origin}/llms.txt`
  const [g, full] = await Promise.all([
    get(ctx, file, { accept: 'text/plain,text/markdown;q=0.9,*/*;q=0.5', max: 512_000 }),
    get(ctx, `${target.origin}/llms-full.txt`, { accept: 'text/plain,text/markdown;q=0.9,*/*;q=0.5', max: 2048 }),
  ])
  if (g.status === 0) return { error: `Could not fetch ${file}: ${why(g)}.` }
  return { url: file, finalUrl: g.url, status: g.status, contentType: ctype(g), body: g.body, truncated: g.truncated, full: { url: full.url, status: full.status, contentType: ctype(full) } }
}

export type SitemapRead = { base: string; name: string; summary: string; sitemaps: { url: string; status: number; urls: number }[]; urls: string[]; capped: boolean }

const locs = (xml: string) => [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)\s*(?:\]\]>)?\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g, '&'))

// Reads the home page (name and summary) and the sitemap named in robots.txt (or /sitemap.xml); a sitemap index is
// followed into at most 3 child sitemaps. Only URLs on the same site are kept, at most 500.
export async function readSitemap(raw: string, deps: Deps = {}): Promise<SitemapRead | Fail> {
  const s = await start(raw, deps, 8)
  if ('error' in s) return s
  const { target, ctx } = s
  const origin = target.origin
  const [home, robots] = await Promise.all([
    get(ctx, `${origin}/`, { max: MAX_HTML }),
    get(ctx, `${origin}/robots.txt`, { accept: 'text/plain,*/*;q=0.5' }),
  ])
  if (down(home) && down(robots)) return { error: `Could not reach ${target.host}: ${why(home)}.` }
  const html = home.status === 200 ? home.body : ''
  const metas = tags(html, 'meta').map(attrs)
  const meta = (k: string) => metas.find(m => (m.name ?? m.property ?? '').toLowerCase() === k)?.content?.trim() ?? ''
  const title = textOf(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const name = meta('og:site_name') || title.split(/\s[|·–—-]\s/).pop()?.trim() || target.hostname
  const summary = meta('description') || meta('og:description')
  const declared = robots.status === 200 && !looksHtml(robots.body) ? [...robots.body.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map(m => m[1]) : []
  const first = declared.find(u => /^https?:\/\//i.test(u)) ?? `${origin}/sitemap.xml`
  const host = target.hostname.replace(/^www\./, '')
  const sameSite = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') === host } catch { return false } }
  const sitemaps: SitemapRead['sitemaps'] = []
  const urls: string[] = []
  const top = await get(ctx, first, { accept: 'application/xml,text/xml;q=0.9,*/*;q=0.5', max: 2_000_000 })
  const topLocs = top.status === 200 ? locs(top.body) : []
  if (top.status === 200 && /<sitemapindex\b/i.test(top.body)) {
    sitemaps.push({ url: top.url, status: top.status, urls: 0 })
    const children = topLocs.filter(u => !/image|video|news/i.test(u)).slice(0, 3)
    const got = await Promise.all(children.map(c => get(ctx, c, { accept: 'application/xml,text/xml;q=0.9,*/*;q=0.5', max: 2_000_000 })))
    got.forEach(g => {
      const l = g.status === 200 ? locs(g.body) : []
      sitemaps.push({ url: g.url, status: g.status, urls: l.length })
      urls.push(...l.filter(sameSite))
    })
  } else {
    sitemaps.push({ url: top.url, status: top.status, urls: topLocs.length })
    urls.push(...topLocs.filter(sameSite))
  }
  if (!urls.length) return { error: top.status === 200 ? `${top.url} lists no URLs on ${target.host}.` : `No sitemap found: ${top.url} answered ${top.status ? `HTTP ${top.status}` : why(top)}.` }
  const unique = [...new Set(urls)]
  return { base: origin, name, summary, sitemaps, urls: unique.slice(0, 500), capped: unique.length > 500 }
}

// ----- robots.txt -----

export type RobotsFetch = { url: string; finalUrl: string; status: number; contentType: string; body: string; path: string; note?: string }

export async function fetchRobots(raw: string, deps: Deps = {}): Promise<RobotsFetch | Fail> {
  const s = await start(raw, deps, 4)
  if ('error' in s) return s
  const { target, ctx } = s
  const g = await get(ctx, `${target.origin}/robots.txt`, { accept: 'text/plain,*/*;q=0.5', max: 512_000 })
  if (g.status === 0) return { error: `Could not fetch robots.txt: ${why(g)}.` }
  const html = g.status === 200 && looksHtml(g.body)
  const note = g.status === 404 || g.status === 410 ? 'No robots.txt (4xx): crawlers treat that as "allow everything".'
    : g.status >= 500 ? `robots.txt answers HTTP ${g.status}: crawlers treat a server error as "disallow everything" until it recovers.`
    : html ? 'robots.txt answers with an HTML page, not plain text: crawlers will not find any rules in it.'
    : g.status !== 200 ? `robots.txt answers HTTP ${g.status}.` : undefined
  return { url: `${target.origin}/robots.txt`, finalUrl: g.url, status: g.status, contentType: ctype(g), body: g.status === 200 && !html ? g.body : '', path: (target.pathname + target.search) || '/', note }
}

// ----- Markdown for agents -----

const HEADERS = ['content-type', 'vary', 'link', 'content-length', 'cache-control', 'x-markdown-tokens', 'content-signal', 'access-control-allow-origin']
export type Panel = { url: string; status: number; hops: string[]; headers: Record<string, string>; markdown: boolean; bytes: number; tokens: number; body: string; truncated: boolean; error?: string }
export type Note = { status: 'pass' | 'warn' | 'fail' | 'info'; text: string }
export type MarkdownProbe = { url: string; finalUrl: string; canonical: string; linked: string; html: Panel; negotiated: Panel; variant: Panel & { guessed: boolean }; notes: Note[]; saving: number | null }

const SHOW = 40_000
function panel(g: Got): Panel {
  const ct = ctype(g)
  const headers: Record<string, string> = {}
  for (const h of HEADERS) { const v = g.headers.get(h); if (v) headers[h] = v.slice(0, 600) }
  const markdown = g.status === 200 && (/text\/(x-)?markdown/.test(ct) || (/text\/plain/.test(ct) && !looksHtml(g.body))) && !looksHtml(g.body)
  return { url: g.url, status: g.status, hops: g.hops, headers, markdown, bytes: new TextEncoder().encode(g.body).length, tokens: approxTokens(g.body), body: g.body.slice(0, SHOW), truncated: g.truncated || g.body.length > SHOW, ...(g.error ? { error: g.error } : {}) }
}

export function guessVariant(u: URL): string {
  const path = u.pathname.replace(/\/+$/, '')
  return `${u.origin}${path ? `${path}.md` : '/index.md'}`
}

export async function probeMarkdown(raw: string, deps: Deps = {}): Promise<MarkdownProbe | Fail> {
  const s = await start(raw, deps, 10)
  if ('error' in s) return s
  const { target, ctx } = s
  const page = await get(ctx, target.toString(), { accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5', max: MAX_HTML })
  if (down(page)) return { error: `Could not read ${target}: ${why(page)}.` }
  const final = new URL(page.url)
  const html = page.status === 200 && looksHtml(page.body) || /html/.test(ctype(page)) ? page.body : ''
  const links = tags(html, 'link').map(attrs)
  const rel = (l: Record<string, string>, r: string) => (l.rel ?? '').toLowerCase().split(/\s+/).includes(r)
  const canonical = links.find(l => rel(l, 'canonical'))?.href ?? ''
  const linkedHref = links.find(l => rel(l, 'alternate') && /text\/(x-)?markdown/i.test(l.type ?? ''))?.href
  const linked = linkedHref ? new URL(linkedHref, final).toString() : ''
  const variantUrl = linked || guessVariant(final)
  const [neg, variant] = await Promise.all([
    get(ctx, final.toString(), { accept: 'text/markdown', max: MAX_HTML }),
    get(ctx, variantUrl, { accept: 'text/markdown,text/plain;q=0.9,*/*;q=0.5', max: MAX_HTML }),
  ])
  const H = panel(page), N = panel(neg), V = { ...panel(variant), guessed: !linked }
  const notes: Note[] = []
  const vary = (p: Panel) => (p.headers.vary ?? '').toLowerCase().split(',').map(x => x.trim()).includes('accept')
  // Negotiation
  if (N.markdown) {
    const typed = /markdown/.test(N.headers['content-type'] ?? '')
    notes.push(N.hops.length ? { status: 'warn', text: `Accept: text/markdown gets Markdown, but only after a redirect (${N.hops.join(' → ')}). Answer on the same URL.` }
      : typed ? { status: 'pass', text: 'Accept: text/markdown gets Markdown on the same URL, with Content-Type text/markdown.' }
      : { status: 'warn', text: `Accept: text/markdown gets Markdown on the same URL, but labelled ${(N.headers['content-type'] ?? 'with no type').split(';')[0]}. Send Content-Type: text/markdown; charset=utf-8.` })
    notes.push(vary(N) ? { status: 'pass', text: 'The Markdown response sends Vary: Accept.' } : { status: 'warn', text: 'The Markdown response has no Vary: Accept, so a shared cache could serve it to browsers.' })
    if (!vary(H)) notes.push({ status: 'warn', text: 'The HTML response has no Vary: Accept, so a shared cache could serve HTML to agents (or Markdown to browsers).' })
    if (N.headers['x-markdown-tokens']) notes.push({ status: 'info', text: `The server reports ${N.headers['x-markdown-tokens']} Markdown tokens (x-markdown-tokens).` })
  } else if (down(neg)) notes.push({ status: 'info', text: `The Markdown request did not complete (${why(neg)}).` })
  else if (neg.status !== 200) notes.push({ status: 'fail', text: `Accept: text/markdown gets HTTP ${neg.status}. Never error on that header: fall back to HTML at worst.` })
  else notes.push({ status: 'fail', text: `Accept: text/markdown still gets ${(N.headers['content-type'] ?? 'an unknown type').split(';')[0]}. Return a Markdown rendering with Content-Type text/markdown.` })
  // .md variant
  if (linked) notes.push({ status: 'pass', text: `The <head> links a Markdown copy: ${linked}` })
  else notes.push({ status: 'fail', text: 'No <link rel="alternate" type="text/markdown"> in the <head>.' })
  if (V.markdown) {
    notes.push({ status: linked ? 'pass' : 'warn', text: linked ? `The Markdown copy answers 200 (${(V.headers['content-type'] ?? '').split(';')[0] || 'no type'}).` : `${variantUrl} exists but isn't linked from the page. Add the alternate link.` })
    if (!/markdown/.test(V.headers['content-type'] ?? '')) notes.push({ status: 'warn', text: 'Serve the Markdown copy as text/markdown; charset=utf-8.' })
    if (/rel="?canonical/i.test(V.headers.link ?? '')) notes.push({ status: 'pass', text: 'The Markdown copy sends a canonical Link header pointing back to the HTML page.' })
    else notes.push({ status: 'warn', text: 'The Markdown copy has no Link: <page>; rel="canonical" header, so search engines may index it as a duplicate.' })
  } else if (linked) notes.push({ status: down(variant) ? 'info' : 'fail', text: `The linked Markdown copy ${down(variant) ? 'could not be fetched' : `answers HTTP ${variant.status}${variant.status === 200 ? ' with HTML' : ''}`}.` })
  else notes.push({ status: 'info', text: `No Markdown copy at the guessed URL ${variantUrl} (HTTP ${variant.status || why(variant)}).` })
  // Link header and canonical
  const linkHeader = H.headers.link ?? ''
  if (/text\/(x-)?markdown/i.test(linkHeader)) notes.push({ status: 'pass', text: 'The HTML response advertises the Markdown copy in its Link header.' })
  else notes.push({ status: 'info', text: 'The HTML response has no Link header pointing to a Markdown copy (optional, but agents can find it without parsing HTML).' })
  if (canonical) notes.push({ status: 'pass', text: `Canonical URL: ${canonical}` })
  else notes.push({ status: 'warn', text: 'The page has no <link rel="canonical">.' })
  const md = N.markdown ? N : V.markdown ? V : null
  const saving = md && H.tokens ? Math.round((1 - md.tokens / H.tokens) * 100) : null
  if (md && saving !== null) notes.push({ status: 'info', text: `Markdown is about ${md.tokens.toLocaleString('en')} tokens against ${H.tokens.toLocaleString('en')} for the HTML (${saving}% ${saving >= 0 ? 'smaller' : 'larger'}).` })
  return { url: target.toString(), finalUrl: final.toString(), canonical, linked, html: H, negotiated: N, variant: V, notes, saving }
}
