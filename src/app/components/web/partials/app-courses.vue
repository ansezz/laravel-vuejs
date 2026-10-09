<template>
    <div class="courses-grid">
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
        <div class="course">
            <thumbnail />
            <div class="course-body">
                <h5>New Blade Directives Coming</h5>
                <h6>VueJs2 (1/15)</h6>
                <div class="actions">
                    <span>24 JUL 2018</span>
                    <span class="time">2:34</span>
                </div>
            </div>
            <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppCourses'
    }

</script>

<style lang="stylus" scoped>
    .courses-grid
        display grid
        grid-template-columns repeat(2, 1fr)
        grid-gap 20px
    .course
        position relative
        border 2px solid #ebeef2
        padding 20px
        .article-image
            width 310px
            height 167px
            margin-bottom 10px
    h5
        font-size 16px
        color #384457
        font-weight 500
        margin-bottom 10px
        line-height 1.4
    h6
        font-size 16px
        font-weight bold
        color $secondary
        margin-bottom 10px
    span
        color #616d82
        font-size 14px
        opacity .8
        &.time
            display flex
            align-items center
            justify-content center
            background-color rgba($secondary, .1)
            width 60px
            height 30px
    .actions
        display flex
        align-items center
        justify-content space-between
</style>
