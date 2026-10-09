<template>
    <div>
        <heading>Popular Posts</heading>
        <div class="widget">
          <article-item v-for="item in popular"
                        :title="item.title"
                        :image="item.image_url"
                        :description="item.excerpt"
                        :key="item.id"
                        :to="{ name: 'slug', params: { slug: item.slug }}"
                        horizontal
          />
        </div>
    </div>
</template>

<script>
    import ArticleItem from "@/components/shared/partials/elements/article-item"
    export default {
        name: 'AppPopularPosts',
        components: {
            ArticleItem
        },
      computed: {
        popular() {
          return this.$store.state.post.popular.data
        },
      },
    }
</script>

<style lang="stylus" scoped>
    .heading
        margin-bottom 30px
    .widget
        margin-bottom 63px
        &.last-widget
            margin-bottom 0
</style>
