<template>
    <div class="companies-grid">
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/rainbow-treecare.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/telemadrid.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/telemadrid.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/beats-electronics.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/rainbow-treecare.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
        <div class="company">
            <div class="avatar">
                <nuxt-link aria-label="Link LV" to="/">
                    <img src="@/assets/images/rainbow-treecare.png" alt="LV">
                </nuxt-link>
            </div>
            <div class="company-info">
                <h5>Beats Electronics</h5>
                <span class="city">Casablanca, Morocco</span>
                <nuxt-link aria-label="Link LV" to="/" class="offers-count">
                    <span>88 Offers</span>
                </nuxt-link>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppCompaniesList'
    }

</script>

<style lang="stylus" scoped>
    .companies-grid
        margin-top 50px
        display grid
        grid-template-columns repeat(2, 1fr)
        grid-gap 20px
        .company
            position relative
            display flex
            align-items center
            padding-bottom 25px
            &:last-child
                padding-bottom 0
            .avatar
                margin-right 10px
                border 1px solid #ebeef2
                width 60px
                height 60px
                border-radius 50%
                display flex
                align-items center
                justify-content center
                img
                   width 40px
                   height 40px
                   object-fit cover
            .company-info
                h5
                    color #384457
                    font-size 16px
                    font-weight 500
                    margin-bottom 3px
                .city
                    font-size 14px
                    color #384457
                    font-weight 500
                .offers-count
                    margin-top 3px
                    display flex
                    align-items center
                    span
                        color #616d82
                        font-size 14px
                        opacity .8
                    &:after
                        display block
                        margin-left 5px
                        width 20px
                        height 20px
                        content ""
                        background-image url('../../../assets/images/icons-next.svg')
</style>
