<template>
    <div class="latest-profiles-widget">
        <heading>Companies trusted us</heading>
        <ul class="profiles">
            <li>
                <div class="avatar">
                    <img src="@/assets/images/telemadrid.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>TeleMadrid</h5>
                    <span>Madrid, Spain</span>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
            <li>
                <div class="avatar">
                    <img src="@/assets/images/telemadrid.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>TeleMadrid</h5>
                    <span>Madrid, Spain</span>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
            <li>
                <div class="avatar">
                    <img src="@/assets/images/telemadrid.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>TeleMadrid</h5>
                    <span>Madrid, Spain</span>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'AppCompaniesTrust'
    }

</script>

<style lang="stylus" scoped>
    .latest-profiles-widget
        margin-bottom 65px
    .profiles
        padding-top 25px
        li
            position relative
            display flex
            align-items center
            padding-bottom 25px
            &:last-child
                padding-bottom 0
            .avatar
                margin-right 10px
                border 1px solid #ebeef2
                width 60px
                height 60px
                border-radius 50%
                display flex
                align-items center
                justify-content center
                img
                   width 40px
                   height 40px
                   object-fit cover
            .profile-info
                h5
                    color #384457
                    font-size 16px
                    font-weight 500
                span
                    font-size 14px
                    color #384457
                    font-weight 500
</style>
