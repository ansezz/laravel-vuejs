<!--laravelvuejs_Home_M.png-->
<template>
  <section>
    <app-header/>
    <div class="container">
      <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
    </div>
    <app-featured/>
    <div class="container">
      <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
    </div>
    <div class="main-posts">
      <div class="container">
        <div class="posts-wrapper">
          <app-feed/>
          <app-aside/>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import __AppHeader from '@/components/web/partials/app-header'
import __AppFeatured from '@/components/web/partials/app-featured'
import __AppFeed from '@/components/web/partials/app-feed'
import __AppAside from '@/components/web/partials/app-aside'
export default {
    name: 'index',
    components: {
      AppHeader: __AppHeader,
      AppFeatured: __AppFeatured,
      AppFeed: __AppFeed,
      AppAside: __AppAside,
    },
    data() {
      return {}
    }
  }

</script>

<style lang="stylus" scoped>
  .main-posts
    padding 60px 0 80px

  .posts-wrapper
    display flex
    justify-content space-between
</style>
