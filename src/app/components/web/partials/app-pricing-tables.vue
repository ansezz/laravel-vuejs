<template>
    <section class="pricing-tables-container">
        <div class="container">
            <div class="title">
                <h2>Choose the right L&V for you.</h2>
            </div>
            <div class="pricing-tables">
                <div class="pricing-table">
                    <div class="pricing-table-header">
                        <h5>Basic</h5>
                        <div class="options">
                            <h6>Free</h6>
                        </div>
                        <p>Free storage and access to files across multiple devices.</p>
                        <nuxt-link aria-label="Link LV" to="/" class="button">Sign up/in</nuxt-link>
                    </div>
                    <div class="pricing-table-body">
                        <ul>
                            <li><span>2 GB of space</span></li>
                            <li><span>Sync files across devices</span></li>
                            <li><span>Shared folders and links</span></li>
                            <li><span>Dropbox Paper</span></li>
                        </ul>
                    </div>
                </div>
                <div class="pricing-table">
                    <div class="pricing-table-header">
                        <h5>Medium</h5>
                        <div class="options">
                            <h6>9.99</h6>
                            <span>Monthly</span>
                        </div>
                        <p>Additional storage space and expanded access.</p>
                        <nuxt-link aria-label="Link LV" to="/" class="button">Purchase now</nuxt-link>
                    </div>
                    <div class="pricing-table-body">
                        <ul>
                            <li class="bold-item"><span>Everything in Basic</span></li>
                            <li><span>1 TB (1,000 GB) of space</span></li>
                            <li><span>Offline file access</span></li>
                            <li><span>Remote device wipe</span></li>
                            <li><span>Priority email support</span></li>
                        </ul>
                    </div>
                </div>
                <div class="pricing-table">
                    <div class="pricing-table-header">
                        <h5>Professional</h5>
                        <div class="options">
                            <nuxt-link aria-label="Link LV" to="/">
                                <span>Contact support</span>
                            </nuxt-link>
                        </div>
                        <p>Additional space and powerful work tools for business professionals.</p>
                    </div>
                    <div class="pricing-table-body">
                        <ul>
                            <li class="bold-item"><span>Everything in Plus</span></li>
                            <li><span>2 TB (2,000 GB) of space</span></li>
                            <li><span>Smart Sync: Save hard disk space</span></li>
                            <li><span>Showcase: Present and track your work</span></li>
                            <li><span>Shared link controls</span></li>
                            <li><span>Full-text search</span></li>
                            <li><span>120-day version history</span></li>
                            <li><span>Priority chat support</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
  export default {
    name: 'AppPricingTables'
  }
</script>

<style lang="stylus" scoped>
    .pricing-tables-container
        border-top 2px solid #ebeef2
        padding-top 90px
        padding-bottom 60px
    .title
        margin-bottom 30px
        h2
            color #384457
            font-size 28px
            font-weight 500
            line-height 1.4
    .pricing-tables
        display grid
        grid-template-columns repeat(3, 1fr)
        grid-gap 20px
    .pricing-table-header
        padding 30px 0
        border-top 5px solid $primary
        border-bottom 1px solid #ebeef2
        height 288px
        h5
            color #384457
            font-size 24px
            font-weight 400
            margin-bottom 10px
        .options
            height 30px
            display flex
            align-items center
            h6
                height 100%
                padding 4px 20px
                background-color rgba($secondary, .1)
                display flex
                align-items center
                justify-content center
                font-size 16px
                font-weight 700
                color $secondary
                margin-right 10px
            span
                color #616d82
                font-size 14px
                opacity .8
            a
                display flex
                align-items center
                &:after
                    display block
                    margin-left 10px
                    width 20px
                    height 20px
                    content ""
                    background-image url('../../../assets/images/icons-next.svg')
        p
            color #616d82
            font-size 18px
            line-height 28px
            padding 30px 0
            margin-bottom 0
    .pricing-table-body
        padding 30px 0 0
        ul
            li
                display flex
                align-items center
                span
                    color #616d82
                    font-size 16px
                    line-height 30px
                &:before
                    margin-right 10px
                    width 20px
                    height 20px
                    content ""
                    background-image url('../../../assets/images/icons-check.svg')
                &.bold-item
                    span
                        font-weight 600
</style>
