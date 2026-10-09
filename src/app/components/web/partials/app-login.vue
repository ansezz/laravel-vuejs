<template>
    <div class="login-form">
        <header>
            <div class="user-avatar">
                <img src="@/assets/images/icons-user.png" alt="LV">
            </div>
            <h1>Login</h1>
            <p>Welcome back, mate.</p>
        </header>
        <form @submit.prevent="submitLogin" :class="{'is-loading' : loading}">
            <h5 class="text-center">Login to your account</h5>
            <div class="form-group">
                <input type="email"
                       name="email"
                       class="form-control has-custom"
                       placeholder="E-mail or user name"
                       v-model="form.email"
                />
            </div>
            <div class="form-group m-20">
                <input type="password" class="form-control has-custom" placeholder="Password" v-model="form.password"/>
            </div>
            <div class="checking">
                <input type="checkbox" id="checked" class="check" v-model="form.remember_me">
                <label for="checked">Remember me next time</label>
            </div>
            <div class="alert" :class="'alert-'+message.type" role="alert" v-if="message.show">
                {{message.content}}
            </div>
            <div class="form-actions">
                <button class="button" type="submit" name="go">go ahead</button>
                <nuxt-link aria-label="Link LV" to="/auth/signup" class="button no-background">I don’t an account yet</nuxt-link>
            </div>
        </form>
        <footer class="text-center">
            <nuxt-link aria-label="Link LV" to="/auth/forgot-password" class="forgot-password">What? you forgot your password?</nuxt-link>
        </footer>
    </div>
</template>

<script>
    import {mapActions} from 'vuex'

    export default {
        name: "LoginApp",
        data() {
            return {
                message: {
                    show: false,
                    content: '',
                    type: ''
                },
                loading: false,
                form: {
                    email: '',
                    password: '',
                    remember_me: false,
                }
            }
        },
        props: {},
        methods: {
            ...mapActions({
                login: 'auth/LOGIN',
            }),
            submitLogin() {
                this.loading = true;
                this.message.show = false;
                this.login(this.form).then((data) => {
                    if (!data) {
                        this.message.content = "Email or Password incorrect";
                        this.message.type = 'danger'
                        this.message.show = true
                    } else {
                        this.$toast.success('Successfully logged in')
                    }
                }).finally(() => {
                    this.loading = false;
                })
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .login-form
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
                margin-bottom 10px

                &.m-20
                    margin-bottom 20px

            .form-actions
                display flex
                align-items center
                justify-content space-between

                .no-background
                    color $secondary

        footer
            .forgot-password
                color $secondary
                font-size 12px
                font-weight 600
                text-transform uppercase
                letter-spacing 2px
</style>
