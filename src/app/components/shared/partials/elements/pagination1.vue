<template>
    <div class="pagination-container">
        <ul class="app-pagination">
            <li class="pagination-link">
                <nuxt-link aria-label="Link LV" to="/">
                  <i class="fa fa-caret-left"></i><i class="fa fa-caret-left"></i>
                </nuxt-link>
            </li>
            <li class="pagination-link">
                <nuxt-link aria-label="Link LV" to="/"><i class="fa fa-caret-left"></i></nuxt-link>
            </li>
            <li class="current-link">
                <nuxt-link aria-label="Link LV" to="/">1</nuxt-link>
            </li>
            <li>
                <nuxt-link aria-label="Link LV" to="/">2</nuxt-link>
            </li>
            <li>
                <nuxt-link aria-label="Link LV" to="/">3</nuxt-link>
            </li>
            <li>
                <nuxt-link aria-label="Link LV" to="/">..</nuxt-link>
            </li>
            <li>
                <nuxt-link aria-label="Link LV" to="/">15</nuxt-link>
            </li>
            <li class="pagination-link">
                <nuxt-link aria-label="Link LV" to="/"><i class="fa fa-caret-right"></i></nuxt-link>
            </li>
            <li class="pagination-link">
                <nuxt-link aria-label="Link LV" to="/">
                  <i class="fa fa-caret-right"></i><i class="fa fa-caret-right"></i>
                </nuxt-link>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "pagination"
    }

</script>

<style lang="stylus" scoped>
    .pagination-container
        margin-top 40px
    .app-pagination
        display flex
        align-items center
        justify-content center
        li
            padding-right 20px
            a
                display flex
                align-items center
                justify-content center
                width 40px
                height 40px
                font-size 12px
                font-weight 600
                color $secondary
                transition all .35s ease-in-out
                &:hover
                    background-color $primary
            &.pagination-link
                a
                    background-color rgba($secondary, .03)
            &.current-link
                a
                    background-color $primary
            &:last-child
                padding-right 0
</style>
