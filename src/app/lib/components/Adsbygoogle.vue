<template>
  <ins v-if="adClient" class="adsbygoogle" :style="adStyle"
       :data-ad-client="adClient" :data-ad-slot="adSlot || null" :data-ad-format="adFormat"
       :data-ad-region="region" :key="region"/>
</template>

<script>
  // Port of the @nuxtjs/google-adsense <adsbygoogle> component.
  // Renders nothing unless PUBLIC_GOOGLE_ADSENSE is configured (the Nuxt module behaved the same way).
  const CLIENT = import.meta.env.PUBLIC_GOOGLE_ADSENSE ? 'ca-' + String(import.meta.env.PUBLIC_GOOGLE_ADSENSE).replace(/^ca-/, '') : null

  export default {
    name: 'Adsbygoogle',
    props: {
      adClient: { type: String, default: CLIENT },
      adSlot: String,
      adFormat: { type: String, default: 'auto' },
      adStyle: { type: Object, default: () => ({ display: 'block' }) },
      pageLevelAds: Boolean,
    },
    data: () => ({ region: 'page-0' }),
    mounted() {
      if (!this.adClient) return
      this.region = 'page-' + Math.random()
      this.$nextTick(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch (e) { console.error(e) } })
    },
  }
</script>
