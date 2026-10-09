<template>
  <component :is="tag" :class="$attrs.class"><slot :share="share" :link="link"/></component>
</template>

<script>
  // Replacement for vue-social-sharing's `inline-template` usage (removed in Vue 3).
  // Each <network> child renders a link that opens the network's share dialog.
  const networks = {
    email: 'mailto:?subject=@title&body=@url%0D%0A%0D%0A@description',
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=@url&title=@title&description=@description&quote=@quote&hashtag=@hashtags',
    linkedin: 'https://www.linkedin.com/shareArticle?mini=true&url=@url&title=@title&summary=@description',
    odnoklassniki: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=@url&st.comments=@description',
    pinterest: 'https://pinterest.com/pin/create/button/?url=@url&media=@media&description=@title',
    reddit: 'https://www.reddit.com/submit?url=@url&title=@title',
    skype: 'https://web.skype.com/share?url=@description%0D%0A@url',
    sms: 'sms:?body=@url%20@description',
    telegram: 'https://t.me/share/url?url=@url&text=@description',
    twitter: 'https://twitter.com/intent/tweet?text=@title&url=@url&hashtags=@hashtags@twitteruser',
    vk: 'https://vk.com/share.php?url=@url&title=@title&description=@description&image=@media&noparse=true',
    weibo: 'http://service.weibo.com/share/share.php?url=@url&title=@title&pic=@media',
    whatsapp: 'https://api.whatsapp.com/send?text=@description%0D%0A@url',
  }

  export default {
    name: 'SocialSharing',
    inheritAttrs: false,
    props: {
      url: { type: String, default: '' }, title: { type: String, default: '' }, description: { type: String, default: '' },
      quote: { type: String, default: '' }, hashtags: { type: String, default: '' }, twitterUser: { type: String, default: '' },
      media: { type: String, default: '' }, networkTag: { type: String, default: 'span' }, tag: { type: String, default: 'div' },
    },
    provide() { return { socialSharing: this } },
    methods: {
      link(network) {
        const e = encodeURIComponent
        return (networks[network] || '#')
          .replace(/@url/g, e(this.url)).replace(/@title/g, e(this.title)).replace(/@description/g, e(this.description))
          .replace(/@quote/g, e(this.quote)).replace(/@hashtags/g, e(this.hashtags)).replace(/@media/g, e(this.media))
          .replace(/@twitteruser/g, this.twitterUser ? '&via=' + e(this.twitterUser) : '')
      },
      share(network) {
        const href = this.link(network)
        if (/^(mailto|sms):/.test(href)) { window.location.href = href; return }
        window.open(href, 'sharer', 'width=626,height=436,menubar=no,toolbar=no')
      },
    },
  }
</script>
