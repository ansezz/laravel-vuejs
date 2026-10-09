<template>
    <div class="pricing-container">
        <breadcrumb :pages="breadcrumbsData" />
        <div class="container has-p">
            <div class="row">
                <div class="col-sm-6">
                    <div class="caption">
                        <h1>Get the space you need and so much more.</h1>
                        <p>L&V individual plans are the best way to store, share, and securely access all your files.</p>
                        <nuxt-link aria-label="Link LV" to="/" class="button">Check a plan</nuxt-link>
                        <span>You can cancel or downgrade at any time.</span>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="svg-wrp">
                        <img src="@/assets/images/book.svg" alt="LV">
                    </div>
                </div>
            </div>
        </div>
        <app-pricing-tables />
        <div class="support-container">
            <div class="container">
                <div class="row">
                    <div class="col-sm-6">
                        <div class="caption">
                            <h3>We’re here for you. Get the support you deserve.</h3>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="support-links">
                            <nuxt-link aria-label="Link LV" to="/" class="button has-icon right-icon">
                                <span>Support center</span>
                                <img src="@/assets/images/icons-support.svg" alt="LV">
                            </nuxt-link>
                            <span class="bottom-span">We love you already!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __AppPricingTables from '@/components/web/partials/app-pricing-tables'
export default {
        name: "Pricing",
        components: {
            Breadcrumb: __Breadcrumb,
            AppPricingTables: __AppPricingTables
        },
        data() {
            return {
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'pricing',
                        link: "/"
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .has-p
        padding-top 70px
        padding-bottom 65px
        .row
            display flex
            align-items center
    .caption
        width 400px
        h1
            color #384457
            font-size 28px
            font-weight 500
            margin-bottom 10px
            line-height 1.4
        p
            font-size 18px
            color #616d82
            line-height 28px
            margin-bottom 30px
        span
            color #616d82
            font-size 14px
            opacity .8
            display block
            margin-top 20px
    .svg-wrp
        img
            width 100%
    .support-container
        padding 60px 0
        background-color #384457
        .row
            display flex
            align-items center
        .caption
            width 400px
            h3
                color #FFF
                font-size 28px
                font-weight 400
                line-height 1.4
        .support-links
            text-align center
            .button
                span
                    padding-top 2px
            .bottom-span
                color #FFF
                display block
                font-size 14px
                opacity .8
                margin-top 20px
</style>
