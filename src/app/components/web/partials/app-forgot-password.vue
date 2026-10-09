<template>
    <section>
        <div class="forgot-password-form">
            <header>
                <div class="user-avatar">
                    <img src="@/assets/images/icons-user.png" alt="LV">
                </div>
                <h1>Forgot Password</h1>
                <p>Reset your password</p>
            </header>
            <form action="/">
                <h5 class="text-left">It happens. To reset your password, enter the email address or user name you use to sign in.</h5>
                <div class="form-group m-20">
                    <input type="email" name="email" class="form-control has-custom" placeholder="E-mail or user name" />
                </div>
                <div class="form-actions">
                    <button class="button" type="submit" name="go">get reset link</button>
                </div>
            </form>
            <footer class="text-center">
                <nuxt-link aria-label="Link LV" to="/auth/login" class="forgot-password">
                    <img src="@/assets/images/icons-next.svg" alt="LV">
                    <span>was a mistake take me back</span>
                </nuxt-link>
            </footer>
        </div>
    </section>
</template>


<script>
export default {
  name: "AppForgotPassword",
  props: {}
}
</script>

<style lang="stylus" scoped>
    .forgot-password-form
        width 580px
        margin auto
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
            .form-group
                &.m-20
                    margin-bottom 20px
            .form-actions
                display flex
                align-items center
                justify-content space-between
        footer
            .forgot-password
                display flex
                align-items center
                justify-content center
                color $secondary
                font-size 12px
                font-weight 600
                text-transform uppercase
                letter-spacing 2px
                img
                    margin-right 10px
                    transform rotate(180deg)
                span
                    height 20px
                    line-height 20px
</style>
