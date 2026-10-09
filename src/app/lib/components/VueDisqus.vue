<template>
  <div id="disqus_thread"></div>
</template>

<script>
  // Port of vue-disqus: loads the Disqus embed for the given thread in the browser.
  export default {
    name: 'VueDisqus',
    props: { shortname: { type: String, required: true }, identifier: String, url: String, title: String },
    mounted() {
      const self = this
      window.disqus_config = function () {
        this.page.identifier = self.identifier
        this.page.url = self.url
        this.page.title = self.title
      }
      if (window.DISQUS) return window.DISQUS.reset({ reload: true, config: window.disqus_config })
      const s = document.createElement('script')
      s.src = `https://${this.shortname}.disqus.com/embed.js`
      s.setAttribute('data-timestamp', +new Date())
      s.async = true
      document.body.appendChild(s)
    },
  }
</script>
