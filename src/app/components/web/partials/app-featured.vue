<template>
    <section class="featured-articles">
        <div class="container">
            <heading>{{title}}</heading>
            <div class="posts-grid">
                <article-item v-for="item in posts"
                              :title="item.title"
                              :image="item.image_url"
                              :description="item.excerpt"
                              :key="item.id"
                              :to="{ name: 'slug', params: { slug: item.slug }}"
                />
            </div>
        </div>
    </section>
</template>

<script>
    import ArticleItem from "@/components/shared/partials/elements/article-item"

    export default {
        name: 'AppFeatured',
        components: {
            ArticleItem
        },
        props: {
            title: {
                type: String,
                default: 'Featured Posts'
            },
            items: {
                type: [Object, Array]
            }
        },
        computed: {
            posts() {
                if (this.items && this.items.length > 0)
                    return this.items

                return this.$store.state.post.featured.data
            },
        },
        data() {
            return {}
        }
    }

</script>

<style lang="stylus" scoped>
    .featured-articles
        position relative
        padding 60px 0

        &:after
            content ""
            height 1px
            width 1040px
            background-color $gray
            position absolute
            bottom 0
            left 50%
            transform translateX(-50%)

    .posts-grid
        display grid
        grid-template-columns repeat(4, 1fr)
        grid-gap 20px 10px
        margin-top 30px
</style>
