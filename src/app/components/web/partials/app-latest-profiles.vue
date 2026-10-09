<template>
    <div class="latest-profiles-widget">
        <heading>Latest profiles</heading>
        <ul class="profiles">
            <li>
                <div class="avatar">
                    <img src="@/assets/images/profile-avatar.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>Ahmed Filali</h5>
                    <span>Developer</span>
                    <p>Joined a 2 mins ago</p>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
            <li>
                <div class="avatar">
                    <img src="@/assets/images/profile-avatar.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>Ahmed Filali</h5>
                    <span>Developer</span>
                    <p>Joined a 2 mins ago</p>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
            <li>
                <div class="avatar">
                    <img src="@/assets/images/profile-avatar.png" alt="LV">
                </div>
                <div class="profile-info">
                    <h5>Ahmed Filali</h5>
                    <span>Developer</span>
                    <p>Joined a 2 mins ago</p>
                </div>
                <nuxt-link aria-label="Link LV" to="/" class="is-absolute" />
            </li>
        </ul>
        <div class="check-more">
            <a href="javascript:;" class="button has-icon right-icon">
                <span>Check the others</span>
                <img src="@/assets/images/icons-arrow.png" alt="LV">
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppLatestProfiles'
    }

</script>

<style lang="stylus" scoped>
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
                padding-right 10px
                img
                    width 60px
                    height 60px
                    object-fit cover
                    border-radius 50%
            .profile-info
                h5
                    color #384457
                    font-size 16px
                    font-weight 500
                span
                    font-size 13px
                    color #384457
                    font-weight 500
                p
                    margin-top 5px
                    margin-bottom 0
                    font-size 14px
                    color #616d82
                    opacity .8
    .check-more
        margin-top 60px
        .button
            width 240px
            &.has-icon
                &.right-icon
                    img
                        transform rotate(180deg)
</style>
