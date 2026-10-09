<template>
    <div class="error-page">
        <div class="error-thumb">
            <img src="@/assets/images/404.png" alt="LV">
        </div>
        <div class="error-body">
            <!--@TODO : Show error only oin dev env-->
            <!--<pre>{{error}}</pre>-->
            <h1 v-if="error.statusCode === 404">
            <span v-if="error.message">
              {{error.message}}
            </span>
              <span v-else>Mate, page not found!</span>
            </h1>
            <h1 v-else>An error occurred</h1>
            <p>You might not have permissions to see this page or isn’t exists anymore.</p>
            <nuxt-link aria-label="Link LV" to="/page/contact-us" class="button has-icon">
                <img src="@/assets/images/icons-report.svg" alt="LV">
                <span>report this to our team</span>
            </nuxt-link>
        </div>
        <div class="container">
          <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
        </div>
      <app-featured/>
    </div>
</template>

<script>
import __AppFeatured from '@/components/web/partials/app-featured'
export default {
    props: ['error'],
    beforeMount(){
      this.$store.dispatch("post/LOAD_FEATURED_POSTS")
    },
    layout: ({store}) => store.state.platform,
    components: {
      AppFeatured: __AppFeatured
    }
  }
</script>

<style lang="stylus" scoped>
    .error-page
        padding 120px 0
        @media (max-width 768px)
          padding 60px 20px

        .error-thumb
            text-align center
            margin-bottom 60px
            @media (max-width 768px)
              margin-bottom 30px

        .error-body
            text-align center
            width 460px
            margin auto
            @media (max-width 768px)
              width 100%

            h1
                color $tertiary
                font-size 28px
                font-weight 600
                margin-bottom 10px
                line-height 1.4

            p
                font-size 14px
                color #616d82
                opacity .8
                margin-bottom 40px

            .button
                width 280px
                margin auto
</style>
