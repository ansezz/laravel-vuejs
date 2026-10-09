<template>
    <div>
        <div class="simple-heading text-center">
            <h2>Our Happy Team</h2>
            <p class="small-p">Meet the founders and the executive members.</p>
        </div>
        <ul class="team-grid">
            <li class="member">
                <div class="member-avatar">
                    <img src="@/assets/images/big-brackets.png" alt="LV">
                </div>
                <div class="member-info">
                    <nuxt-link aria-label="Link LV" to="/" class="social-media-link">
                        <img src="@/assets/images/icons-linkedin.png" alt="LV">
                    </nuxt-link>
                    <span class="member-name">Anass Ez-Zouaine</span>
                    <h5>Founder</h5>
                </div>
            </li>
            <li class="member">
                <div class="member-avatar">
                    <img src="@/assets/images/big-brackets.png" alt="LV">
                </div>
                <div class="member-info">
                    <nuxt-link aria-label="Link LV" to="/" class="social-media-link">
                        <img src="@/assets/images/icons-linkedin.png" alt="LV">
                    </nuxt-link>
                    <span class="member-name">John Smith</span>
                    <h5>COO & CFO</h5>
                </div>
            </li>
            <li class="member">
                <div class="member-avatar">
                    <img src="@/assets/images/big-brackets.png" alt="LV">
                </div>
                <div class="member-info">
                    <nuxt-link aria-label="Link LV" to="/" class="social-media-link">
                        <img src="@/assets/images/icons-linkedin.png" alt="LV">
                    </nuxt-link>
                    <span class="member-name">Ely Wahib</span>
                    <h5>Creative Director</h5>
                </div>
            </li>
            <li class="member">
                <div class="member-avatar">
                    <img src="@/assets/images/big-brackets.png" alt="LV">
                </div>
                <div class="member-info">
                    <nuxt-link aria-label="Link LV" to="/" class="social-media-link">
                        <img src="@/assets/images/icons-linkedin.png" alt="LV">
                    </nuxt-link>
                    <span class="member-name">Lamya Alaoui</span>
                    <h5>CPO</h5>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "AppTeam"
    }

</script>

<style lang="stylus" scoped>
    .team-grid
        display grid
        grid-template-columns repeat(4, 1fr)
    .member-avatar
        width 160px
        height 160px
        background-color rgba(56, 68, 87, .05)
        display flex
        align-items center
        justify-content center
        border-radius 50%
        margin auto
    .member-info
        text-align center
        margin-top -20px
        .social-media-link
            width 40px
            height 40px
            display flex
            align-items center
            justify-content center
            background-color $primary
            border-radius 50%
            margin 0 auto 20px
        .member-name
            font-size 16px
            font-weight 500
            color #384457
        h5
            margin-top 5px
            font-size 16px
            color $secondary
            font-weight bold
</style>
