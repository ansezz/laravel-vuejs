<template>
    <div class="create-job-form">
        <header>
            <div class="user-avatar">
                <img src="@/assets/images/icons-jobs.svg" alt="LV">
            </div>
            <h1>Add Job</h1>
            <p>We have your people.</p>
        </header>
        <form action="/" method="post">
            <h5 class="text-center">In a few seconds!</h5>
            <div class="form-group">
                <input type="text" name="job-name" class="form-control has-custom" placeholder="I Need A.." />
            </div>
            <div class="form-group has-select">
                <select name="for" class="form-control has-custom">
                    <option value="-1">For</option>
                    <option value="1">Ui-Ux Designer</option>
                    <option value="2">Laravel Developer</option>
                </select>
            </div>
            <div class="form-group tags-input">
                <div class="input-text">With skill Like</div>
                <no-ssr><vue-tags-input v-model="tag" :tags="tags" @tags-changed="newTags => tags = newTags" /></no-ssr>
            </div>
            <div class="form-group has-select has-m-b">
                <select name="technology" class="form-control has-custom">
                    <option value="-1">technology</option>
                    <option value="1">Ui-Ux Designer</option>
                    <option value="2">Laravel Developer</option>
                </select>
            </div>
            <div class="form-group has-select">
                <select name="level" class="form-control has-custom">
                    <option value="-1">level</option>
                    <option value="1">Ui-Ux Designer</option>
                    <option value="2">Laravel Developer</option>
                </select>
            </div>
            <div class="form-group has-select">
                <select name="salary" class="form-control has-custom">
                    <option value="-1">Salary</option>
                    <option value="1">Ui-Ux Designer</option>
                    <option value="2">Laravel Developer</option>
                </select>
            </div>
            <div class="form-group has-select has-m-b-25">
                <select name="apply-by" class="form-control has-custom">
                    <option value="-1">Apply by link or email</option>
                    <option value="1">Ui-Ux Designer</option>
                    <option value="2">Laravel Developer</option>
                </select>
            </div>
            <div class="checking has-m-b">
                <input type="checkbox" id="checked" class="check">
                <label for="checked">Same company’s region</label>
            </div>
            <div class="form-group has-short-text">
                <textarea class="form-control has-custom no-resize" rows="8" placeholder="Job’s description"></textarea>
                <img src="@/assets/images/icons-short-text.svg" alt="LV">
            </div>
            <div class="form-actions">
                <button class="button" type="submit" name="go">go ahead</button>
                <nuxt-link aria-label="Link LV" to="/auth/signup" class="button no-background">Comeback, it was a mistake.</nuxt-link>
            </div>
            <div class="notification">
                <span>*You need to wait a few hours before we accept your offer.</span>
            </div>
        </form>
        <footer class="text-center">
            <nuxt-link aria-label="Link LV" to="/page/term-conditions">Check the guideline and Terms.</nuxt-link>
        </footer>
    </div>
</template>

<script>
    // @johmun/vue-tags-input (Vue 2, client-only plugin) -> its Vue 3 port.
    import { VueTagsInput } from '@vojtechlanka/vue-tags-input'
    import '@vojtechlanka/vue-tags-input/style.css'

    export default {
        name: "AppCreateJob",
        components: { VueTagsInput },
        data() {
            return {
                tag: '',
                tags: ['Ui-Ux', 'Laravel'],
            }
        }
    }
</script>
<style lang="stylus" scoped>
    .create-job-form
        width 580px
        margin 60px auto 0
        header
            text-align center
            margin-bottom 40px
            h1
                font-size 28px
                font-weight 600
                color $tertiary
                margin 10px 0
                line-height 1.4
            p
                margin-bottom 0
                font-size 14px
                color #616d82
                opacity .8
        footer
            a
                color $secondary
                font-size 12px
                font-weight 600
                text-transform uppercase
                letter-spacing 2px
        form
            border 2px solid #ebeef2
            padding 40px
            margin-bottom 60px
            h5
                font-size 18px
                color #616d82
                line-height 28px
                font-weight 400
                margin-bottom 40px
            .checking
                &.has-m-b
                        margin-bottom 25px
            .form-group
                margin-bottom 10px
                select
                    -webkit-appearance none
                    -moz-appearance    none
                   appearance          none
                &.has-select
                    position relative
                    &.has-m-b-25
                        margin-bottom 25px
                    &.has-m-b
                        margin-bottom 30px
                    &:after
                        content "\f0d7"
                        font-family "FontAwesome"
                        color $secondary
                        position absolute
                        top 50%
                        right 20px
                        transform translateY(-50%)
                &.has-short-text
                    position relative
                    textarea
                        height 160px
                    img
                        position absolute
                        bottom 10px
                        right 10px
        .form-actions
            margin 40px 0
            display flex
            align-items center
            justify-content space-between
            .no-background
                color $secondary
        .notification
            span
                color #616d82
                font-size 14px
        .tags-input
            display flex
            align-items center
            height 40px
            background-color rgba(105,54,211,0.03)
            padding-left 20px
            .input-text
                text-transform uppercase
                font-size 12px
                font-weight 600
                letter-spacing 2px
                color $secondary
                padding-right 15px
                border-right 1px solid #ebeef2
            .vue-tags-input
                background-color transparent
                padding-left 10px
                width calc(100% - 139px)
                >>> .ti-input
                        border 0
                >>> .ti-tag
                        background-color $secondary
                        border-radius 0
                        height 30px
                        margin 0 4px 0 0
                        font-size 10px
                        text-transform uppercase
                        font-weight 600
                        letter-spacing 2px
                        padding 0 10px
                        .ti-actions
                            font-size .8em
                >>> .ti-new-tag-input-wrapper
                        .ti-new-tag-input
                            background-color transparent
                            font-size 12px
                            text-transform uppercase
                            font-weight 500
</style>
