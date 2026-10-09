<template>
    <section class="articles-swiper">
        <div v-swiper:mySwiper="articlesSwiper" class="swiper-container">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="item in featured" :key="item.id">
                    <div class="article-box">
                        <thumbnail  :src="item.image_url" :alt="item.title" :to="{ name: 'slug', params: { slug: item.slug }}"/>
                        <div class="article-info">
                          <nuxt-link aria-label="Link LV" :to="{ name: 'slug', params: { slug: item.slug }}">
                            <h4>{{item.title}}</h4>
                          </nuxt-link>
                            <ul class="cats">
                                <li><span v-if="item.categories[0]">In
                                    <strong>
                                        <nuxt-link aria-label="Link LV"
                                                :to="{name: 'category-slug', params : {slug : item.categories[0].slug}}">
                                            {{item.categories[0].name}}
                                        </nuxt-link>
                                    </strong>.</span> Last update: {{item.time_ago}}.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="navigation-buttons">
                <div class="swiper-button-next-slider">
                    <i class="fa fa-angle-up"></i>
                </div>
                <div class="swiper-button-prev-slider">
                    <i class="fa fa-angle-down"></i>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    export default {
        name: 'AppArticlesSwiper',
      computed: {
        featured() {
          return this.$store.state.post.featured.data
        },
      },
        data() {
            return {
                articlesSwiper: {
                    slidesPerView: 1,
                    loop: true,
                    speed: 400,
                    autoplay: {
                        delay: 5000,
                    },
                    spaceBetween: 0,
                    direction: 'vertical',
                    navigation: {
                        nextEl: ".swiper-button-next-slider",
                        prevEl: ".swiper-button-prev-slider"
                    }
                }
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .articles-swiper
        width calc(100% - 490px)
        overflow hidden
        .article-image
            height 270px
            background-color rgba($white, .1)
            >>> .sk-cube
                    &:before
                        background-color #FFF
    .swiper-container
        height 410px
        .swiper-wrapper
            width calc(100% - 40px)
            .swiper-slide
                height 410px !important
        .article-info
            margin-top 30px
            h4
                font-size 28px
                font-weight 400
                color #FFF
                margin-bottom 10px
                line-height 1.4
            .cats
                li
                    font-size 14px
                    color #FFF
                    font-weight 400
                    opacity .8
        .navigation-buttons
            position absolute
            top 0
            right 0
            width 20px
            display flex
            flex-direction column
            div
                width 20px
                height 20px
                display flex
                align-items center
                justify-content center
                color $secondary
                background-color $primary
                border-radius 50%
                font-size 15px
                font-weight 600
                cursor pointer
                z-index 1
                &.swiper-button-next-slider
                    margin-bottom 20px
                    .fa
                        margin-left 1px
                        margin-bottom 3px
</style>
