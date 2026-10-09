<template>
    <section class="posts-container">
        <breadcrumb :pages="breadcrumbsData"/>
        <div class="container">
            <div class="post-heading-filters">
                <div class="post-heading">
                    <div class="user-avatar">
                      <i class="fa fa-folder-o"></i>
                    </div>
                    <h1>Posts</h1>
                </div>
                <filters route-name="posts"></filters>
            </div>
          <adsbygoogle class="adsbygoogle" :pageLevelAds="true" />
          <div class="article-grid">
              <template v-for="(item, key) in posts.data" :key="key">
                    <article-item :title="item.title"
                                  :image="item.image_url"
                                  :description="item.excerpt"
                                 
                                  :to="{ name: 'slug', params: { slug: item.slug }}"
                    />
                </template>
            </div>
            <adsbygoogle class="adsbygoogle" :pageLevelAds="true" />
            <div class="text-center">
                <button @click="showMore()"
                        v-if="hasMorePages && !show_more" class="button">
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

  // Was an Apollo smart query (posts); now reads the pre-rendered first page from the store
  // and paginates the static /api/posts.json index in the browser.
  export default {
    components: {
      filters: __filters,
      Breadcrumb: __Breadcrumb,
      ArticleItem: __ArticleItem
    },
    name: "posts",
    computed: {
      hasMorePages() {
        return this.posts && this.posts.paginatorInfo && this.posts.paginatorInfo.hasMorePages;
      }
    },
    mounted() {
      // The first page (latest, 12 posts) is pre-rendered; filters coming from the
      // query string (?count=&sort_by=&s=) are applied in the browser.
      const q = this.$route.query
      if (q.count || q.sort_by || q.s) {
        this.loading = true
        queryPosts(this.variables()).then((result) => { this.posts = result }).finally(() => { this.loading = false })
      }
    },
    methods: {
      variables() {
        return {
          count: this.$route.query.count ?? 12,
          sort_by: this.$route.query.sort_by ?? 'latest',
          s: this.$route.query.s,
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
          this.posts = {
            data: [...this.posts.data, ...fetchMoreResult.data],
            paginatorInfo: fetchMoreResult.paginatorInfo
          };
        }).finally(() => {
          this.loading = false
        })
      }
    },
    data() {
      return {
        posts: this.$store.state.post.posts,
        loading: false,
        show_more: false,
        page: 1,
        breadcrumbsData: [
          {
            name: 'Home',
            link: "/"
          },
          {
            name: 'Posts',
            link: "/posts"
          }
        ]
      }
    }
  }

</script>

<style lang="stylus" scoped>
    .text-center,
    .show-more
      padding-top 40px

    .posts-container
        padding-bottom 120px

    .post-heading-filters
        position relative
        overflow hidden
        display flex
        align-items center
        justify-content space-between
        margin 60px 0 40px

    .post-heading
        text-align center
        display flex
        align-items center

        h1
            font-size 28px
            font-weight 600
            color $tertiary
            line-height 1
            margin-left 10px
        .fa
          font-size 20px
          color $secondary
          margin-top 5px

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
        background-color transparent
        font-size 24px
        color $white
        margin 60px auto

    .adsbygoogle
        margin 15px 0

</style>
