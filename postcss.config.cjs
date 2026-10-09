// PostCSS setup. Same plugins as nuxt.config.js build.postcss (postcss-rtl, lost), plus two
// compatibility steps that keep Vue 2 scoped-CSS behaviour under Vue 3. They run before
// Vue's scoped-CSS transform:
//  1. `>>>` deep combinator (written in the Stylus blocks): `.a >>> .b .c` -> `.a :deep(.b .c)`,
//     which yields the same `.a[data-v-x] .b .c` vue-loader produced. vue-loader only rewrote the
//     first `>>>` of a selector; a second one stayed in the CSS, the selector was invalid and the
//     browser dropped the whole rule. Such rules are removed here so the result looks the same.
//  2. Slot content: Vue 2 also stamped a component's scope id on the content passed into its
//     <slot>, so a component's scoped styles reached that content (forms, grids, headings...).
//     Vue 3 needs `:slotted()` for that, so every scoped rule of a component that renders a
//     <slot> gets a `:slotted()` twin (the Vite plugin `vue2-slotted-scope` turns slot
//     attributes on for those components).
const fs = require('node:fs')

function toDeep(sel) {
  sel = sel.replace(/\s*>>>\s*$/, '').trim() // `.a h1 >>>` -> `.a h1[data-v-x]`
  const i = sel.indexOf('>>>')
  if (i === -1) return sel
  const left = sel.slice(0, i).trim(), right = sel.slice(i + 3).replace(/\s*>>>\s*/g, ' ').trim()
  return `${left} :deep(${right})`
}

// split "prefix last" at the last top-level combinator
function splitLast(sel) {
  let depth = 0, cut = -1
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i]
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth--
    else if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) cut = i
  }
  return [sel.slice(0, cut + 1), sel.slice(cut + 1)]
}
function toSlotted(sel) {
  if (/:deep\(|:slotted\(|:global\(|::v-|^(from|to|\d+%)$/.test(sel)) return null
  const [prefix, last] = splitLast(sel.trim())
  if (!last || /^[\d.%]+$/.test(last)) return null
  // pseudo classes / elements stay outside of :slotted()
  let depth = 0, p = -1
  for (let i = 0; i < last.length; i++) { const ch = last[i]; if (ch === '[' || ch === '(') depth++; else if (ch === ']' || ch === ')') depth--; else if (ch === ':' && depth === 0) { p = i; break } }
  const base = p === -1 ? last : last.slice(0, p), pseudo = p === -1 ? '' : last.slice(p)
  if (!base) return null
  return `${prefix}:slotted(${base})${pseudo}`
}

const slotCache = new Map()
function rendersSlot(from) {
  if (!from || !from.includes('.vue') || !/[?&]scoped/.test(from)) return false
  const file = from.split('?')[0]
  if (!slotCache.has(file)) {
    let src = ''; try { src = fs.readFileSync(file, 'utf8') } catch {}
    const tpl = (src.match(/<template[^>]*>([\s\S]*)<\/template>/) || [])[1] || ''
    slotCache.set(file, /<slot[\s/>]/.test(tpl))
  }
  return slotCache.get(file)
}

const vue2Compat = () => ({
  postcssPlugin: 'vue2-scoped-compat',
  Once(root, { result }) {
    const slotted = rendersSlot(result.opts.from || root.source?.input?.file)
    root.walkRules((rule) => {
      if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return
      if (rule.selector.includes('>>>')) {
        // nested `& >>>` blocks give `.a >>> >>> b`, which vue-loader read as a single combinator
        rule.selector = rule.selector.replace(/>>>(\s*>>>)+/g, '>>>')
        if (rule.selectors.some(sel => (sel.match(/>>>/g) || []).length > 1)) { rule.remove(); return }
        rule.selector = rule.selectors.map(toDeep).join(', ')
      }
      if (slotted) {
        const twins = rule.selectors.map(toSlotted).filter(Boolean)
        if (twins.length) rule.selectors = [...rule.selectors, ...twins]
      }
    })
  },
})
vue2Compat.postcss = true

module.exports = {
  plugins: [vue2Compat(), require('postcss-rtl')({}), require('lost')({})],
}
