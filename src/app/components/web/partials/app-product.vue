<template>
    <div class="products-grid">
        <div class="product">
            <div class="left-area">
                <thumbnail />
            </div>
            <div class="right-area">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <span>24 JUL 2018</span>
                <div class="actions">
                    <nuxt-link aria-label="Link LV" to="/" class="button">Details</nuxt-link>
                    <nuxt-link aria-label="Link LV" to="/" class="button inverse-button">Preview</nuxt-link>
                </div>
            </div>
        </div>
        <div class="product">
            <div class="left-area">
                <thumbnail />
            </div>
            <div class="right-area">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <span>24 JUL 2018</span>
                <div class="actions">
                    <nuxt-link aria-label="Link LV" to="/" class="button">Details</nuxt-link>
                    <nuxt-link aria-label="Link LV" to="/" class="button inverse-button">Preview</nuxt-link>
                </div>
            </div>
        </div>
        <div class="product">
            <div class="left-area">
                <thumbnail />
            </div>
            <div class="right-area">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <span>24 JUL 2018</span>
                <div class="actions">
                    <nuxt-link aria-label="Link LV" to="/" class="button">Details</nuxt-link>
                    <nuxt-link aria-label="Link LV" to="/" class="button inverse-button">Preview</nuxt-link>
                </div>
            </div>
        </div>
        <div class="product">
            <div class="left-area">
                <thumbnail />
            </div>
            <div class="right-area">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <span>24 JUL 2018</span>
                <div class="actions">
                    <nuxt-link aria-label="Link LV" to="/" class="button">Details</nuxt-link>
                    <nuxt-link aria-label="Link LV" to="/" class="button inverse-button">Preview</nuxt-link>
                </div>
            </div>
        </div>
        <div class="product">
            <div class="left-area">
                <thumbnail />
            </div>
            <div class="right-area">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <span>24 JUL 2018</span>
                <div class="actions">
                    <nuxt-link aria-label="Link LV" to="/" class="button">Details</nuxt-link>
                    <nuxt-link aria-label="Link LV" to="/" class="button inverse-button">Preview</nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppProduct'
    }

</script>

<style lang="stylus" scoped>
    .products-grid
        display grid
        grid-gap 20px
    .product
        border 2px solid #ebeef2
        padding 20px
        display flex
        align-items center
    .left-area
        width 310px
        height 167px
        padding-right 20px
        .article-image
            height 100%
    h5
        font-size 16px
        color #384457
        font-weight 500
        margin-bottom 10px
    h6
        font-size 16px
        font-weight bold
        color $secondary
        margin-bottom 10px
    span
        color #616d82
        font-size 14px
        opacity .8
    .actions
        margin-top 20px
        display flex
        justify-content space-between
</style>
