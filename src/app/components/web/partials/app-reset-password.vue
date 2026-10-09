<template>
    <section>
        <div class="reset-password-form">
            <header>
                <div class="user-avatar">
                    <img src="@/assets/images/icons-user.png" alt="LV">
                </div>
                <h1>Enter New Password</h1>
                <p>Ttry to not lose it again.</p>
            </header>
            <form action="/">
                <h5 class="text-center">Try to use strong password : <span>RE5@-Kjh/bvRET</span></h5>
                <div class="form-group is-relative">
                    <input type="password" name="password" class="form-control has-custom" placeholder="Password" />
                    <div class="error-form">
                        <img @click="openedError" src="@/assets/images/icons-incorrect.svg" alt="LV">
                        <h6 v-if="errorOpened">Something went wrong!</h6>
                    </div>
                </div>
                <div class="form-group">
                    <input type="password" name="confirm-password" class="form-control has-custom" placeholder="again, to make sure you got it" />
                </div>
                <ul class="form-status">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <div class="form-actions">
                    <button class="button" type="submit" name="reset-account">Reset Account</button>
                </div>
            </form>
        </div>
    </section>
</template>


<script>
export default {
    name: "AppResetPassword",
    data() {
        return {
            errorOpened: false
        }
    },
    methods: {
        openedError() {
            this.errorOpened = !this.errorOpened
            console.log(this.errorOpened)
        }
    },
    props: {}
}
</script>

<style lang="stylus" scoped>
    .reset-password-form
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
            h5
                font-size 18px
                color #616d82
                line-height 28px
                font-weight 400
                margin-bottom 40px
            .form-group
                margin-bottom 10px
                &.is-relative
                    position relative
            .error-form
                position: absolute
                top 0
                right:0
                height 100%
                display flex
                align-items center
                justify-content center
                width 60px
                img
                    cursor pointer
                h6
                    position absolute
                    top -40px
                    width 197px
                    right 0
                    display flex
                    align-items center
                    justify-content center
                    background-color #ffdd00
                    height 40px
                    font-size 14px
                    font-weight 600
                    color $tertiary
                    &:after
                        content ""
                        height 10px
                        width 10px
                        background-color #ffdd00
                        transform rotate(135deg)
                        position absolute
                        bottom -5px
                        right 25px
            .form-actions
                display flex
                align-items center
                justify-content space-between
</style>
