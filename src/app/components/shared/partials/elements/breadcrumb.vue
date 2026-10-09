<template>
    <nav class="breadcrumbs">
        <ul class="breadcrumb-list">
           <li :class="{'is-active' : pages.length === index + 1}" v-for="(page,index) in pages" class="breadcrumb-item">
                <nuxt-link aria-label="Link LV" v-if="page.link" :to="page.link" class="breadcrumb-anchor" v-html="page.name"></nuxt-link>
                <a v-else class="breadcrumb-anchor" v-html="page.name"></a>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: "breadcrumb",
    props: ["pages"]
}
</script>

<style lang="stylus" scoped>
    .breadcrumbs
        margin 20px 0 0

    .breadcrumb-list
        display flex
        align-items center
        justify-content center

    .breadcrumb-item
        display flex
        align-items center
        &:not(:last-child):after
          display block
          margin 0 5px
          width 20px
          height 20px
          content ""
          background-image url('../../../../assets/images/icons-next.svg')
          @media (max-width: 768px)
            content "\f105"
            font-family "FontAwesome"
            background-image none
            width auto
            margin 0 10px
            color $secondary

    &.is-active .breadcrumb-anchor
        font-weight bold

    .breadcrumb-anchor
        color $secondary
        font-size 12px
        opacity .9
</style>
