<template>
    <section class="sidebar">
        <aside class="aside">
            <div class="aside-block">
                <heading>Follow us</heading>
                <div class="widget">
                    <ul class="social-media">
                        <li v-for="(item, index) in social_media" :key="index"
                            :class="item.class">
                            <a :href="item.href"  target="_blank" rel="noreferrer"   aria-label="external link "   >
                                <i class="fa" :class="'fa-' + item.class"/>
                            </a>
                        </li>
                    </ul>
                </div>
                <app-popular-posts/>
                <div class="widget">
                    <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
                </div>
                <app-subscribe-form/>
                <div class="widget last-widget">
                    <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
                </div>
            </div>
        </aside>
    </section>
</template>

<script>
    import AppSubscribeForm from "@/components/web/partials/app-subscribe-form"
    import AppPopularPosts from "@/components/web/partials/app-popular-posts"

    export default {
        name: 'AppAside',
        computed: {
            social_media() {
                return this.$store.state.social_media;
            }
        },
        components: {
            AppSubscribeForm,
            AppPopularPosts
        },
    }
</script>

<style lang="stylus" scoped>
    .sidebar
        width 300px

        .heading
            margin-bottom 30px

        .widget
            margin-bottom 63px

            &.last-widget
                margin-bottom 0

        .social-media
            display flex
            align-items center
            flex-wrap wrap

            li
                padding-right 15px

                a
                    display block
                    width 16px
                    font-size 17px
                    color #311d5a

                &:last-child
                    padding-right 0

        .ads
            width 100%
            height 250px
            display flex
            align-items center
            justify-content center
            background-color #3abbff
            font-size 24px
            color $white
</style>
