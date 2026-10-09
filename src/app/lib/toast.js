// Lightweight replacement for @nuxtjs/toast (vue-toasted), position top-center, 4s.
function show(message, type) {
  if (typeof document === 'undefined') return
  let c = document.querySelector('.toasted-container')
  if (!c) { c = document.createElement('div'); c.className = 'toasted-container top-center'; document.body.appendChild(c) }
  const t = document.createElement('div')
  t.className = `toasted toasted-primary ${type}`
  t.textContent = message
  c.appendChild(t)
  setTimeout(() => t.remove(), 4000)
}
export const toast = {
  show: (m) => show(m, 'default'),
  success: (m) => show(m, 'success'),
  error: (m) => show(m, 'error'),
  info: (m) => show(m, 'info'),
}
