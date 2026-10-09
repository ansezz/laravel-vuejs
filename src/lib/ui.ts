// The only site-wide JavaScript: theme toggle, header shadow, copy buttons, TOC highlight.
export function initUi() {
  const root = document.documentElement
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    const apply = () => { root.dataset.theme = next; try { localStorage.setItem('theme', next) } catch {} }
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    typeof d.startViewTransition === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches ? d.startViewTransition(apply) : apply()
  }))

  const header = document.querySelector('.site-header')
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 8)
  addEventListener('scroll', onScroll, { passive: true }); onScroll()

  document.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const code = btn.closest('.code')?.querySelector('pre')?.innerText ?? ''
    try { await navigator.clipboard.writeText(code.replace(/\n$/, '')) } catch { return }
    const label = btn.querySelector('.copy-label'); btn.classList.add('done'); if (label) label.textContent = 'Copied'
    setTimeout(() => { btn.classList.remove('done'); if (label) label.textContent = 'Copy' }, 1600)
  }))

  const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]')]
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [decodeURIComponent(a.hash.slice(1)), a]))
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return
      links.forEach(a => a.classList.remove('active')); map.get(e.target.id)?.classList.add('active')
    }), { rootMargin: '-80px 0px -70% 0px' })
    map.forEach((_, id) => { const el = document.getElementById(id); el && io.observe(el) })
  }

  // Forms posting to the Worker (/api/forms/*): send with fetch and show the result inline.
  // Without JS they still work as normal POSTs (the Worker redirects to /thanks or /form-error).
  document.querySelectorAll<HTMLFormElement>('form[data-api]').forEach(f => {
    const ts = f.querySelector<HTMLInputElement>('input[name="ts"]'); if (ts) ts.value = String(Date.now())
    const status = f.querySelector<HTMLElement>('.form-status')
    const btn = f.querySelector<HTMLButtonElement>('button[type="submit"]')
    f.addEventListener('submit', async e => {
      e.preventDefault()
      if (btn?.disabled) return
      const say = (msg: string, kind: 'ok' | 'error' | 'busy') => { if (status) { status.textContent = msg; status.dataset.kind = kind } }
      btn && (btn.disabled = true); f.setAttribute('aria-busy', 'true'); say('Sending…', 'busy')
      try {
        const res = await fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        const out = await res.json().catch(() => ({ ok: false, error: 'Something went wrong. Please try again.' }))
        if (out.ok) { f.reset(); f.classList.add('sent'); say(out.message, 'ok') } else say(out.error ?? 'Something went wrong. Please try again.', 'error')
      } catch { say('Network error. Check your connection and try again.', 'error') }
      finally { btn && (btn.disabled = false); f.removeAttribute('aria-busy') }
    })
  })

  document.querySelector<HTMLDetailsElement>('.mobile-nav')?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => a.closest('details')?.removeAttribute('open')))
}
