<template>
    <div class="single-job-container">
        <breadcrumb :pages="breadcrumbsData" />
        <div class="container">
            <div class="post-header is-flex">
                <div class="wrap is-flex">
                    <div class="thumb is-flex">
                        <img src="@/assets/images/single-profile-icon.png" alt="LV">
                    </div>
                    <h5>Beats Electronics</h5>
                    <span>Casablanca, Morocco</span>
                </div>
                <div class="wrap is-flex">
                    <i class="fa fa-folder-o"></i>
                    <h6>JEE</h6>
                </div>
                <div class="wrap">
                    <ul class="is-flex">
                        <li>
                            <img src="@/assets/images/icons-clock.svg" alt="LV">
                        </li>
                        <li>
                            <span>3 Minutes ago. 12 JUI 2018. 13:55</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="medium-container has-flex">
            <ul class="share-links">
                <li>
                    <a href="#">
                        <img src="@/assets/images/icons-facebook-light.svg" alt="LV">
                        <span>Facebook</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <img src="@/assets/images/icons-twitter-light.svg" alt="LV">
                        <span>Twitter</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <img src="@/assets/images/icons-whats-app.svg" alt="LV">
                        <span>Whats App</span>
                    </a>
                </li>
            </ul>
            <div class="single-job-body">
                <h1>Lightroom Artist for Instagram Pictures</h1>
                <p>It’s an ideal time for learning some new code skills or building on the ones you already have. Think about it: If you set your mind to it, I mean really committed yourself to doing something awesome, how much could you learn in a single summer? What sorts of cool projects could you build in that time?</p>
                <h4>Is sketching your thing? Then you’re the one we need!</h4>
                <p>We are looking for a creative soul. An individual who dreams of sketches and prints and communicates the best through visuals. To us, your creative mind, your ideas and your passion is what matters most – and it’s awesome if you have team spirit and a keen eye for the finished product.</p>
                <p>Maybe you’re in to graffiti? Maybe you’re a graphic designer with a passion for drawing? Maybe you have a completely different background – that is less important to us. What matters is that you possess an understanding and a passion for the finished product.</p>
                <h4>The position:</h4>
                <p>Maybe you’re in to graffiti? Maybe you’re a graphic designer with a passion for drawing? Maybe you have a completely different background – that is less important to us. What matters is that you possess an understanding and a passion for the finished product.</p>
                <ul class="list">
                    <li>- Lots of sketching – by hand or computer, that’s up to you</li>
                    <li>- All kinds of prints</li>
                    <li>- Close collaboration with suppliers, print houses and graphic designers</li>
                    <li>- Researching graphical trends and developing mood boards.</li>
                </ul>
                <p>Basically, it’s about sketching, creating and generating ideas. Thinking outside the box.
                You become part of the process from end to end – from ideas to the finished product is created in collaboration with our suppliers and the Design, Buying and Sales departments. You will be working with dedicated and passionate colleagues, who are already looking forward to bringing your creations to life in our styles.</p>
                <h4>We look forward to hearing from you!</h4>
                <p>If you have questions about the position, you are welcome to contact Design- & Buying Manager Randi Frydendal Møller on +45 25 51 34 92. </p>
            </div>
            <ul class="actions-list">
                <li><a href="#"><img src="@/assets/images/zoom-in-colored.svg" alt="LV"></a></li>
                <li class="m-b-40"><a href="#"><img src="@/assets/images/zoom-out.svg" alt="LV"></a></li>
                <li><a href="#"><img src="@/assets/images/icons-star-2.svg" alt="LV"></a></li>
            </ul>
        </div>
        <div class="tags-support">
            <div class="tags-container">
                <div class="medium-container">
                    <ul class="tags">
                        <li>
                            <nuxt-link aria-label="Link LV" to="/">Full-time</nuxt-link>
                        </li>
                        <li>
                            <nuxt-link aria-label="Link LV" to="/">Casablanca</nuxt-link>
                        </li>
                        <li>
                            <nuxt-link aria-label="Link LV" to="/">Full-time</nuxt-link>
                        </li>
                        <li>
                            <nuxt-link aria-label="Link LV" to="/">Full-time</nuxt-link>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="support-container">
                <div class="medium-container">
                    <h3>Need help? Check the our support center.</h3>
                    <div class="apply-now">
                        <nuxt-link aria-label="Link LV" to="/">
                            <span>Apply now</span>
                            <img src="@/assets/images/icons-arrow.png" alt="LV">
                        </nuxt-link>
                    </div>
                </div>
            </div>
        </div>
        <div class="medium-container">
            <app-jobs-swiper />
        </div>
        <div class="medium-container">
            <div class="ads is-flex">720x90</div>
        </div>
        <section class="has-bg">
            <div class="medium-container">
                <heading>Featured Posts</heading>
                <div class="posts-grid">
                    <article-item v-for="item in featured"
                        :title="item.title"
                        :image="item.image_url"
                        :key="item.id"
                        :to="{ name: 'slug', params: { slug: item.slug }}"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __ArticleItem from '@/components/shared/partials/elements/article-item'
import __AppJobsSwiper from '@/components/web/partials/app-jobs-swiper'
export default {
        name: "SingleJob",
        components: {
            Breadcrumb: __Breadcrumb,
            ArticleItem: __ArticleItem,
            AppJobsSwiper: __AppJobsSwiper
        },
        computed: {
            featured() {
                return this.$store.state.post.featured.data
            },
        },
        data() {
            return {
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'Jobs',
                        link: "/"
                    },
                    {
                        name: 'Lightroom Artist for Instagram Pictures',
                        link: "/"
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .post-header
        padding-top 40px
    .thumb
        width 40px
        height 40px
        border 1px solid #ebeef2
        border-radius 50%
        margin-right 10px
        img
            width 30px
            height 30px
            margin auto
    .wrap
        h5
            font-size 14px
            color #384457
            font-weight 600
            margin-right 10px
        span
            color #616d82
            opacity .8
            font-size 14px
        h6
            padding-top 5px
            font-size 12px
            font-weight 600
            letter-spacing 2px
            color $secondary
            margin-left 10px
          .fa
            font-size 20px
            color $secondary
            margin-top 5px
        li
            img
                margin-right 10px
            span
                display block
                padding-top 2px
                color #616d82
                opacity .8
                font-size 14px
    .has-bg
        background-color rgba($secondary, .03)
        padding 45px 0
    .posts-grid
        display grid
        grid-template-columns repeat(3, 1fr)
        grid-gap 30px 10px
        padding-top 25px
    .medium-container
        position relative
        &.has-flex
            padding-top 30px
            display flex
            justify-content space-between
        .share-links
            transform rotate(90deg)
            position absolute
            left -255px
            top 315px
            display grid
            grid-template-columns repeat(3, 1fr)
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
                    img
                        margin-right 10px
        .actions-list
            display flex
            flex-direction column
            padding-top 75px
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
        .single-job-body
            width 800px
            h1
                color #384457
                font-size 28px
                font-weight 500
                margin-bottom 40px
                text-align center
            p, li
                color #616d82
                font-size 18px
                line-height 28px
                margin-bottom 20px
            li
                margin-bottom 0
            ul
                margin-bottom 20px
            h4
                color #384457
                font-size 24px
                margin-bottom 20px
                margin-top 40px
                font-weight 400
    .tags-container
        background-color rgba($secondary, .03)
        padding 5px 0
        .tags
            display flex
            align-items center
            li
                padding-right 10px
                &:last-child
                    padding-right 0
                a
                    display block
                    background-color rgba($secondary, .1)
                    padding 7px 15px
                    font-size 12px
                    font-weight 600
                    color $secondary
                    letter-spacing 2px
                    text-transform uppercase
    .support-container
        background-color $primary
        padding 25px 0
        .medium-container
            display flex
            align-items center
            justify-content space-between
        h3
            font-size 12px
            font-weight 600
            color $secondary
            letter-spacing 2px
            text-transform uppercase
        .apply-now
            a
                font-size 12px
                font-weight 600
                color $secondary
                letter-spacing 2px
                text-transform uppercase
                img
                    transform rotate(180deg)
                    margin-left 10px
    .ads
        background-color #3abbff
        height 90px
        width 720px
        margin auto auto 40px
        font-size 24px
        color #FFF
        justify-content center
    .tags-support
        margin-top 40px
</style>
