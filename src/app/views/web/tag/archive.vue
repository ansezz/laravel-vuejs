<!--waiting designer-->
<template>
  <section class="posts-container">
    <breadcrumb :pages="breadcrumbsData()"/>
    <div class="container">
      <div class="post-heading-filters">
        <div class="post-heading">
          <div class="user-avatar">
            <i class="fa fa-folder-o"></i>
          </div>
          <h1 v-if="tag" v-html="tag.name"></h1>
        </div>
        <filters route-name="tag-slug"></filters>
      </div>

      <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>

      <div class="article-grid">
        <article-item v-for="item in postsByTag.data"
                      :title="item.title"
                      :image="item.image_url"
                      :description="item.excerpt"
                      :key="item.id"
                      :to="{ name: 'slug', params: { slug: item.slug }}"
        />
      </div>

      <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>

      <div class="text-center">
        <button @click="showMore()" class="button"
                v-if="hasMorePages && !show_more">
          {{ loading ? 'Loading ...' : 'Show more'}}
        </button>
      </div>
      <no-ssr>
        <infinite-loading @infinite="showMore"
                          v-if="show_more" class="show-more"></infinite-loading>
      </no-ssr>
    </div>
  </section>
</template>

<script>
  import __filters from '@/components/shared/partials/elements/filters'
  import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
  import __ArticleItem from '@/components/shared/partials/elements/article-item'
  import { queryPosts } from '@/lib/posts-api.js'

  // Was an Apollo smart query (postsByTag); now reads the pre-rendered first page from the store
  // and paginates the static /api/posts.json index in the browser.
  export default {
    components: {
      filters: __filters,
      Breadcrumb: __Breadcrumb,
      ArticleItem: __ArticleItem
    },
    name: "tag-posts",
    computed: {
      tag() {
        return this.$store.state.tag.tag
      },
      hasMorePages() {
        return this.postsByTag && this.postsByTag.paginatorInfo && this.postsByTag.paginatorInfo.hasMorePages;
      }
    },
    mounted() {
      // The first page (latest, 12 posts) is pre-rendered; filters coming from the
      // query string (?count=&sort_by=&s=) are applied in the browser.
      const q = this.$route.query
      if (q.count || q.sort_by || q.s) {
        this.loading = true
        queryPosts(this.variables()).then((result) => { this.postsByTag = result }).finally(() => { this.loading = false })
      }
    },
    methods: {
      variables() {
        return {
          count: this.$route.query.count ?? 12,
          sort_by: this.$route.query.sort_by ?? 'latest',
          s: this.$route.query.s,
          tag: this.$route.params.slug
        }
      },
      showMore($state) {
        if (!this.hasMorePages || this.loading) {
          return true
        }

        this.page++
        this.loading = true

        queryPosts({...this.variables(), page: this.page}).then((fetchMoreResult) => {
          if ($state) {
            if (fetchMoreResult.paginatorInfo.hasMorePages)
              $state.loaded();
            else
              $state.complete();
          }

          this.show_more = true;
          this.postsByTag = {
            data: [...this.postsByTag.data, ...fetchMoreResult.data],
            paginatorInfo: fetchMoreResult.paginatorInfo
          };
        }).finally(() => {
          this.loading = false
        })
      }
    },
    data() {
      return {
        postsByTag: this.$store.state.tag.posts,
        loading: false,
        show_more: false,
        page: 1,
        breadcrumbsData: () => [
          {
            name: 'Home',
            link: "/"
          },
          {
            name: 'Tag'
          },
          {
            name: this.tag.name
          }
        ]
      }
    }
  }

</script>

<style lang="stylus" scoped>
    .posts-container
        padding-bottom 120px

    .post-heading-filters
        position relative
        height 60px
        display flex
        align-items center
        justify-content space-between
        margin 60px 0 40px

    .post-heading
        text-align center

        h1
            font-size 28px
            font-weight 600
            color $tertiary
            margin-top 10px
            line-height 1
        .fa
          font-size 20px
          color $secondary
          margin-top 5px

    .filters
        display flex
        align-items center

        .filter-group
            position relative
            margin-right 45px

            &:after
                content "\f0d7"
                font-family "FontAwesome"
                color $secondary
                padding-left 15px

            &:last-child
                margin-right 0

            select
                font-size 12px
                font-weight 600
                letter-spacing 2px
                color $secondary
                text-transform uppercase
                border 0
                background-color transparent
                outline none
                -webkit-appearance none
                -moz-appearance none
                appearance none

    .article-grid
        display grid
        grid-template-columns repeat(4, 1fr)
        grid-gap 40px 10px

    .ads
        width 900px
        height 250px
        display flex
        align-items center
        justify-content center
        background-color #3abbff
        font-size 24px
        color $white
        margin 60px auto

    .text-center,
    .show-more
      padding-top 40px
</style>
