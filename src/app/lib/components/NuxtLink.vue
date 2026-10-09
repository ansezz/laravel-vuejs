<template>
  <a v-if="innerHTML != null" :href="href" :class="classes" v-html="innerHTML"></a>
  <a v-else :href="href" :class="classes"><slot/></a>
</template>

<script>
  // <nuxt-link> replacement: a plain <a> with vue-router's active classes.
  import { resolve } from '../router.js'

  export default {
    name: 'NuxtLink',
    props: {
      to: { type: [String, Object], default: '/' },
      // `<nuxt-link v-html="...">` (used by the breadcrumb) arrives here as a prop in Vue 3
      innerHTML: { type: String, default: null },
    },
    computed: {
      href() { return resolve(this.to) },
      current() { return this.$store.state.route.path },
      exact() { return this.href.split('?')[0] === this.current },
      active() { const p = this.href.split('?')[0]; return this.exact || (p !== '/' && this.current.startsWith(p + '/')) },
      classes() { return { 'nuxt-link-active': this.active, 'nuxt-link-exact-active': this.exact } },
    },
  }
</script>
