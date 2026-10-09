// v-lazy: port of vue-lazyload (preLoad 1.3, attempt 1). Sets the `lazy` attribute to
// loading|loaded|error exactly like the plugin did, because the thumbnail CSS depends on it.
const preLoad = 1.3
let observer
function load(el) {
  const src = el.dataset.src
  if (!src) return
  const img = new Image()
  img.onload = () => { el.src = src; el.setAttribute('lazy', 'loaded') }
  img.onerror = () => el.setAttribute('lazy', 'error')
  img.src = src
}
function observe(el) {
  if (!('IntersectionObserver' in window)) return load(el)
  observer = observer || new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { observer.unobserve(e.target); load(e.target) } })
  }, { rootMargin: `${Math.round((preLoad - 1) * 100)}% 0px` })
  observer.observe(el)
}

export const lazy = {
  getSSRProps(binding) { return binding.value ? { 'data-src': binding.value, lazy: 'loading' } : { lazy: 'error' } },
  mounted(el, binding) {
    if (!binding.value) return el.setAttribute('lazy', 'error')
    el.dataset.src = binding.value
    if (el.getAttribute('lazy') !== 'loaded') { el.setAttribute('lazy', 'loading'); observe(el) }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) { el.dataset.src = binding.value; el.setAttribute('lazy', 'loading'); observe(el) }
  },
}

// v-swiper:instanceName="options": port of the vue-awesome-swiper SSR directive (Swiper 4).
export const swiper = {
  getSSRProps() { return {} },
  async mounted(el, binding) {
    const { default: Swiper } = await import('swiper/dist/js/swiper.esm.bundle.js')
    const instance = new Swiper(el, binding.value)
    el.__swiper = instance
    if (binding.arg && binding.instance) binding.instance[binding.arg] = instance
  },
  beforeUnmount(el) { el.__swiper && el.__swiper.destroy && el.__swiper.destroy(true, false) },
}

// v-validate: vee-validate v2 was registered but its error bag was never shown
// (the components override `errors` with null), so the directive is a no-op.
export const validate = { getSSRProps() { return {} } }
