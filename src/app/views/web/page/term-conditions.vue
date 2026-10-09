<template>
    <section class="terms-container">
        <breadcrumb :pages="breadcrumbsData" />
        <div class="small-container">
           <header>
                <div class="user-avatar">
                    <img src="@/assets/images/icons-page.svg" alt="LV">
                </div>
                <h1>Terms & Conditions</h1>
            </header>
            <div class="terms-desc">
                <p>Ah, those warm summer months are the best, aren’t they? And not just because they’re synonymous with lounging poolside or trekking down to the river with family and friends. There’s just something about this time of year that makes it perfect for setting and accomplishing goals, or tackling that special project that’s been at the back of your mind.</p>
                <p>I don’t know if it’s the heat, or the long days, or maybe just that extra touch of playfulness that seems to tickle folks between Spring and Fall. But there’s just something about the summertime that is perfect for finally cleaning out the garage, or taking a class, or picking up a new hobby.</p>
                <p>It’s an ideal time for learning some new code skills or building on the ones you already have. Think about it: If you set your mind to it, I mean really committed yourself to doing something awesome, how much could you learn in a single summer? What sorts of cool projects could you build in that time?</p>
                <p>If you have your sights set on learning some code and upping your web dev game, here are some great tips and tricks to help you on your way and keep you focused amid those many tantalizing and/or obligatory summertime distractions.</p>
                <p>If you have your sights set on learning some code and upping your web dev game, here are some great tips and tricks to help you on your way and keep you focused amid those many tantalizing and/or obligatory summertime distractions.</p>
                <p>Ah, those warm summer months are the best, aren’t they? And not just because they’re synonymous with lounging poolside or trekking down to the river with family and friends. There’s just something about this time of year that makes it perfect for setting and accomplishing goals, or tackling that special project that’s been at the back of your mind.</p>
                <div class="p-ads">
                    <div class="paragrpahs">
                        <p>I don’t know if it’s the heat, or the long days, or maybe just that extra touch of playfulness that seems to tickle folks between Spring and Fall. But there’s just something about the summertime that is perfect for finally cleaning out the garage, or taking a class, or picking up a new hobby.</p>
                        <p>It’s an ideal time for learning some new code skills or building on the ones you already have. Think about it: If you set your mind to it, I mean really committed yourself to doing something awesome, how much could you learn in a single summer? What sorts of cool projects could you build in that time?</p>
                        <p>If you have your sights set on learning some code and upping your web dev game, here are some great tips and tricks to help you on your way and keep you focused amid those many tantalizing and/or obligatory summertime distractions.</p>
                        <p>Here are some great tips and tricks to help you on your way and keep you focused amid those many tantalizing.</p>
                    </div>
                    <div class="ads">300x600</div>
                </div>
            </div>
            <ul class="meta">
                <li>
                    <span>
                        <img src="@/assets/images/icons-clock.svg" alt="LV">
                        3 Minutes ago.
                    </span>
                    <span>12 JUI 2018.</span>
                    <span>13:55</span>
                </li>
            </ul>
        </div>
        <div v-if="opened" class="pop-up">
            <h5>Are you sure?</h5>
            <span>Relax, it’s just a pop-up.</span>
            <div class="actions">
                <button @click="closePopUp" class="button cancel">Just Cancel</button>
                <button class="button">Yes I'm</button>
            </div>
        </div>
    </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
export default {
        name: "TermConditions",
        components: {
            Breadcrumb: __Breadcrumb
        },
        data() {
            return {
                opened: true,
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'Pages',
                        link: "/"
                    },
                    {
                        name: 'Terms & Conditions',
                        link: '/'
                    }
                ]
            }
        },
        mounted() {
            let body = document.getElementsByTagName('body')[0]
            body.classList.add('popup-opened')
        },
        methods: {
            closePopUp() {
                let body = document.getElementsByTagName('body')[0]
                body.classList.remove('popup-opened')
                this.opened = false
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .terms-container
        padding-bottom 120px
    header
        text-align center
        margin 60px 0 30px
        h1
            font-size 28px
            font-weight 600
            color $tertiary
            margin 10px 0
            line-height 1.4
    .terms-desc
        p
            color #616d82
            font-size 18px
            line-height 28px
            margin-bottom 20px
    .p-ads
        display flex
        justify-content space-between
        .paragrpahs
            width 460px
    .ads
        width 300px
        height 600px
        display flex
        align-items center
        justify-content center
        background-color #3abbff
        font-size 24px
        color $white
    .meta
        margin-top 60px
        display flex
        justify-content center
        span
            color #616d82
            font-size 14px
            padding-right 15px
            opacity .8
            img
                padding-right 5px
            &:last-child
                padding-right 0
    .pop-up
        position fixed
        top 50%
        left 50%
        transform translate(-50%, -50%)
        display flex
        align-items center
        justify-content center
        flex-direction column
        width 500px
        background-color #FFF
        height 196px
        h5
            font-size 20px
            color #384457
            font-weight 500
        span
            display block
            font-size 14px
            color #616d82
            opacity .8
            margin 10px 0 20px
        .button
            font-weight 500
            &.cancel
                background-color #384457
                color #FFF
                margin-right 17px
    .popup-opened
        .terms-container
            position relative
            &:after
                content ""
                position absolute
                top -20px
                left 0
                right 0
                bottom 0
                background-color rgba(#384457, .2)
                z-index -1
</style>
