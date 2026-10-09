<template>
    <section class="about-us-area">
        <div class="container">
            <div class="about-us-container">
                <div class="about-caption">
                    <h1>Who We Are?</h1>
                    <p>The mission of Laravel & VueJs web site is to help web professionals up their skill and knowledge of Laravel & VueJs.</p>
                </div>
                <div class="about-us-men">
                    <img src="@/assets/images/about-svg.svg" alt="LV">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    export default {
        name: "AppAboutArea"
    }

</script>

<style lang="stylus" scoped>
    .about-us-area
        background-color #e5e7e6
        @media (max-width 768px)
          padding 20px 0
        .about-us-container
            display flex
            align-items center
            @media (max-width 768px)
              flex-direction column
            .about-caption
                width 450px
                @media (max-width 768px)
                  width 100%
                h1
                    color #384457
                    font-size 28px
                    font-weight 600
                    margin-bottom 20px
                p
                    color #384457
                    font-size 24px
                    margin-bottom 0
            .about-us-men
                width calc(100% - 450px)
                @media (max-width 768px)
                  width 100%
                img
                    width 100%
</style>
