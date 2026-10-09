<template>
    <section class="app-header">
        <div class="container">
          <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
            <div class="app-header-flexed">
                <app-articles-swiper :class="loggedIn ? 'full-width' : '' "/>
                <app-sign-up-form v-if="!loggedIn" />
            </div>
        </div>
    </section>
</template>

<script>
    import {mapActions} from 'vuex'
    import AppArticlesSwiper from "@/components/web/partials/app-articles-swiper"
    import AppSignUpForm from "@/components/web/partials/app-sign-up-form"
    export default {
        name: 'AppHeader',
        components: {
            AppArticlesSwiper,
            AppSignUpForm
        },
        data() {
            return {
              loggedIn: this.$store.state.auth.loggedIn
            }
        }
    }

</script>

<style lang="stylus" scoped>
  .app-header
      background-color $tertiary
      padding 15px 0
      .app-header-flexed
          display flex
          justify-content space-between
  .articles-swiper
    &.full-width
      width 100%
      & >>>
        .swiper-wrapper
          width calc(100% - 35px)
</style>
