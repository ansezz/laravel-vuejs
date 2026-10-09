<template>
    <section class="app-facts">
        <div class="small-container">
            <div class="simple-heading">
                <h2 class="text-center">Who We Are?</h2>
                <p>
                The mission of Laravel & VueJs web site is to help web professionals up their skill and knowledge of Laravel & VueJs.
                We provide articles and tutorials through our blog, and a weekly newsletter to keep you up-to-date with the best content from the wider Laravel & VueJs community.
                </p>

                <p>
                    Our online community has now grown to thousands of developers passionate about Laravel & VueJs. You join us in the following ways:
                    •  Laravel & VueJs   <a href="https://www.facebook.com/groups/LaravelVueJs/"  target="_blank" rel="noreferrer"   aria-label="external link "   >Facebook group</a>
                    You can also follow Laravel & VueJs on social media:
                </p>
                <ul class="social-media">
                    <li><a href="https://www.facebook.com/LaravelVueJs"  target="_blank" rel="noreferrer"   aria-label="external link "    name="facebook">Facebook</a>
                    </li>
                    <li><a href="https://twitter.com/LaravelVueJs"  target="_blank" rel="noreferrer"   aria-label="external link "    name="Twitter">Twitter</a></li>
                    <li><a href="https://www.linkedin.com/in/laravel-vuejs/"  target="_blank" rel="noreferrer"   aria-label="external link "
                           name="LinkedIn">LinkedIn</a></li>
                    <li><a href="http://instagram.com/LaravelVueJs"  target="_blank" rel="noreferrer"   aria-label="external link "    name="Instagram">Instagram</a></li>
                </ul>

                <h2 class="text-center">Advertise with us</h2>
                <p>
                We offer a great way to expose your brand to web development professionals by offering a variety of advertising options across our newsletter and highly active social media assets.
                Email {{ contactEmail }} to inquire about rates.
                </p>
                <h2 class="text-center">Contribute to the blog</h2>
                <p>
                We're always on the lookout for new contributors to the Laravel & VueJs blog to ensure our articles represent a diverse set of skills and experiences.
                For authors, we can offer you a great way to expose your article to thousands of Laravel & VueJs enthusiasts from around the world, in addition to powerful backlinks to your own web assets. If you're interested in publishing an article, get in touch at {{ contactEmail }} .
                </p>
                    <h2 class="text-center">Laravel & VueJs freelance and remote jobs</h2>
                <p>
                    Are you looking for (or offering) Laravel & VueJs freelance projects or remote jobs? Join and post for free in our Laravel & VueJs - <a href="https://www.facebook.com/groups/Laravel.Vuejs.Jobs"  target="_blank" rel="noreferrer"   aria-label="external link "   >Freelance & Remote Jobs Group</a>
                </p>
            </div>
            <ul class="facts-grid" v-if="false">
                <li class="fact">
                    <div class="fact-img">
                        <img src="@/assets/images/fac-1.png" alt="LV">
                    </div>
                    <div class="fact-info">
                        <span class="number">+3242</span>
                        <h5>Courses</h5>
                    </div>
                </li>
                <li class="fact">
                    <div class="fact-img">
                        <img src="@/assets/images/fac-2.png" alt="LV">
                    </div>
                    <div class="fact-info">
                        <span class="number">+546,879</span>
                        <h5>Minutes of Video</h5>
                    </div>
                </li>
                <li class="fact">
                    <div class="fact-img">
                        <img src="@/assets/images/fac-3.png" alt="LV">
                    </div>
                    <div class="fact-info">
                        <span class="number">+1,000,000</span>
                        <h5>Month Visites</h5>
                    </div>
                </li>
                <li class="fact">
                    <div class="fact-img">
                        <img src="@/assets/images/fac-4.png" alt="LV">
                    </div>
                    <div class="fact-info">
                        <span class="number">+6,698,420</span>
                        <h5>Persons Satisfied</h5>
                    </div>
                </li>
            </ul>
            <div class="links-action">
                <a href="https://www.facebook.com/groups/Laravel.Vuejs.Jobs" class="button"  target="_blank" rel="noreferrer"   aria-label="external link "   >Jobs offers</a>
                <span>Or</span>
                <nuxt-link aria-label="Link LV" to="/" class="button">Our news feed</nuxt-link>
            </div>
        </div>
    </section>
</template>

<script>
import { CONTACT_EMAIL } from '@/config/site.js'
    export default {
        data: () => ({ contactEmail: CONTACT_EMAIL }),
        name: "AppFacts"
    }

</script>

<style lang="stylus" scoped>
    .app-facts
        padding 120px 0
        @media (max-width 768px)
          padding 60px 0
    .facts-grid
        display grid
        grid-template-columns repeat(4, 1fr)
        margin-bottom 60px
        .fact-img
            margin-bottom 15px
            height 74px
        span
            color #384457
            font-size 14px
            font-weight 600
        h5
            font-size 16px
            font-weight 700
            color $secondary
    .links-action
        display flex
        align-items center
        justify-content center
        @media (max-width 768px)
          flex-direction column
          .button
            width 100%
        span
            font-size 18px
            color #616d82
            display block
            margin 0 20px
            line-height 1.56
    .social-media
      display flex
      align-items center
      margin-bottom 20px
      padding-bottom 20px
      border-bottom 1px solid #EEE
      li
        padding-right 20px
        &:last-child
          padding-right 0
        a
          font-size 16px
          color #311d5a
</style>
