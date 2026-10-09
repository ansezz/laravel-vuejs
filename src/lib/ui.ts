// The only site-wide JavaScript: theme toggle, header shadow, copy buttons, TOC highlight.
export function initUi() {
  const root = document.documentElement
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    const apply = () => { root.dataset.theme = next; try { localStorage.setItem('theme', next) } catch {} }
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    d.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches ? d.startViewTransition(apply) : apply()
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

  document.querySelector<HTMLDetailsElement>('.mobile-nav')?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => a.closest('details')?.removeAttribute('open')))
}
