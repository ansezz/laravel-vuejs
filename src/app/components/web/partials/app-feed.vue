<template>
  <section class="feed">
    <heading>Latest Posts</heading>
    <div class="articles-list">
      <template v-for="(item, index) in posts" :key="item.id">
        <article-item :title="item.title"
                      :image="item.image_url"
                      :description="item.excerpt"
                     
                      :to="{ name: 'slug', params: { slug: item.slug }}"
        />
      </template>
    </div>

    <div class="text-center show-more">
      <nuxt-link aria-label="Link LV" :to="{name : 'posts'}" class="button">Show more Posts</nuxt-link>
    </div>

    <adsbygoogle class="adsbygoogle" :pageLevelAds="true"/>
  </section>
</template>

<script>
  export default {
    name: 'AppFeed',
    components: {
    },
    data() {
      return {}
    },
    methods: {
      changePage(page) {
        this.$router.push({name: 'posts', query: {page: page}})
      },
    },
    computed: {
      posts() {
        return this.$store.state.post.posts.data
      },
      paginator() {
        return this.$store.state.post.posts.paginatorInfo
      },
    },
    mounted() {
    },
  }
</script>

<style lang="stylus" scoped>
  .show-more
    padding-top 30px
  .feed
    width calc(100% - 300px)
    padding-right 20px

  .articles-list
    display grid
    grid-template-columns repeat(2, 1fr)
    grid-gap 20px
    margin-top 30px

  .post
    &:nth-child(1)
      width calc(100% + 97px)
      grid-row span 2
      & >>>
        .article-image
          height 240px


    &:nth-child(2)
    &:nth-child(3)
      margin-left auto
      width calc(100% - 97px)

      >>> .article-main
        .article-title
          font-size 16px

    &:nth-child(n + 4)
      >>> .article-image
        height 188px
</style>
