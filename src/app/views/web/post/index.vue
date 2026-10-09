<template>
    <section class="posts-container">
        <breadcrumb v-if="post" :pages="breadcrumbsData()"/>
        <div class="container" v-if="post">
            <div class="single-page-header is-flex">
                <div class="author is-flex" v-if="post.user">
                    <div class="img-wrp">
                        <img src="@/assets/images/brackets.png" alt="LV">
                    </div>
                    <h5 class="name">{{post.user.name}}</h5>
                    <!--<span class="role">Collaborator</span>-->
                </div>
                <div class="category is-flex" v-if="post.categories[0]">
                    <i class="fa fa-folder-o"></i>
                    <h1 v-html="post.categories[0].name"></h1>
                </div>
                <div class="date-time">
                    <i class="fa fa-clock-o"></i>
                    <span>{{post.time_ago}}</span>
                </div>
            </div>
          <adsbygoogle  class="adsbygoogle container" :pageLevelAds="true" />
        </div>
        <div class="single-post-container">
            <div class="post-content">
                <h1 class="text-center" v-html="post.title"></h1>
                <p v-html="post.excerpt"></p>
                <div class="image-container" v-if="ready">
                    <social-sharing :url="seo.url"
                                    :title="seo.title"
                                    :description="seo.description"
                                    :media="seo.image"
                                    :hashtags="hashTags"
                                    twitter-user="laravelvuejs"
                                    network-tag="li"
                                    tag="ul" class="share-links">
                            <network network="facebook">
                                <a href="#" class="facebook">
                                  <i class="fa fa-facebook"></i>
                                    <span>Facebook</span>
                                </a>
                            </network>
                            <network network="whatsapp">
                                <a href="#" class="whatsapp">
                                  <i class="fa fa-whatsapp"></i>
                                    <span>WhatsApp</span>
                                </a>
                            </network>
                            <network network="twitter">
                                <a href="#" class="twitter">
                                    <i class="fa fa-twitter"></i>
                                    <span>Twitter</span>
                                </a>
                            </network>
                    </social-sharing>
                    <div class="thumbnail-area">
                        <thumbnail :src="post.image_url" :alt="post.title" :to="{ name: 'slug', params: { slug: $route.params.slug }}"/>
                        <!--<span class="copyright">&copy; 2018. Copyrights</span>-->
                    </div>
                    <ul class="actions-list">
                        <!--<li><a href="#"><img src="@/assets/images/zoom-in-colored.svg" alt="LV"></a></li>-->
                        <!--<li class="m-b-40"><a href="#"><img src="@/assets/images/zoom-out.svg" alt="LV"></a></li>-->
                        <!-- <li><a href="#"><img src="@/assets/images/icons-star-2.svg" alt="LV"></a></li> -->
                    </ul>
                </div>
                <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
                <div class="grid-container">
                    <div class="grid-articles">
                        <template v-for="(item, key) in related.first" :key="key">
                            <article-item :title="item.title"
                                          :image="item.image_url"
                                         
                                          :to="{ name: 'slug', params: { slug: item.slug }}"
                                          horizontal
                            />
                        </template>
                    </div>
                </div>
                <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
                <div v-html="post.content" id="content"></div>
                <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
                <div class="grid-container">
                    <div class="grid-articles">
                        <template v-for="(item, key) in related.second" :key="key">
                            <article-item :title="item.title"
                                          :image="item.image_url"
                                         
                                          :to="{ name: 'slug', params: { slug: item.slug }}"
                                          horizontal
                            />
                        </template>
                    </div>
                </div>
              <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
              <h4>Tags : </h4>
                <br>
                <div class="tags">
                    <nuxt-link aria-label="Link LV" v-for="tag in post.tags" :key="tag.id" :to="{name: 'tag-slug', params : {slug : tag.slug}}" >
                        {{tag.name}}
                    </nuxt-link>
                </div>
                <div v-if="ready">
                    <social-sharing :url="seo.url"
                                    :title="seo.title"
                                    :description="seo.description"
                                    :media="seo.image"
                                    :hashtags="hashTags"
                                    twitter-user="laravelvuejs"
                                    class="share-links is-flex">
                            <network network="email">
                                <i class="fa fa-envelope"></i>
                            </network>
                            <network network="facebook">
                                <i class="fa fa-facebook"></i>
                            </network>
                            <network network="linkedin">
                                <i class="fa fa-linkedin"></i>
                            </network>
                            <network network="odnoklassniki">
                                <i class="fa fa-odnoklassniki"></i>
                            </network>
                            <network network="pinterest">
                                <i class="fa fa-pinterest"></i>
                            </network>
                            <network network="reddit">
                                <i class="fa fa-reddit"></i>
                            </network>
                            <network network="skype">
                                <i class="fa fa-skype"></i>
                            </network>
                            <network network="sms">
                                <i class="fa fa-commenting-o"></i>
                            </network>
                            <network network="telegram">
                                <i class="fa fa-telegram"></i>
                            </network>
                            <network network="twitter">
                                <i class="fa fa-twitter"></i>
                            </network>
                            <network network="vk">
                                <i class="fa fa-vk"></i>
                            </network>
                            <network network="weibo">
                                <i class="fa fa-weibo"></i>
                            </network>
                            <network network="whatsapp">
                                <i class="fa fa-whatsapp"></i>
                            </network>
                    </social-sharing>
                </div>

            </div>
        </div>
        <div class="single-post-container has-p-45-120">
          <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
            <div class="comment-container" v-if="ready">
                <vue-disqus shortname="laravel-vuejs-com"
                            :identifier="post.slug"
                            :title="post.title"
                            :url="post.url">
                </vue-disqus>
            </div>
          <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
        </div>
      <div class="has-bg">
          <div class="single-post-container">
            <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
            <app-featured title="Related Posts" :items="related.last"/>
            <no-ssr><adsbygoogle  class="adsbygoogle" :pageLevelAds="true" /></no-ssr>
          </div>
        </div>
    </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __ArticleItem from '@/components/shared/partials/elements/article-item'
import __AppFeatured from '@/components/web/partials/app-featured'
export default {
        components: {
            Breadcrumb: __Breadcrumb,
            ArticleItem: __ArticleItem,
            // AppJobsSwiper: () => import("@/components/web/partials/app-jobs-swiper"),
            AppFeatured: __AppFeatured,
            // AppCommentArea: () => import("@/components/web/partials/app-comment-area"),
        },
        name: 'post',
        computed: {
            post() {
                return this.$store.state.post.single
            },
            // was provided by the page component (pages/_slug) through $parent in Nuxt
            seo() {
                return {
                    title: this.post.title,
                    description: this.post.excerpt,
                    image: this.post.image_url,
                    url: this.post.url,
                }
            },
            hashTags() {
                return this.post.tags.map(tag => tag.name).join(',')
            },
            related() {
                return {
                    first: this.$store.state.post.single.related_posts.slice(0, 2),
                    second: this.$store.state.post.single.related_posts.slice(2, 4),
                    last: this.$store.state.post.single.related_posts.slice(4),
                }
            },
        },
        created () {
          this.$nextTick(function () {
            this.ready = true
          })
        },
        updated() {
          window.Prism && window.Prism.highlightAll();
        },
        mounted(){
          // plugins/prismjs (client only)
          import('@/lib/prism.js').then(({ default: Prism }) => Prism.highlightAll())
        },
        methods : {
        },
        data() {
            return {
              ready: false,
              breadcrumbsData: () => [
                    {
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: this.post.categories[0] ? this.post.categories[0].name : 'Category',
                        link: this.post.categories[0] ? {name: 'category-slug', params : {slug : this.post.categories[0].slug}} : null
                    },
                    {
                        name: this.post.title
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>

    .share-links
      &.is-flex
        justify-content center
        margin-bottom 40px
        margin-top 40px
        & >>>
          span
            cursor pointer
            margin-right 10px
            width 35px
            height 35px
            display flex
            align-items center
            justify-content center
            border 1px solid $secondary
            color #FFF
            border-radius 50%
            font-size 15px
            background-color $secondary
            &:last-child
              margin-right 0
    a.cs-btn
        padding 10px
        margin 10px
        border-radius 5px

    .single-post-container
        width 800px
        margin auto

    .image-container
        position relative
        display flex
        align-items flex-start
        width 870px

        .share-links
          transform rotate(90deg)
          position absolute
          left -255px
          top 210px
          display grid
          grid-template-columns repeat(3, 1fr)
          & >>>
            li
              margin-right 30px
              a
                display flex
                align-items center
                color $secondary
                font-size 12px
                font-weight 600
                letter-spacing 2px
                text-transform uppercase
                &.facebook
                  .fa
                      color #3b5998
                &.whatsapp
                  .fa
                    color #25D366
                &.twitter
                  .fa
                    color #00acee
                .fa
                    margin-right 10px
                    font-size 18px

        .actions-list
            display flex
            flex-direction column
            margin-left 30px

            li
                margin-bottom 10px

                a
                    display flex
                    align-items center
                    justify-content center
                    width 40px
                    height 40px
                    border-radius 50%
                    background-color rgba($secondary, .05)

                &.m-b-40
                    margin-bottom 40px

                &:last-child
                    margin-bottom 0

    .grid-container
        width calc(100% - 180px)
        margin auto

    .single-page-header
        padding 40px 0 30px

        .author
            .img-wrp
                width 40px
                height 40px
                display flex
                align-items center
                justify-content center
                background-color rgba(#384457, .05)
                border-radius 50%

                img
                    width 13px

            .name
                font-size 14px
                font-weight 600
                color #384457
                margin 0 20px 0 10px

            .role
                font-size 14px
                color rgba(#616d82, .8)
                font-weight 400

        .category
            .fa
                font-size 20px
                color $secondary
            h1
                font-size 12px
                letter-spacing 2px
                color $secondary
                font-weight 600
                text-transform uppercase
                margin-left 10px
                padding-top 3px

        .date-time
            .fa
                font-size 20px
                color $secondary
            span
                color rgba(#616d82, .8)
                font-size 14px
                font-weight 400
                display inline-block
                margin-left 10px
                padding-top 3px

    .post-content >>>
          h1
            & >>>
              font-size 28px
              color #384457
              font-weight 500
              margin-bottom 40px
          & >>>
              h1, h2, h3, h4, h5, h6
                  margin 25px 0 15px 0

          p, div
            font-size 18px
            line-height 34px
            color #2c2f34
            margin-bottom 20px
          & >>>
            img
              max-width 100%
              margin 20px 0
              height auto

          .thumbnail-area
              margin-bottom 20px
              width 800px

              .article-image
                  height 430px
                  margin-bottom 10px

              .copyright
                  font-size 14px
                  color rgba(#616d82, .8)
                  font-weight 400

          .grid-articles
              display grid
              grid-template-columns repeat(2, 1fr)
              grid-gap 20px
              margin 40px 0

          .pre-box
              padding 20px 0 40px

              .pre-header
                  background-color $primary
                  font-size 16px
                  font-weight 700
                  color $secondary
                  padding 3px 20px 0

              pre
                  background-color #384457
                  border-radius 0
                  border 0
                  color #FFF
                  font-size 16px
                  font-weight 400
                  font-family $family-sans-serif
                  padding 20px
                  height 327px
                  overflow-y hidden

          .swiper-area
              margin 40px 0 10px

              .heading
                  padding-bottom 20px

              ul >>>
                  padding-left 35px

                  li >>>
                      color #616d82
                      font-size 16px
                      padding-bottom 10px
                      display flex
                      align-items center
                      & >>>
                        a
                          color #616d82

                      &:before
                          content ""
                          width 6px
                          height 6px
                          background-color #616d82
                          border-radius 50%
                          margin-right 20px

                      &:last-child
                          padding-bottom 0

    .ads
        width 720px
        height 90px
        display flex
        align-items center
        justify-content center
        color #FFF
        background-color #3abbff
        margin 0 auto 40px
        font-size 24px

    .has-bg
      background-color rgba(#6936d3, .03)

      .featured-articles
        &:after
          display none

        & >>>
          .container
            width 100%
          .posts-grid
            grid-template-columns repeat(3, 1fr)

    .has-p-45-120
        padding 45px 0 120px

    .tags
        a
            border 1px solid $secondary
            display inline-block
            background #FFF
            -webkit-box-shadow 0 1px 1px 0 rgba(180,180,180,0.1)
            box-shadow 0 1px 1px 0 rgba(180,180,180,0.1)
            -webkit-transition all .1s ease-in-out
            -moz-transition all .1s ease-in-out
            -o-transition all .1s ease-in-out
            -ms-transition all .1s ease-in-out
            transition all .1s ease-in-out
            border-radius 2px
            margin 0 3px 6px 0
            padding 5px 10px
            &:hover
                border-color $primary
                color $secondary
                font-weight 500
    #content
        & >>>
            a.cs-btn.cs-btn-default
            a.cs-btn.cs-btn-Default
                padding 10px
                margin 2px

</style>
