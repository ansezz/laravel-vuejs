<template>
  <template v-if="mounted"><slot/></template>
</template>

<script>
  // Same contract as Nuxt's <no-ssr>/<client-only>: children render in the browser only.
  export default {
    name: 'NoSsr',
    data: () => ({ mounted: false }),
    mounted() { this.mounted = true },
  }
</script>
